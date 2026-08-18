const Transactions = require("../../models/transactionSchema");
const TransactionItems = require("../../models/transactionItemSchema");
const { findProductById } = require("../../utils/FindProduct");
const {
  createTransactionValidator,
} = require("../../middlewares/transactionValidators/createTransactionValidator");

exports.createTransaction = async (req, res) => {
  const { table_code, customer_name, customer_email, products } = req.body;

  try {
    const { error } = createTransactionValidator.validate({
      table_code,
      customer_name,
      customer_email,
      products,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((detail) => detail.message),
      });
    }

    // Cek transaksi yang masih pending dalam 5 menit terakhir
    const existingTransaction = await Transactions.findOne({
      table_code,
      status: "pending",
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
    });

    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: "A pending transaction is already in progress for this table!",
      });
    }

    let total_amount = 0;
    const transactionItems = [];
    const productsArray = Array.isArray(products) ? products : [products];

    for (const product of productsArray) {
      const productData = await findProductById(
        product._id || product.product_id
      );
      if (!productData) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${
            product._id || product.product_id
          } not found`,
        });
      }

      // Validasi stok produk
      if (productData.stock <= 0) {
        return res.status(400).json({
          success: false,
          message: `Produk "${productData.name}" saat ini sedang habis!`,
        });
      }

      if (
        isNaN(productData.price) ||
        isNaN(product.qty) ||
        productData.price <= 0 ||
        product.qty <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid price or quantity for product ${productData.name}`,
        });
      }

      const amount = product.qty * productData.price;
      total_amount += amount;

      transactionItems.push(
        new TransactionItems({
          transaction_id: null,
          product_id: product._id || product.product_id,
          product_name: productData.name,
          unit_price: productData.price,
          qty: product.qty,
          amount,
        })
      );
    }

    const transaction = new Transactions({
      table_code,
      customer_name,
      customer_email,
      total_amount,
    });

    const savedTransaction = await transaction.save();

    const updatedTransactionItems = transactionItems.map((item) => {
      item.transaction_id = savedTransaction._id;
      return item;
    });

    await TransactionItems.insertMany(updatedTransactionItems);

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: {
        _id: savedTransaction._id,
        table_code,
        customer_name,
        customer_email,
        total_amount: savedTransaction.total_amount,
      },
    });
  } catch (error) {
    console.error("[DEBUG] Detailed error:", {
      message: error.message,
      stack: error.stack,
      requestBody: req.body,
      requestFile: req.file
        ? {
            originalname: req.file.originalname,
            size: req.file.size,
          }
        : null,
    });
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred!",
    });
  }
};
