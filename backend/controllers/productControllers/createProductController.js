const {
  createProductValidator,
} = require("../../middlewares/productValidators/createProductValidator");
const Products = require("../../models/productSchema");
const {
  findProductByName,
  findProductByImage,
} = require("../../utils/FindProduct");
const { uploadToS3 } = require("../../controllers/awsS3Controllers/setUp");
const { deleteFromS3 } = require("../../utils/deleteFromS3");

exports.createProduct = async (req, res) => {
  let uploadedImageUrl = null;

  try {
    const { name, description, stock, price } = req.body;

    // 1. Validasi input data
    const { error } = createProductValidator.validate({
      name,
      description,
      stock: Number(stock),
      price: Number(price),
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: errorMessages,
      });
    }

    // 2. Validasi file gambar ada
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required!",
      });
    }

    // 3. CEK DUPLIKASI NAMA PRODUK SEBELUM UPLOAD KE S3 (mencegah S3 leak)
    const existingProductByName = await findProductByName(name);
    if (existingProductByName) {
      return res.status(400).json({
        success: false,
        message: "Product already exists!",
        data: existingProductByName,
      });
    }

    // 4. Upload ke S3 setelah semua validasi lolos
    uploadedImageUrl = await uploadToS3(req.file);

    // 5. Cek duplikasi URL gambar jika ada
    const existingProductByImage = await findProductByImage(uploadedImageUrl);
    if (existingProductByImage) {
      await deleteFromS3(uploadedImageUrl).catch((err) =>
        console.error("Failed to delete S3 image on duplicate:", err)
      );
      return res.status(400).json({
        success: false,
        message: "Product image already exists!",
        data: existingProductByImage,
      });
    }

    // 6. Buat dokumen produk baru di MongoDB
    const product = new Products({
      name,
      description,
      stock: Number(stock),
      price: Number(price),
      image: uploadedImageUrl,
    });

    const result = await product.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully!",
      data: result,
    });
  } catch (error) {
    // Jika upload berhasil tapi proses penyimpanan DB gagal, bersihkan file dari S3
    if (uploadedImageUrl) {
      await deleteFromS3(uploadedImageUrl).catch((err) =>
        console.error("Failed to clean up S3 file after error:", err)
      );
    }

    console.error("Error in createProduct:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An internal server error occurred!",
      data: null,
    });
  }
};
