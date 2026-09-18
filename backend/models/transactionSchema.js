const mongoose = require("mongoose");
const validator = require("validator");

const transactionSchema = new mongoose.Schema(
  {
    table_code: {
      type: Number,
      required: [true, "Table code is required!"],
      trim: true,
      validate: {
        validator: function (value) {
          return validator.isFloat(String(value), { min: 0 });
        },
        message: "Table code must be a valid number!",
      },
    },
    customer_name: {
      type: String,
      required: [true, "Customer name is required!"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long!"],
    },
    customer_email: {
      type: String,
      required: [true, "Email is required!"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: "Invalid email format!",
      },
    },
    total_amount: {
      type: Number,
      required: [true, "Total amount is required!"],
      min: [0, "Amount cannot be negative!"],
      validate: {
        validator: function (value) {
          return validator.isFloat(String(value), { min: 0 });
        },
        message: "Amount must be a valid number!",
      },
    },
    cooking_status: {
      type: String,
      required: true,
      enum: ["Not Started", "Being Cooked", "Ready to Serve", "Completed"],
      default: "Not Started",
    },
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "completed",
        "cancelled",
        "expired",
        "denied",
        "challengebyFDS",
      ],
      default: "pending",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    payment_link: {
      type: String,
      trim: true,
      default: null,
    },
    snap_token: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

transactionSchema.pre("save", function (next) {
  if (this.customer_name && this.customer_name.length > 0) {
    this.customer_name = this.customer_name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  next();
});

module.exports = mongoose.model("Transactions", transactionSchema);
