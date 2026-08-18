const {
  signInValidator,
} = require("../../middlewares/authValidators/signInValidator");
const User = require("../../models/userSchema");
const {
  generateTokenAndSetCookie,
} = require("../../utils/generateTokenAndSetCookie");
const { doHashValidation } = require("../../utils/hashing");

exports.signIn = async (req, res) => {
  const { username, password } = req.body;

  try {
    const { error } = signInValidator.validate({
      username,
      password,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: errorMessages,
        data: null,
      });
    }

    const existingUser = await User.findOne({ username }).select("+password");
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password!",
        data: null,
      });
    }

    const isPasswordValid = await doHashValidation(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password!",
        data: {},
      });
    }

    generateTokenAndSetCookie(
      res,
      existingUser._id,
      existingUser.username
    );

    existingUser.password = undefined;

    return res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      data: existingUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "An internal server error occured!",
    });
  }
};
