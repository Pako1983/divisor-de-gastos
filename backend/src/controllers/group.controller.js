const User = require("../models/user.model");
const Group = require("../models/group.model");
const Expense = require("../models/expense.model");
const { sendEmail } = require("../utils/email.service");
const { addedToGroupTemplate } = require("../utils/emailTemplates");
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

// Limpia la lista de miembros, elimina duplicados y asegura que el propio creador este incluido.
const sanitizeMembers = (members, ownerId) => {
  if (!Array.isArray(members)) return [ownerId];
  const uniqueMembers = [...new Set(members.map((m) => m && m.toString()).filter(Boolean))];
  return [ownerId, ...uniqueMembers.filter((memberId) => memberId !== ownerId)];
};

// Crear grupo y notificar a los miembros iniciales agregados mediante email.
exports.crearGrupo = async (req, res, next) => {
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
exports.agregarMiembro = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return respondError(res, 400, "Debes indicar el ID del usuario");
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return respondError(res, 404, "Grupo no encontrado");
    }

    if (group.createdBy.toString() !== req.userId) {
      return respondError(res, 403, "Solo el creador puede añadir miembros");
    }

    if (isGroupMember(group, userId)) {
      return respondError(res, 409, "El usuario ya esta en el grupo");
    }

    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return respondError(res, 404, "Usuario no encontrado");
    }

    group.members.push(userId);
    await group.save();

    await User.findByIdAndUpdate(userId, { $addToSet: { groups: groupId } });

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
  } catch (error) {
    next(error);
  }
};

// Eliminar a un miembro del grupo cuando el creador lo decide (no se puede eliminar al creador).
exports.eliminarMiembro = async (req, res, next) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return respondError(res, 404, "Grupo no encontrado");
    }

    if (group.createdBy.toString() !== req.userId) {
      return respondError(res, 403, "Solo el creador puede eliminar miembros");
    }

    if (!isGroupMember(group, userId)) {
      return respondError(res, 404, "El usuario no pertenece al grupo");
    }

    if (group.createdBy.toString() === userId) {
      return respondError(res, 400, "No puedes eliminar al creador del grupo");
    }

    group.members = group.members.filter((member) => member.toString() !== userId);
    await group.save();

    await User.findByIdAndUpdate(userId, { $pull: { groups: groupId } });

    return res.json({ ok: true, message: "Miembro eliminado correctamente" });
  } catch (error) {
    console.error("ERROR AL ELIMINAR MIEMBRO:", error);
    return respondError(res, 500, "Error interno del servidor");
  }
};

// Eliminar todo el grupo, sus gastos y quitar la referencia en los usuarios.
exports.eliminarGrupo = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    const group = await Group.findById(groupId);
    if (!group) {
      return respondError(res, 404, "Grupo no encontrado");
    }

    const creatorId = group.createdBy.toString();
    if (creatorId !== userId) {
      return respondError(res, 403, "No tienes permiso para eliminar este grupo");
    }

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
exports.obtenerDetallesGrupo = async (req, res, next) => {
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
exports.obtenerMisGrupos = async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.userId })
      .populate("members", "name avatar")
      .populate("createdBy", "name avatar");

    return res.json({ ok: true, groups });
  } catch (error) {
    next(error);
  }
};


