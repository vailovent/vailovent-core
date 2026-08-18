const { snap } = require("./setUpMidtrans");
const Products = require("../../models/productSchema");
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

  console.log(parameter);

  try {
    const transaction = await snap.createTransaction(parameter);

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
    });
  } catch (error) {
    console.error("Error creating transaction in Midtrans:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memproses transaksi pembayaran.",
    });
  }
};
