const express = require("express");
const { signIn } = require("../controllers/authControllers/signInController");
const { signOut } = require("../controllers/authControllers/signOutController");
const { getMe } = require("../controllers/authControllers/getMeController");
const { verifyToken } = require("../middlewares/verifyToken");

const { authLimiter } = require("../middlewares/rateLimiter");

const router = express.Router();

// POST /signup dihapus — endpoint ini tidak boleh terbuka untuk publik.
// Pembuatan akun admin hanya dilakukan secara manual oleh developer.

router.post("/login", authLimiter, signIn);
router.post("/logout", signOut);

// GET /me — verifikasi sesi admin yang sedang login (diproteksi JWT cookie)
// Digunakan oleh ProtectRoute di frontend sebagai pengganti js-cookie.
router.get("/me", verifyToken, getMe);

module.exports = router;

