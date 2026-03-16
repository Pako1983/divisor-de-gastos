const mongoose = require("mongoose");

// Conecta con MongoDB Atlas usando la URI segura en variables de entorno.
// Las opciones siguientes equilibran seguridad y latencia en un entorno de hobby/free.
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: false,              // evita reindexaciones automáticas en cada arranque.
      maxPoolSize: 10,               // número máximo de conexiones simultáneas manejadas.
      serverSelectionTimeoutMS: 5000, // cuánto espera antes de fallar si no encuentra el servidor.
      socketTimeoutMS: 45000,        // tiempo máximo de inactividad antes de cerrar un socket.
    });

    console.log("MongoDB conectado correctamente");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
