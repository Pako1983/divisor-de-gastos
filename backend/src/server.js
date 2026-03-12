require("dotenv").config();
const fs = require("fs");
const path = require("path");
const app = require("./app");
const connectDB = require("./config/db");

// Puerto dinámico para producción y fijo para desarrollo
const PORT = process.env.PORT || 4000;

// Asegúrate de que los directorios de uploads existan
const uploadsDir = path.join(__dirname, "uploads");
const avatarDir = path.join(uploadsDir, "avatars");
const receiptsDir = path.join(uploadsDir, "receipts");

fs.mkdirSync(avatarDir, { recursive: true });
fs.mkdirSync(receiptsDir, { recursive: true });

// Conectar a MongoDB
connectDB();

// Iniciar servidor
app.listen(PORT, () => {
  const env = process.env.NODE_ENV || "development";

  if (env === "development") {
    console.log("Servidor corriendo en http://localhost:" + PORT);
  } else {
    console.log("Servidor iniciado en modo " + env + " en el puerto " + PORT);
  }
});

