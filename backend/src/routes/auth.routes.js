const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const { register, login, forgotPassword } = require("../controllers/auth.controller");


//  CONFIGURACIÓN DE MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/avatars"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


//  RUTAS DE AUTENTICACIÓN
router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);

module.exports = router;

