const User = require("../models/user.model");
const Group = require("../models/group.model");
const Expense = require("../models/expense.model");
const { sendEmail } = require("../utils/email.service");
const {
  addedToGroupTemplate,
  groupInvitationTemplate,
  removedFromGroupTemplate,
  groupDeletedTemplate
} = require("../utils/emailTemplates");
const { FRONTEND_URL, buildFrontendRedirectUrl } = require("../config/app.config");

// Responde errores de la misma forma en todas las rutas.
const respondError = (res, status, message) =>
  res.status(status).json({ ok: false, message });

// Normaliza la referencia de un miembro para comparar IDs sin errores.
const normalizeMemberId = (member) => {
  if (!member) return null;
  if (member._id) return member._id.toString();
  return member.toString();
};

// Verifica si un usuario forma parte de un grupo concreto.
const isGroupMember = (group, userId) =>
  group.members.some((member) => normalizeMemberId(member) === userId);

// Normaliza emails para evitar duplicados por mayusculas o espacios.
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

// Limpia la lista de usuarios, elimina duplicados y asegura que el propio creador este incluido.
const sanitizeMembers = (members, ownerId) => {
  if (!Array.isArray(members)) return [ownerId];
  const uniqueMembers = [...new Set(members.map((m) => m && m.toString()).filter(Boolean))];
  return [ownerId, ...uniqueMembers.filter((memberId) => memberId !== ownerId)];
};

// Crear grupo y notificar a los usuarios iniciales agregados mediante email.
exports.createGroup = async (req, res, next) => {
  try {
    const { name, members } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return respondError(res, 400, "El nombre del grupo es obligatorio");
    }

    const memberIds = sanitizeMembers(members, req.userId);

    const group = await Group.create({
      name: name.trim(),
      createdBy: req.userId,
      members: memberIds
    });

    await User.updateMany(
      { _id: { $in: memberIds } },
      { $addToSet: { groups: group._id } }
    );

    const memberIdsToNotify = memberIds.filter((memberId) => memberId !== req.userId);
    if (memberIdsToNotify.length) {
      const usersToNotify = await User.find({ _id: { $in: memberIdsToNotify } });
      const creator = await User.findById(req.userId);
      const groupUrl = buildFrontendRedirectUrl({
        redirect: "group-detail",
        groupId: group._id.toString()
      });
      const creatorName = creator ? creator.name : "";
      const logoUrl = `${FRONTEND_URL}/src/assets/logo.png`;

      await Promise.all(
        usersToNotify.map((member) => {
          const { html, text } = addedToGroupTemplate(
            member.name,
            group.name,
            creatorName,
            groupUrl,
            logoUrl
          );

          return sendEmail(member.email, "Has sido agregado a un grupo", html, text);
        })
      );
    }

    return res.status(201).json({
      ok: true,
      message: "Grupo creado correctamente",
      group
    });
  } catch (error) {
    next(error);
  }
};

// Buscar usuarios que coincidan con el texto ingresado para autocompletar el selector.
exports.searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }
      ]
    }).select("name email avatar");

    return res.json({ ok: true, users });
  } catch (error) {
    next(error);
  }
};

// Añadir usuario y enviar la notificación oportuna solo si el creador lo solicita.
exports.addMember = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { userId, email } = req.body;

    if (!userId && !email) {
      return respondError(res, 400, "Debes indicar un usuario o un email");
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return respondError(res, 404, "Grupo no encontrado");
    }

    if (group.createdBy.toString() !== req.userId) {
      return respondError(res, 403, "Solo el creador puede añadir usuarios");
    }

    const normalizedEmail = normalizeEmail(email);
    const userToAdd = userId
      ? await User.findById(userId)
      : await User.findOne({ email: normalizedEmail });

    if (userToAdd) {
      const memberId = userToAdd._id.toString();

      if (isGroupMember(group, memberId)) {
        return respondError(res, 409, "El usuario ya esta en el grupo");
      }

      group.members.push(memberId);
      group.pendingInvites = (group.pendingInvites || []).filter(
        (inviteEmail) => inviteEmail !== userToAdd.email
      );
      await group.save();

      await User.findByIdAndUpdate(memberId, { $addToSet: { groups: groupId } });

      const creator = await User.findById(req.userId);

      const groupUrl = buildFrontendRedirectUrl({
        redirect: "group-detail",
        groupId: group._id.toString()
      });

      const { html, text } = addedToGroupTemplate(
        userToAdd.name,
        group.name,
        creator ? creator.name : "",
        groupUrl,
        `${FRONTEND_URL}/src/assets/logo.png`
      );

      await sendEmail(userToAdd.email, "Has sido añadido a un grupo", html, text);

      return res.json({ ok: true, message: "Usuario añadido correctamente", group });
    }

    if (!normalizedEmail) {
      return respondError(res, 400, "Debes indicar un email valido");
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return respondError(res, 400, "Debes indicar un email valido");
    }

    if ((group.pendingInvites || []).includes(normalizedEmail)) {
      return respondError(res, 409, "Ya existe una invitacion pendiente para ese email");
    }

    group.pendingInvites = [...(group.pendingInvites || []), normalizedEmail];
    await group.save();

    const creator = await User.findById(req.userId);
    const registerUrl = `${FRONTEND_URL}/src/templates/register.html?email=${encodeURIComponent(normalizedEmail)}`;
    const { html, text } = groupInvitationTemplate(
      normalizedEmail,
      group.name,
      creator ? creator.name : "un miembro del grupo",
      registerUrl,
      `${FRONTEND_URL}/src/assets/logo.png`
    );

    await sendEmail(
      normalizedEmail,
      "Invitacion para unirte a Divisor de Gastos",
      html,
      text
    );

    return res.json({
      ok: true,
      message: "Invitacion enviada correctamente",
      group
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar a un usuario del grupo cuando el creador lo decide (no se puede eliminar al creador).
exports.removeMember = async (req, res, next) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return respondError(res, 404, "Grupo no encontrado");
    }

    if (group.createdBy.toString() !== req.userId) {
      return respondError(res, 403, "Solo el creador puede eliminar usuarios");
    }

    if (!isGroupMember(group, userId)) {
      return respondError(res, 404, "El usuario no pertenece al grupo");
    }

    if (group.createdBy.toString() === userId) {
      return respondError(res, 400, "No puedes eliminar al creador del grupo");
    }

    const userToRemove = await User.findById(userId);
    const creator = await User.findById(req.userId);

    group.members = group.members.filter((member) => member.toString() !== userId);
    await group.save();

    await User.findByIdAndUpdate(userId, { $pull: { groups: groupId } });

    if (userToRemove) {
      try {
        const { html, text } = removedFromGroupTemplate(
          userToRemove.name,
          group.name,
          creator ? creator.name : "el administrador",
          `${FRONTEND_URL}/src/assets/logo.png`
        );

        await sendEmail(
          userToRemove.email,
          "Has sido eliminado de un grupo - Divisor de Gastos",
          html,
          text
        );
      } catch (emailError) {
        console.error("Error enviando aviso de usuario eliminado:", emailError);
      }
    }

    return res.json({ ok: true, message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("ERROR AL ELIMINAR USUARIO:", error);
    return respondError(res, 500, "Error interno del servidor");
  }
};

// Eliminar todo el grupo, sus gastos y quitar la referencia en los usuarios.
exports.deleteGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    const group = await Group.findById(groupId)
      .populate("members", "name email")
      .populate("createdBy", "name email");
    if (!group) {
      return respondError(res, 404, "Grupo no encontrado");
    }

    const creatorId = normalizeMemberId(group.createdBy);
    if (creatorId !== userId) {
      return respondError(res, 403, "No tienes permiso para eliminar este grupo");
    }

    const logoUrl = `${FRONTEND_URL}/src/assets/logo.png`;
    const deletedBy = group.createdBy ? group.createdBy.name : "el administrador";
    const membersToNotify = group.members.filter(
      (member) => normalizeMemberId(member) !== userId
    );

    await Promise.allSettled(
      membersToNotify.map((member) => {
        const { html, text } = groupDeletedTemplate(
          member.name,
          group.name,
          deletedBy,
          logoUrl
        );

        return sendEmail(
          member.email,
          "Un grupo ha sido eliminado - Divisor de Gastos",
          html,
          text
        );
      })
    );

    await Expense.deleteMany({ group: groupId });
    await User.updateMany({ groups: groupId }, { $pull: { groups: groupId } });
    await Group.findByIdAndDelete(groupId);

    return res.json({ ok: true, message: "Grupo eliminado correctamente" });
  } catch (error) {
    console.error("ERROR EXACTO AL ELIMINAR GRUPO:", error);
    return respondError(res, 500, "Error interno del servidor");
  }
};

// Recuperar los datos completos de un grupo para mostrar detalles y participantes.
exports.getGroupDetails = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate("members", "name avatar email")
      .populate("createdBy", "name avatar");

    if (!group) {
      return respondError(res, 404, "Grupo no encontrado");
    }

    if (!isGroupMember(group, req.userId)) {
      return respondError(res, 403, "No tienes permiso para ver ese grupo");
    }

    return res.json({ ok: true, group });
  } catch (error) {
    next(error);
  }
};

// Listar todos los grupos a los que pertenece el usuario autenticado.
exports.getMyGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.userId })
      .populate("members", "name avatar")
      .populate("createdBy", "name avatar");

    return res.json({ ok: true, groups });
  } catch (error) {
    next(error);
  }
};


