const mongoose = require("mongoose");
const { snap } = require("./setUpMidtrans");
const Products = require("../../models/productSchema");
const Transactions = require("../../models/transactionSchema");
const TransactionItems = require("../../models/transactionItemSchema");
const {
  sendPaymentEmail,
} = require("../../middlewares/sendMail/sendPaymentEmail");
const EmailLogs = require("../../models/emailLogSchema");

exports.createTransactionMidtrans = async (req, res) => {
  const { customer_name, customer_email, products, transaction_id } = req.body;
  const itemDetails = await Promise.all(
    products.map(async (product) => {
      const productData = await Products.findById(
        product._id || product.product_id
      );

      if (!productData) {
        console.error(
          `Product with ID ${product._id || product.product_id} not found`
        );
        return {
          error: `Product with ID ${
            product._id || product.product_id
          } not found`,
        };
      }

      const price = parseInt(productData.price, 10);
      const quantity = parseInt(product.qty, 10);

      // Cek apakah harga atau kuantitas tidak valid
      if (isNaN(price) || isNaN(quantity) || price <= 0 || quantity <= 0) {
        console.error(
          `Invalid price or quantity for product ID ${
            product._id || product.product_id
          }: Price: ${price}, Quantity: ${quantity}`
        );
        return {
          error: `Invalid price or quantity for product ${
            product._id || product.product_id
          }.`,
        };
      }

      return {
        id: product._id || product.product_id,
        name: productData.name,
        price: price,
        quantity: quantity,
      };
    })
  );

  // Cek apakah ada error dalam itemDetails
  const error = itemDetails.find((item) => item.error);
  if (error) {
    return res.status(400).send({ error: error.error });
  }

  // Hitung total harga (gross_amount)
  const grossAmount = itemDetails.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Pastikan grossAmount valid
  if (isNaN(grossAmount) || grossAmount <= 0) {
    return res.status(400).send({
      error: "Invalid gross amount (total price).",
    });
  }

  const parameter = {
    transaction_details: {
      order_id: `VAILOVENT-${transaction_id}`,
      gross_amount: grossAmount,
    },
    customer_details: {
      first_name: customer_name,
      email: customer_email,
    },
    item_details: itemDetails,
  };

  try {
    const transaction = await snap.createTransaction(parameter);

    // Save payment_link and snap_token into Transactions document in DB
    await Transactions.findByIdAndUpdate(transaction_id, {
      payment_link: transaction.redirect_url,
      snap_token: transaction.token,
    });

    // Kirim email pembayaran jika belum pernah dikirim
    const existingEmailLog = await EmailLogs.findOne({
      transaction_id,
      payload: "Create Transaction",
    });

    if (!existingEmailLog) {
      try {
        await sendPaymentEmail(
          customer_email,
          customer_name,
          transaction_id,
          grossAmount,
          itemDetails,
          transaction.redirect_url
        );

        const newEmailLog = new EmailLogs({
          transaction_id,
          customer_email,
          payload: "Create Transaction",
        });
        await newEmailLog.save();
      } catch (mailError) {
        console.error("Warning: Failed to send payment email:", mailError.message);
      }
    }

    return res.status(200).json({
      success: true,
      redirect_url: transaction.redirect_url,
      snap_token: transaction.token,
    });
  } catch (error) {
    console.error("Error creating transaction in Midtrans:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memproses transaksi pembayaran.",
    });
  }
};

/**
 * Endpoint to retrieve or regenerate payment link for a pending transaction
 */
exports.getPaymentLink = async (req, res) => {
  const { transaction_id } = req.params;

  try {
    if (!transaction_id || !mongoose.Types.ObjectId.isValid(transaction_id)) {
      return res.status(400).json({
        success: false,
        message: "ID Transaksi tidak valid",
      });
    }

    const existingTransaction = await Transactions.findById(transaction_id);
    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan",
      });
    }

    if (existingTransaction.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Transaksi sudah berstatus ${existingTransaction.status}`,
        status: existingTransaction.status,
      });
    }

    // If payment_link already exists in DB, return it immediately
    if (existingTransaction.payment_link) {
      return res.status(200).json({
        success: true,
        payment_link: existingTransaction.payment_link,
        snap_token: existingTransaction.snap_token,
      });
    }

    // Otherwise, fetch transaction items and create Snap transaction
    const items = await TransactionItems.find({ transaction_id });
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Item transaksi tidak ditemukan",
      });
    }

    const itemDetails = items.map((item) => ({
      id: item.product_id.toString(),
      name: item.product_name || "Menu",
      price: parseInt(item.unit_price, 10),
      quantity: parseInt(item.qty, 10),
    }));

    const grossAmount = existingTransaction.total_amount;

    const parameter = {
      transaction_details: {
        order_id: `VAILOVENT-${transaction_id}`,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: existingTransaction.customer_name,
        email: existingTransaction.customer_email,
      },
      item_details: itemDetails,
    };

    const snapResult = await snap.createTransaction(parameter);

    await Transactions.findByIdAndUpdate(transaction_id, {
      payment_link: snapResult.redirect_url,
      snap_token: snapResult.token,
    });

    return res.status(200).json({
      success: true,
      payment_link: snapResult.redirect_url,
      snap_token: snapResult.token,
    });
  } catch (error) {
    console.error("Error retrieving Midtrans payment link:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil link pembayaran dari Midtrans.",
    });
  }
};
