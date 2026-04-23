const Expense = require("../models/expense.model");
const Group = require("../models/group.model");
const User = require("../models/user.model");
const Settlement = require("../models/settlement.model");
const simplifyDebts = require("../utils/debt-simplifier");
const { sendEmail } = require("../utils/email.service");
const { newExpenseTemplate, debtSettledTemplate } = require("../utils/emailTemplates");
const { FRONTEND_URL, buildFrontendRedirectUrl } = require("../config/app.config");

// Responde los errores de forma uniforme con el mismo esquema JSON.
const respondError = (res, status, message) =>
  res.status(status).json({ ok: false, message });

// Normaliza la lista de usuarios eliminando duplicados y respetando el formato del backend.
const normalizeParticipants = (participants) => {
  if (!participants) return [];
  const list = Array.isArray(participants) ? participants : [participants];
  return [...new Set(list.map((p) => p && p.toString()).filter(Boolean))];
};

// Verifica que un usuario con el ID dado pertenezca al grupo.
const isGroupMember = (group, userId) =>
  group.members.some((member) => member._id.toString() === userId);

// Calcula el estado actual de las deudas del grupo incluyendo gastos y liquidaciones.
const getGroupBalanceSnapshot = async (groupId) => {
  const group = await Group.findById(groupId).populate("members", "name email");
  if (!group) {
    return { group: null, balances: [] };
  }

  const expenses = await Expense.find({ group: groupId });
  const settlements = await Settlement.find({ group: groupId });

  const balances = {};
  group.members.forEach((member) => {
    balances[member._id.toString()] = 0;
  });

  expenses.forEach((exp) => {
    if (!Array.isArray(exp.participants) || exp.participants.length === 0) return;

    const amountPerPerson = exp.amount / exp.participants.length;
    const payerId = exp.paidBy.toString();

    exp.participants.forEach((p) => {
      const participantId = p.toString();
      if (participantId !== payerId) {
        balances[participantId] -= amountPerPerson;
        balances[payerId] += amountPerPerson;
      }
    });
  });

  settlements.forEach((settlement) => {
    const fromId = settlement.from.toString();
    const toId = settlement.to.toString();

    if (balances[fromId] === undefined || balances[toId] === undefined) return;

    balances[fromId] += settlement.amount;
    balances[toId] -= settlement.amount;
  });

  return { group, balances: simplifyDebts(balances, group.members) };
};


// CREAR GASTO: valida campos, guarda el gasto, actualiza el grupo y notifica por email.
exports.createExpense = async (req, res, next) => {
  try {
    const { groupId, description, amount, paidBy, participants } = req.body;
    const amountValue = Number(amount);

    if (!groupId || !description || !paidBy) {
      return respondError(res, 400, "Todos los campos obligatorios deben estar presentes");
    }

    if (!amountValue || amountValue <= 0) {
      return respondError(res, 400, "El monto debe ser mayor que cero");
    }

    const group = await Group.findById(groupId).populate("members", "email name");
    if (!group) {
      return respondError(res, 404, "Grupo no encontrado");
    }

    if (!isGroupMember(group, req.userId)) {
      return respondError(res, 403, "No puedes crear gastos en un grupo al que no perteneces");
    }

    if (!isGroupMember(group, paidBy)) {
      return respondError(res, 400, "El pagador debe ser usuario del grupo");
    }

    const normalizedParticipants = normalizeParticipants(participants);
    if (normalizedParticipants.length === 0) {
      return respondError(res, 400, "Debes seleccionar al menos un usuario");
    }

    const invalidParticipant = normalizedParticipants.find(
      (participantId) => !isGroupMember(group, participantId)
    );

    if (invalidParticipant) {
      return respondError(res, 400, "Todos los usuarios deben formar parte del grupo");
    }

    const finalParticipants = normalizedParticipants.includes(paidBy)
      ? normalizedParticipants
      : [...normalizedParticipants, paidBy];

    const receipt = req.file ? `/uploads/receipts/${req.file.filename}` : null;

    const expense = await Expense.create({
      group: groupId,
      description: description.trim(),
      amount: amountValue,
      paidBy,
      participants: finalParticipants,
      receipt
    });

    await Group.findByIdAndUpdate(groupId, {
      $push: { expenses: expense._id }
    });

    const creator = await User.findById(paidBy);

    const groupUrl = buildFrontendRedirectUrl({
      redirect: "group-detail",
      groupId,
      expenseId: expense._id.toString()
    });
    for (const member of group.members) {
      const { html, text } = newExpenseTemplate(
        member.name,
        group.name,
        description,
        amountValue,
        creator ? creator.name : "",
        groupUrl,
        `${FRONTEND_URL}/src/assets/logo.png`
      );

      await sendEmail(member.email, "Nuevo gasto registrado", html, text);
    }

    return res.status(201).json({
      ok: true,
      message: "Gasto registrado correctamente",
      expense
    });
  } catch (error) {
    next(error);
  }
};


// OBTENER GASTOS DE UN GRUPO: devuelve los gastos mas recientes con detalles de pagador y participantes.
exports.getGroupExpenses = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate("members", "_id");
    if (!group) {
      return respondError(res, 404, "Grupo no encontrado");
    }

    if (!isGroupMember(group, req.userId)) {
      return respondError(res, 403, "No tienes acceso a ese grupo");
    }

    const expenses = await Expense.find({ group: groupId })
      .populate("paidBy", "name email")
      .populate("participants", "name email")
      .sort({ createdAt: -1 });

    return res.json({ ok: true, expenses });
  } catch (error) {
    next(error);
  }
};


// CALCULAR BALANCES SIMPLIFICADOS: usa los gastos registrados para generar deudas netas entre usuarios.
exports.calculateBalances = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const snapshot = await getGroupBalanceSnapshot(groupId);
    if (!snapshot.group) {
      return respondError(res, 404, "Grupo no encontrado");
    }

    if (!isGroupMember(snapshot.group, req.userId)) {
      return respondError(res, 403, "No puedes ver los balances de este grupo");
    }

    return res.json({ ok: true, balances: snapshot.balances });
  } catch (error) {
    next(error);
  }
};


// LIQUIDAR DEUDA: registra un pago entre dos miembros para que deje de aparecer como pendiente.
exports.settleDebt = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { fromUserId, toUserId, amount } = req.body;
    const amountValue = Number(amount);

    if (!groupId || !fromUserId || !toUserId) {
      return respondError(res, 400, "Faltan datos para liquidar la deuda");
    }

    if (!amountValue || amountValue <= 0) {
      return respondError(res, 400, "El importe debe ser mayor que cero");
    }

    const group = await Group.findById(groupId)
      .populate("members", "_id name email")
      .populate("createdBy", "_id");

    if (!group) {
      return respondError(res, 404, "Grupo no encontrado");
    }

    if (!isGroupMember(group, req.userId)) {
      return respondError(res, 403, "No puedes liquidar deudas de este grupo");
    }

    const isCreator = group.createdBy && group.createdBy._id.toString() === req.userId;
    if (toUserId !== req.userId && !isCreator) {
      return respondError(res, 403, "Solo el acreedor o el administrador pueden liquidar esta deuda");
    }

    const snapshot = await getGroupBalanceSnapshot(groupId);
    if (!snapshot.group) {
      return respondError(res, 404, "Grupo no encontrado");
    }

    const existingDebt = snapshot.balances.find(
      (balance) =>
        balance.from &&
        balance.to &&
        balance.from._id.toString() === fromUserId &&
        balance.to._id.toString() === toUserId
    );

    if (!existingDebt) {
      return respondError(res, 404, "La deuda seleccionada ya no existe");
    }

    if (amountValue > existingDebt.amount + 0.01) {
      return respondError(res, 400, "El importe supera la deuda pendiente");
    }

    await Settlement.create({
      group: groupId,
      from: fromUserId,
      to: toUserId,
      amount: amountValue,
      settledBy: req.userId
    });

    const debtor = group.members.find((member) => member._id.toString() === fromUserId);
    const creditor = group.members.find((member) => member._id.toString() === toUserId);
    const creditorUser = creditor || null;
    const debtorUser = debtor || null;

    if (creditorUser && debtorUser) {
      try {
        const groupUrl = buildFrontendRedirectUrl({
          redirect: "group-detail",
          groupId
        });
        const { html, text } = debtSettledTemplate(
          creditorUser.name,
          debtorUser.name,
          group.name,
          amountValue.toFixed(2),
          groupUrl,
          `${FRONTEND_URL}/src/assets/logo.png`
        );

        await sendEmail(
          creditorUser.email,
          "Deuda liquidada - Divisor de Gastos",
          html,
          text
        );
      } catch (emailError) {
        console.error("Error enviando aviso de deuda liquidada:", emailError);
      }
    }

    return res.json({ ok: true, message: "Deuda liquidada correctamente" });
  } catch (error) {
    next(error);
  }
};


// ELIMINAR GASTO: solo el pagador o el creador pueden borrar un gasto y se actualiza el grupo.
exports.deleteExpense = async (req, res, next) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return respondError(res, 404, "Gasto no encontrado");
    }

    const group = await Group.findById(expense.group).populate("members", "_id").populate("createdBy", "_id");
    if (!group) {
      return respondError(res, 404, "Grupo no encontrado");
    }

    if (!isGroupMember(group, req.userId)) {
      return respondError(res, 403, "No puedes eliminar gastos de este grupo");
    }

    const isCreator = group.createdBy && group.createdBy._id.toString() === req.userId;
    const isPayer = expense.paidBy.toString() === req.userId;

    if (!isCreator && !isPayer) {
      return respondError(res, 403, "Solo el pagador o el administrador pueden eliminar este gasto");
    }

    await Group.findByIdAndUpdate(expense.group, {
      $pull: { expenses: expenseId }
    });

    await Expense.findByIdAndDelete(expenseId);

    return res.json({ ok: true, message: "Gasto eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};

