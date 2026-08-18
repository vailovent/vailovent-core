const Products = require("../../models/productSchema");

exports.getAllProducts = async (req, res) => {
  try {
    let { page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const skip = (page - 1) * limit;

    const allProducts = await Products.find({}).skip(skip).limit(limit);

    const totalProducts = await Products.countDocuments();

    if (allProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
        data: null,
      });
    }

    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully!",
      count: allProducts.length,
      total: totalProducts,
      page: page,
      totalPages: Math.ceil(totalProducts / limit),
      data: allProducts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred!",
      data: null,
    });
  }
};

exports.getAllProductsForAdmin = async (req, res) => {
  try {
    let { page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const skip = (page - 1) * limit;

    const allProducts = await Products.find({}).skip(skip).limit(limit);

    const totalProducts = await Products.countDocuments();

    if (allProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully!",
      count: allProducts.length,
      total: totalProducts,
      page: page,
      totalPages: Math.ceil(totalProducts / limit),
      data: allProducts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred!",
      data: null,
    });
  }
};
