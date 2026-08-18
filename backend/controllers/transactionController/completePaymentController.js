const mongoose = require("mongoose");
const Transactions = require("../../models/transactionSchema");
const TransactionItems = require("../../models/transactionItemSchema");
const EmailLogs = require("../../models/emailLogSchema");

const {
  handleTransactionEmailNotification,
} = require("../../utils/transactionEmailHelper");

const statusMapping = {
  1: "pending",
  2: "challengeByFDS",
  3: "completed",
  4: "denied",
  5: "expired",
  6: "cancelled",
};

exports.paying = async (req, res) => {
  const { transaction_id, status } = req.params;

  try {
    if (!transaction_id || !status) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID or status.",
        data: null,
      });
    }

    const statusNumber = parseInt(status, 10);
    if (!statusMapping[statusNumber]) {
      return res.status(400).json({
        success: false,
        message: "Invalid status! Status must be between 1 and 6.",
        data: null,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(transaction_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID format!",
        data: null,
      });
    }

    const existingTransaction = await Transactions.findById(transaction_id);
    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
        data: null,
      });
    }

    const newStatus = statusMapping[statusNumber];
    existingTransaction.status = newStatus;
    const result = await existingTransaction.save();

    const items = await TransactionItems.find({ transaction_id });

    // Kirim notifikasi email via shared helper
    await handleTransactionEmailNotification(
      transaction_id,
      newStatus,
      existingTransaction,
      items
    );

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully!",
      data: result,
      items: items,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred!",
      data: null,
    });
  }
};
