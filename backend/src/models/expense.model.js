const mongoose = require("mongoose");

// Guarda cada gasto asociado a un grupo y sus usuarios.
const ExpenseSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true
    },
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    receipt: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", ExpenseSchema);

