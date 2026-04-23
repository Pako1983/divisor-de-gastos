const express = require("express");
const router = express.Router();
const multer = require("multer");
const { register, login, forgotPassword, resetPassword } = require("../controllers/auth.controller");


//  CONFIGURACIÓN DE MULTER
const upload = multer({ storage: multer.memoryStorage() });


//  RUTAS DE AUTENTICACIÓN
router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;

