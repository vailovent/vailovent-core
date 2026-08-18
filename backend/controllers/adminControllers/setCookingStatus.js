const mongoose = require("mongoose");
const Transactions = require("../../models/transactionSchema");
const {
  setCookingStatusValidator,
} = require("../../middlewares/transactionValidators/setCookingStatusValidator");

exports.setCookingStatus = async (req, res) => {
  const { transaction_id } = req.params;
  const { cooking_status } = req.body;

  try {
    // Validate transaction_id format
    if (!mongoose.Types.ObjectId.isValid(transaction_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID format!",
        data: null,
      });
    }

    // Validate cooking status format
    const { error } = setCookingStatusValidator.validate({ cooking_status });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((detail) => detail.message),
        data: null,
      });
    }

    // Validate cooking_status value & pipeline progression
    const COOKING_STAGES_RANK = {
      "Not Started": 0,
      "Being Cooked": 1,
      "Ready to Serve": 2,
      "Completed": 3,
    };

    if (!(cooking_status in COOKING_STAGES_RANK)) {
      return res.status(400).json({
        success: false,
        message: `Status memasak tidak valid: "${cooking_status}". Pilihan valid: ${Object.keys(
          COOKING_STAGES_RANK
        ).join(", ")}`,
        data: null,
      });
    }

    // Check if transaction exists
    const existingTransaction = await Transactions.findById(
      transaction_id
    ).lean();
    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan!",
        data: null,
      });
    }

    // Validate transaction status before updating cooking status
    if (existingTransaction.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: `Tidak dapat mengubah status memasak karena status pembayaran transaksi adalah "${existingTransaction.status}"!`,
        data: null,
      });
    }

    // Business Process Algorithm: Forward-only progression check
    const currentStatus = existingTransaction.cooking_status || "Not Started";
    const currentRank = COOKING_STAGES_RANK[currentStatus] ?? 0;
    const newRank = COOKING_STAGES_RANK[cooking_status];

    if (currentStatus === "Completed") {
      return res.status(400).json({
        success: false,
        message:
          "Pesanan telah berstatus Selesai (Completed) dan tidak dapat diubah lagi!",
        data: null,
      });
    }

    if (newRank <= currentRank) {
      return res.status(400).json({
        success: false,
        message: `Transisi status tidak valid! Status saat ini (${currentStatus}) tidak dapat dikembalikan ke tahap sebelumnya atau sama (${cooking_status}).`,
        data: null,
      });
    }

    // Update cooking status
    const updatedTransaction = await Transactions.findByIdAndUpdate(
      transaction_id,
      { cooking_status },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Cooking status updated successfully!",
      data: updatedTransaction,
    });
  } catch (error) {
    console.error("Error updating cooking status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      data: null,
    });
  }
};
