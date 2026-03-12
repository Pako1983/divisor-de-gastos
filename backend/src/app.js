const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const groupRoutes = require("./routes/group.routes");
const expenseRoutes = require("./routes/expense.routes");

const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

// =========================
//  MIDDLEWARES GLOBALES
// =========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
//  ARCHIVOS ESTÁTICOS (UPLOADS)
// =========================
// Esto funciona en Windows, Linux, servidores y tu PC
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// =========================
//  RUTAS PRINCIPALES
// =========================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);

// =========================
//  MIDDLEWARE DE ERRORES
// =========================
app.use(errorMiddleware);

module.exports = app;

