const mongoose = require("mongoose");

// Esquema que define el perfil del usuario, su avatar y los grupos asociados.
const UserSchema = new mongoose.Schema(
  {
    // Nombre completo del usuario.
    name: {
      type: String,
      required: true,
      trim: true
    },
    // Email unico usado para login y notificaciones.
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email inválido"]
    },
    // Hash de contraseña almacenado tras el registro.
    password: {
      type: String,
      required: true
    },
    // Ruta opcional del avatar subido por el usuario.
    avatar: {
      type: String, // ruta del archivo subido
      default: null
    },
    // Token temporal para recuperar la contrasena.
    resetPasswordToken: {
      type: String,
      default: null
    },
    // Fecha de expiracion del token de recuperacion.
    resetPasswordExpires: {
      type: Date,
      default: null
    },
    // Referencias a los grupos en los que participa el usuario.
    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

