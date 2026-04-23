const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middlewares/auth.middleware");

const {
  getProfile,
  updateName,
  updatePassword,
  updateAvatar,
  getUserGroups
} = require("../controllers/user.controller");


//  CONFIGURACIÓN DE MULTER
const upload = multer({ storage: multer.memoryStorage() });


//  RUTAS PROTEGIDAS
router.get("/profile", auth, getProfile);
router.put("/update-name", auth, updateName);
router.put("/update-password", auth, updatePassword);
router.put("/update-avatar", auth, upload.single("avatar"), updateAvatar);
router.get("/groups", auth, getUserGroups);

module.exports = router;


