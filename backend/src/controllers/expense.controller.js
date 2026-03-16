const Expense = require("../models/expense.model");
const Group = require("../models/group.model");
const User = require("../models/user.model");
const simplifyDebts = require("../utils/debt-simplifier");
const { sendEmail } = require("../utils/email.service");
const { newExpenseTemplate } = require("../utils/emailTemplates");
const { FRONTEND_URL, buildFrontendRedirectUrl } = require("../config/app.config");

// Responde los errores de forma uniforme con el mismo esquema JSON.
const respondError = (res, status, message) =>
  res.status(status).json({ ok: false, message });

// Normaliza la lista de participantes eliminando duplicados y respetando el formato del backend.
const normalizeParticipants = (participants) => {
  if (!participants) return [];
  const list = Array.isArray(participants) ? participants : [participants];
  return [...new Set(list.map((p) => p && p.toString()).filter(Boolean))];
};

// Verifica que un miembro con el ID dado pertenezca al grupo.
const isGroupMember = (group, userId) =>
  group.members.some((member) => member._id.toString() === userId);


// CREAR GASTO: valida campos, guarda el gasto, actualiza el grupo y notifica por email.
exports.crearGasto = async (req, res, next) => {
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
      return respondError(res, 400, "El pagador debe ser miembro del grupo");
    }

    const normalizedParticipants = normalizeParticipants(participants);
    if (normalizedParticipants.length === 0) {
      return respondError(res, 400, "Debes seleccionar al menos un participante");
    }

    const invalidParticipant = normalizedParticipants.find(
      (participantId) => !isGroupMember(group, participantId)
    );

    if (invalidParticipant) {
      return respondError(res, 400, "Todos los participantes deben formar parte del grupo");
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
exports.obtenerGastosGrupo = async (req, res, next) => {
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


// CALCULAR BALANCES SIMPLIFICADOS: usa los gastos registrados para generar deudas netas entre miembros.
exports.calcularBalances = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate("members", "name email");
    if (!group) {
      return respondError(res, 404, "Grupo no encontrado");
    }

    if (!isGroupMember(group, req.userId)) {
      return respondError(res, 403, "No puedes ver los balances de este grupo");
    }

    const expenses = await Expense.find({ group: groupId });

    const balances = {};

    group.members.forEach((member) => {
      balances[member._id] = 0;
    });

    expenses.forEach((exp) => {
      if (!Array.isArray(exp.participants) || exp.participants.length === 0) return;

      const amountPerPerson = exp.amount / exp.participants.length;

      exp.participants.forEach((p) => {
        if (p.toString() !== exp.paidBy.toString()) {
          balances[p] -= amountPerPerson;
          balances[exp.paidBy] += amountPerPerson;
        }
      });
    });

    const simplified = simplifyDebts(balances, group.members);

    return res.json({ ok: true, balances: simplified });
  } catch (error) {
    next(error);
  }
};


// ELIMINAR GASTO: solo el pagador o el creador pueden borrar un gasto y se actualiza el grupo.
exports.eliminarGasto = async (req, res, next) => {
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
