const User = require("../models/userSchema");

exports.isAdmin = async (req, res, next) => {
  try {
    const existingUser = await User.findById(req.userId);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    const isUserAdmin =
      existingUser.role === "admin" || existingUser.username === "admin";

    if (!isUserAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden! You are not authorized as an admin.",
      });
    }

    next();
  } catch (error) {
    console.error("Error in isAdmin middleware:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
