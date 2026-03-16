const mongoose = require("mongoose");

// Conecta con MongoDB Atlas usando la URI segura en variables de entorno.
// Las opciones siguientes equilibran seguridad y latencia en un entorno de libre.
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: false,              
      maxPoolSize: 10,               
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000,        
    });

    console.log("MongoDB conectado correctamente");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
