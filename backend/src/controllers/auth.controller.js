const crypto = require("crypto");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/email.service");
const {
  welcomeRegisterTemplate,
  passwordResetTemplate
} = require("../utils/emailTemplates");
const { FRONTEND_URL } = require("../config/app.config");

const generateResetToken = () => crypto.randomBytes(32).toString("hex");
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// Registrar usuario
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validar email duplicado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        ok: false,
        message: "El email ya está registrado"
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Avatar opcional (compatible con producción)
    const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : null;

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar
    });

    // Enviamos un email de bienvenida sin bloquear el registro si falla.
    try {
      console.log("Intentando enviar correo de bienvenida a:", newUser.email);
      const logoUrl = `${FRONTEND_URL}/src/assets/logo.png`;
      const { html, text } = welcomeRegisterTemplate(newUser.name, logoUrl);
      const emailResult = await sendEmail(
        newUser.email,
        "Confirmación de registro y bienvenida - Divisor de Gastos",
        html,
        text
      );
      if (emailResult && emailResult.ok) {
        console.log("Correo de bienvenida enviado correctamente a:", newUser.email);
      } else {
        console.warn("El correo de bienvenida no se pudo enviar a:", newUser.email);
      }
    } catch (emailError) {
      console.error("Error enviando correo de bienvenida:", emailError);
    }

    return res.status(201).json({
      ok: true,
      message: "Usuario registrado correctamente",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "El usuario no existe"
      });
    }

    // Comparar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        ok: false,
        message: "Email o contraseña incorrectos"
      });
    }

    // Crear token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      ok: true,
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// Solicitar recuperación de contraseña
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        ok: false,
        message: "Debes indicar un correo electrónico"
      });
    }

    const user = await User.findOne({ email });

    // Evitamos revelar si el correo existe o no.
    if (!user) {
      return res.json({
        ok: true,
        message: "Si el correo existe, recibirás un enlace para restablecer tu contraseña"
      });
    }

    const rawToken = generateResetToken();
    const tokenHash = hashToken(rawToken);

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hora
    await user.save();

    const resetUrl = `${FRONTEND_URL}/reset-password.html?token=${rawToken}`;
    const logoUrl = `${FRONTEND_URL}/src/assets/logo.png`;
    const { html, text } = passwordResetTemplate(user.name, resetUrl, logoUrl);

    const emailResult = await sendEmail(
      user.email,
      "Restablecer contraseña - Divisor de Gastos",
      html,
      text
    );

    if (emailResult && emailResult.ok) {
      console.log("Correo de recuperación enviado a:", user.email);
    } else {
      console.warn("No se pudo enviar el correo de recuperación a:", user.email);
    }

    return res.json({
      ok: true,
      message: "Si el correo existe, recibirás un enlace para restablecer tu contraseña"
    });
  } catch (error) {
    next(error);
  }
};

// Restablecer contraseña con token
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        ok: false,
        message: "Faltan datos para restablecer la contraseña"
      });
    }

    const tokenHash = hashToken(token);

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        ok: false,
        message: "El enlace de recuperación no es válido o ha caducado"
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({
      ok: true,
      message: "La contraseña se ha actualizado correctamente"
    });
  } catch (error) {
    next(error);
  }
};
