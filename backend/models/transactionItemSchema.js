const mongoose = require("mongoose");
const validator = require("validator");

const transactionItemSchema = new mongoose.Schema(
  {
    transaction_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transactions",
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      required: true,
    },
    product_name: {
      type: String,
      required: true,
    },
    unit_price: {
      type: Number,
      required: true,
      min: [0, "Unit price must be at least 0"],
    },
    qty: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Amount must be at least 1"],
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("TransactionItems", transactionItemSchema);
