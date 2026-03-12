const express = require("express");
const router = express.Router();

const {
  createExpense,
  getGroupExpenses,
  calculateBalances,
  deleteExpense
} = require("../controllers/expense.controller");

const auth = require("../middlewares/auth.middleware");

// =========================
//  CONFIGURACIÓN DE MULTER
// =========================
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


// =========================
//  RUTAS DE GASTOS
// =========================

// Crear gasto (con recibo opcional)
router.post(
  "/create",
  auth,
  upload.single("receipt"),
  createExpense
);

// Obtener gastos del grupo
router.get(
  "/:groupId",
  auth,
  getGroupExpenses
);

// Obtener balances simplificados
router.get(
  "/:groupId/balances",
  auth,
  calculateBalances
);

// Eliminar gasto
router.delete("/:expenseId", auth, deleteExpense);

module.exports = router;


