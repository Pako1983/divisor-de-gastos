const express = require("express");
const router = express.Router();

const {
  crearGasto,
  obtenerGastosGrupo,
  calcularBalances,
  eliminarGasto
} = require("../controllers/expense.controller");

const auth = require("../middlewares/auth.middleware");


//  CONFIGURACIÓN DE MULTER
const multer = require("multer");
const path = require("path");

// Carpeta donde se guardarán los recibos (compatible con servidores)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/receipts"));
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({ storage });



//  RUTAS DE GASTOS
// Crear gasto (con recibo opcional)
router.post(
  "/create",
  auth,
  upload.single("receipt"),
  crearGasto
);

// Obtener gastos del grupo
router.get(
  "/:groupId",
  auth,
  obtenerGastosGrupo
);

// Obtener balances simplificados
router.get(
  "/:groupId/balances",
  auth,
  calcularBalances
);

// Eliminar gasto
router.delete("/:expenseId", auth, eliminarGasto);

module.exports = router;



