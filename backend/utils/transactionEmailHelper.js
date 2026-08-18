const EmailLogs = require("../models/emailLogSchema");
const { sendSuccessEmail } = require("../middlewares/sendMail/sendSuccessEmail");
const { sendFailedEmail } = require("../middlewares/sendMail/sendFailedEmail");

/**
 * Shared Helper: Mengirim notifikasi email status transaksi & mencatat deduplikasi ke EmailLogs
 *
 * @param {string} transaction_id - MongoDB ID transaksi
 * @param {string} status - Status transaksi (completed, cancelled, expired, denied, dll)
 * @param {Object} transaction - Data dokumen transaksi
 * @param {Array} items - Daftar item transaksi
 */
exports.handleTransactionEmailNotification = async (
  transaction_id,
  status,
  transaction,
  items
) => {
  let emailPayload = null;

  if (status === "completed") {
    emailPayload = "Success Transaction";
  } else if (["cancelled", "expired", "denied", "failed"].includes(status)) {
    emailPayload = "Fail Transaction";
  }

  if (!emailPayload) {
    return;
  }

  try {
    const emailExists = await EmailLogs.findOne({
      transaction_id,
      payload: emailPayload,
    });

    if (emailExists) {
      console.log(`Email ${emailPayload} sudah pernah dikirim untuk transaksi ${transaction_id}`);
      return;
    }

    await Promise.all([
      emailPayload === "Success Transaction"
        ? sendSuccessEmail(transaction.customer_email, transaction, items)
        : sendFailedEmail(transaction.customer_email, transaction, items),
      new EmailLogs({
        transaction_id,
        customer_email: transaction.customer_email,
        payload: emailPayload,
      }).save(),
    ]);

    console.log(`Email ${emailPayload} berhasil dikirim ke ${transaction.customer_email}`);
  } catch (err) {
    console.error("Error in handleTransactionEmailNotification:", err.message);
  }
};
