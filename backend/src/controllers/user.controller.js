const User = require("../models/user.model");
const Group = require("../models/group.model");
const bcrypt = require("bcryptjs");

// Obtener perfil del usuario
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    return res.json({
      ok: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar nombre
exports.updateName = async (req, res, next) => {
  try {
    const { name } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name },
      { new: true }
    ).select("-password");

    return res.json({
      ok: true,
      message: "Nombre actualizado correctamente",
      user
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar contraseña
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({
        ok: false,
        message: "La contraseña actual no es correcta"
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return res.json({
      ok: true,
      message: "Contraseña actualizada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar avatar
exports.updateAvatar = async (req, res, next) => {
  try {
    const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : null;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { avatar },
      { new: true }
    ).select("-password");

    return res.json({
      ok: true,
      message: "Avatar actualizado correctamente",
      user
    });
  } catch (error) {
    next(error);
  }
};

// Obtener grupos del usuario
exports.getUserGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.userId })
      .populate("members", "name avatar")
      .populate("createdBy", "name avatar");

    return res.json({
      ok: true,
      groups
    });
  } catch (error) {
    next(error);
  }
};

