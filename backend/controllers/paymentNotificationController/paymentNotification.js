const Transactions = require("../../models/transactionSchema");
const TransactionItems = require("../../models/transactionItemSchema");
const crypto = require("crypto");
const {
  handleTransactionEmailNotification,
} = require("../../utils/transactionEmailHelper");

// Payment Notification URL
exports.payment_notification = async (req, res) => {
  try {
    const notification = req.body;
    console.log("Payment Notification:", notification);

    const {
      transaction_status,
      order_id,
      status_code,
      gross_amount,
      signature_key,
    } = notification;

    // === CRITICAL-4: Verifikasi signature Midtrans ===
    // SHA512(order_id + status_code + gross_amount + server_key)
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error("MIDTRANS_SERVER_KEY is not set!");
      return res.status(500).json({
        success: false,
        message: "Server configuration error.",
      });
    }

    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (!signature_key || signature_key !== expectedSignature) {
      console.warn("Invalid Midtrans signature. Possible spoofed request.");
      return res.status(403).json({
        success: false,
        message: "Invalid signature.",
      });
    }
    // === End signature verification ===

    // Validasi order_id sebelum melakukan split
    if (!order_id || !order_id.includes("-")) {
      return res.status(400).json({
        success: false,
        message: "Invalid order_id format.",
        data: null,
      });
    }

    const transaction_id = order_id.split("-")[1];

    // Cari transaksi dan item transaksi secara paralel
    const [transaction, transaction_items] = await Promise.all([
      Transactions.findById(transaction_id),
      TransactionItems.find({ transaction_id }),
    ]);

    // Cek apakah transaksi ditemukan
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: `Transaction with ID "${transaction_id}" not found.`,
        data: null,
      });
    }

    // Cek apakah item transaksi ditemukan
    if (transaction_items.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No transaction items found for transaction ID "${transaction_id}".`,
        data: null,
      });
    }

    // Konversi status Midtrans ke status yang diizinkan dalam database
    let databaseStatus;
    switch (transaction_status) {
      case "settlement":
      case "capture":
        databaseStatus = "completed";
        break;
      case "pending":
        databaseStatus = "pending";
        break;
      case "cancel":
      case "refund":
        databaseStatus = "cancelled";
        break;
      case "expire":
        databaseStatus = "expired";
        break;
      case "deny":
        databaseStatus = "denied";
        break;
      case "challenge":
        databaseStatus = "challengebyFDS";
        break;
      default:
        databaseStatus = "pending";
        break;
    }

    // Perbarui status transaksi
    transaction.status = databaseStatus;

    // Simpan perubahan status transaksi
    await transaction.save();

    // Kirim notifikasi email status pembayaran (Success / Fail) via shared helper
    await handleTransactionEmailNotification(
      transaction_id,
      databaseStatus,
      transaction,
      transaction_items
    );

    return res.status(200).json({
      success: true,
      message:
        "Payment notification received and transaction updated successfully.",
      data: {
        transaction,
        transaction_items,
      },
    });
  } catch (error) {
    console.error("Error processing payment notification:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
