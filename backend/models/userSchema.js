const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 8,
    trim: true,
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "staff"],
    default: "admin",
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
