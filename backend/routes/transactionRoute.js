const express = require("express");
const {
  createTransaction,
} = require("../controllers/transactionController/createTransactionController");
const {
  paying,
} = require("../controllers/transactionController/completePaymentController");
const {
  getById,
  getAllTransactionByStatus,
  getTransactionBySuccessAndIsRead,
  getLatestCompletedAndIsReadTrueTransaction,
  syncTransactionStatus,
} = require("../controllers/transactionController/getTransactionController");
const {
  updateTransactionIsRead,
} = require("../controllers/transactionController/updateTransactionController");
const { verifyToken } = require("../middlewares/verifyToken");
const { isAdmin } = require("../middlewares/isAdmin");
const { iotAuth } = require("../middlewares/iotAuth");
const { transactionLimiter } = require("../middlewares/rateLimiter");

const router = express.Router();

// Pembuatan transaksi dilindungi rate limiter agar tidak bisa dispam
router.post("/create", transactionLimiter, createTransaction);

// Manual status update dilindungi verifyToken + isAdmin (hanya admin yang berhak ubah status manual)
router.put("/:transaction_id/payment/:status", verifyToken, isAdmin, paying);

// Sinkronisasi status transaksi langsung dengan Midtrans API (On-Demand Reconcile)
router.post("/:transaction_id/sync-status", verifyToken, isAdmin, syncTransactionStatus);

router.get("/id/:transaction_id", getById);

// Admin query status
router.get("/status/:status", verifyToken, isAdmin, getAllTransactionByStatus);

// IoT Soundbox Endpoints — diproteksi dengan IoT API Key (x-iot-api-key header)
router.get(
  "/latest-transaction-completed-isread-true",
  iotAuth,
  getLatestCompletedAndIsReadTrueTransaction
);

router.get(
  "/get-transaction-succes-and-is-read",
  iotAuth,
  getTransactionBySuccessAndIsRead
);

router.put(
  "/update-transaction-is-read/:transaction_id",
  iotAuth,
  updateTransactionIsRead
);

module.exports = router;
