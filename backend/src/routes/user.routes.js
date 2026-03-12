const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const auth = require("../middlewares/auth.middleware");

const {
  getProfile,
  updateName,
  updatePassword,
  updateAvatar,
  getUserGroups
} = require("../controllers/user.controller");

// =========================
//  CONFIGURACIÓN DE MULTER
// =========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/avatars"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// =========================
//  RUTAS PROTEGIDAS
// =========================
router.get("/profile", auth, getProfile);
router.put("/update-name", auth, updateName);
router.put("/update-password", auth, updatePassword);
router.put("/update-avatar", auth, upload.single("avatar"), updateAvatar);
router.get("/groups", auth, getUserGroups);

module.exports = router;


