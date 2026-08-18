const TermsAndConditions = require("../../models/termsAndConditionsSchema");

exports.getTermsAndConditions = async (req, res) => {
  try {
    const terms_and_conditions = await TermsAndConditions.find({
      deleted_At: null,
    }).sort({
      no: 1,
    });

    return res.status(200).json({
      status: "success",
      message: "Terms and Conditions retrieved successfully!",
      data: terms_and_conditions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred!",
      data: null,
    });
  }
};
