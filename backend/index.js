const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const CORS = require("cors");
const mongoose = require("mongoose");
const { connectToDB } = require("./db/connectToDB");
const productRoute = require("./routes/productRoute");
const transactionRoute = require("./routes/transactionRoute");
const termsAndConditionsRoute = require("./routes/termsAndConditionsRoute");
const midtransRoute = require("./routes/midtransRoute");
const authRoute = require("./routes/authRoute");
const adminRoute = require("./routes/adminRoute");

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  CORS({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

// Routes
app.use("/api/v1/products", productRoute);
app.use("/api/v1/transactions", transactionRoute);
app.use("/api/v1/termsAndConditions", termsAndConditionsRoute);
app.use("/api/v1/midtrans", midtransRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/admin", adminRoute);

// Health check endpoint for uptime monitoring & observability
app.get("/health", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? "ok" : "degraded",
    uptime: Math.floor(process.uptime()),
    database: isDbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Test root route
app.get("/", (req, res) => {
  res.json({
    message: "Vailovent API is running",
  });
});

// Connect DB
connectToDB();

// Local only
if (process.env.NODE_ENV !== "production") {
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`);
  });
}

// Export for Vercel
module.exports = app;
