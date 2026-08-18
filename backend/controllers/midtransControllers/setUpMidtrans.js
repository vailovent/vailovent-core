const midtransClient = require("midtrans-client");

exports.snap = new midtransClient.Snap({
  isProduction:
    process.env.MIDTRANS_IS_PRODUCTION === "true" ||
    (process.env.NODE_ENV === "production" &&
      process.env.MIDTRANS_IS_PRODUCTION !== "false"),
  serverKey: `${process.env.MIDTRANS_SERVER_KEY || ""}`,
  clientKey: `${process.env.MIDTRANS_CLIENT_KEY || process.env.MIDTRANS_CLIENT_kEY || ""}`,
});

