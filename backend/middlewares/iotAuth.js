/**
 * Middleware untuk otentikasi device IoT (Soundbox).
 * Memeriksa header 'x-iot-api-key' terhadap IOT_API_KEY di environment variable.
 */
exports.iotAuth = (req, res, next) => {
  const apiKey = req.headers["x-iot-api-key"];
  const expectedApiKey = process.env.IOT_API_KEY || "vailovent-iot-default-key-2026";

  if (!apiKey || apiKey !== expectedApiKey) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or missing IoT API Key.",
      data: null,
    });
  }

  next();
};
