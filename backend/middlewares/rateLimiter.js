const rateLimit = require("express-rate-limit");

/**
 * Rate limiter untuk login admin - mencegah brute force
 * Maksimum 10 percobaan per 15 menit per IP
 */
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter untuk pembuatan transaksi - mencegah order spamming
 * Maksimum 10 transaksi per 1 menit per IP
 */
exports.transactionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Terlalu banyak permintaan pembuatan pesanan. Harap tunggu sebentar.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
