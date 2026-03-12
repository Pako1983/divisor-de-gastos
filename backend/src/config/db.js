const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // Opciones recomendadas para producción
      autoIndex: false,          // evita crear índices automáticamente en producción
      maxPoolSize: 10,           // conexiones simultáneas
      serverSelectionTimeoutMS: 5000, // tiempo máximo para conectar
      socketTimeoutMS: 45000,    // tiempo máximo de inactividad
    });

    console.log("✅ MongoDB conectado correctamente");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

