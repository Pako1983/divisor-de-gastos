const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");

const {
  crearGrupo,
  searchUsers,
  agregarMiembro,
  eliminarMiembro,
  eliminarGrupo,
  obtenerDetallesGrupo,
  obtenerMisGrupos
} = require("../controllers/group.controller");


//  RUTAS DE GRUPOS
// Obtener mis grupos
router.get("/", auth, obtenerMisGrupos);

// Crear grupo
router.post("/create", auth, crearGrupo);

// Buscar usuarios para añadir al grupo
router.get("/search-users", auth, searchUsers);

// Añadir miembro
router.post("/:groupId/add-member", auth, agregarMiembro);

// Eliminar miembro
router.delete("/:groupId/remove-member/:userId", auth, eliminarMiembro);

// Eliminar grupo
router.delete("/:groupId", auth, eliminarGrupo);

// Obtener detalles del grupo
router.get("/:groupId", auth, obtenerDetallesGrupo);

module.exports = router;




