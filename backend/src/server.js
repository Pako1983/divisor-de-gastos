require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

// Puerto dinámico para producción y fijo para desarrollo
const PORT = process.env.PORT || 4000;

// Conectar a MongoDB
connectDB();

// Iniciar servidor
app.listen(PORT, () => {
  const env = process.env.NODE_ENV || "development";

  if (env === "development") {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  } else {
    console.log(`🚀 Servidor iniciado en modo ${env} en el puerto ${PORT}`);
  }
});


