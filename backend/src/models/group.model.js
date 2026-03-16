const mongoose = require("mongoose");

// Modelo que representa un grupo con sus usuarios y gastos asociados.
const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
        // IDs de los usuarios que pertenecen al grupo.
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
        // Referencias a los gastos registrados dentro del grupo.
    expenses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Expense"
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", GroupSchema);

