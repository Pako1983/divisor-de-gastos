const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");

const {
  createGroup,
  searchUsers,
  addMember,
  removeMember,
  deleteGroup,
  getGroupDetails,
  getMyGroups
} = require("../controllers/group.controller");

// =========================
//  RUTAS DE GRUPOS
// =========================

// Obtener mis grupos
router.get("/", auth, getMyGroups);

// Crear grupo
router.post("/create", auth, createGroup);

// Buscar usuarios para añadir al grupo
router.get("/search-users", auth, searchUsers);

// Añadir miembro
router.post("/:groupId/add-member", auth, addMember);

// Eliminar miembro
router.delete("/:groupId/remove-member/:userId", auth, removeMember);

// Eliminar grupo
router.delete("/:groupId", auth, deleteGroup);

// Obtener detalles del grupo
router.get("/:groupId", auth, getGroupDetails);

module.exports = router;




