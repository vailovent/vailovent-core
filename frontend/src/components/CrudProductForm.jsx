import { useState, useEffect } from "react";
import { useProductStore } from "../store/productStore";
import { toast } from "react-toastify";

const ProductForm = ({ existingProduct, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: existingProduct?.name || "",
    description: existingProduct?.description || "",
    stock: existingProduct?.stock?.toString() || "1",
    price: existingProduct?.price?.toString() || "",
    image: existingProduct?.image || "",
  });

  const [imagePreview, setImagePreview] = useState(
    existingProduct?.image || ""
  );
  const [isUploading, setIsUploading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  const { createProduct, updateProduct, isLoading, error } = useProductStore();

  useEffect(() => {
    // Reset dirty state when form is successfully submitted
    if (!isLoading && !error && isDirty && onSuccess) {
      setIsDirty(false);
    }
  }, [isLoading, error, isDirty, onSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsDirty(true);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Format gambar harus berupa JPEG, PNG, atau WEBP!");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file gambar maksimal 5MB!");
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({
          ...prev,
          image: file,
        }));
        setIsUploading(false);
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Gagal memproses file gambar!");
      setIsUploading(false);
    }
  };

  // Di dalam ProductForm component:

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Nama produk wajib diisi";
    } else if (formData.name.trim().length > 100) {
      errors.name = "Nama produk maksimal 100 karakter";
    }

    if (!formData.description.trim()) {
      errors.description = "Deskripsi produk wajib diisi";
    } else if (formData.description.trim().length > 500) {
      errors.description = "Deskripsi produk maksimal 500 karakter";
    }

    if (isNaN(formData.stock) || Number(formData.stock) < 0) {
      errors.stock = "Jumlah stok harus berupa angka valid (minimal 0)";
    }

    if (
      !formData.price ||
      isNaN(formData.price) ||
      Number(formData.price) < 0
    ) {
      errors.price = "Harga produk wajib diisi dengan angka valid";
    } else if (Number(formData.price) > 100000000) {
      errors.price = "Harga produk maksimal Rp 100.000.000";
    }

    // Validasi gambar berbeda untuk create dan update
    if (!existingProduct && !(formData.image instanceof File)) {
      errors.image = "Foto produk wajib diunggah";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Mohon periksa dan lengkapi kolom yang ditandai merah");
      return;
    }

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        stock: Number(formData.stock),
        price: Number(formData.price),
        image: formData.image, // Bisa berupa File object atau URL string
      };

      if (existingProduct) {
        await updateProduct(
          existingProduct._id,
          productData,
          formData.image instanceof File ? formData.image : null
        );
      } else {
        await createProduct(productData, formData.image);
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const formatPrice = (value) => {
    if (!value) return "";
    return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handlePriceChange = (e) => {
    const rawValue = e.target.value.replace(/\./g, "");
    setFormData((prev) => ({
      ...prev,
      price: rawValue,
    }));
    setIsDirty(true);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {existingProduct ? "Edit Product" : "Add New Product"}
        </h2>
        {isDirty && (
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
            Unsaved changes
          </span>
        )}
      </div>

      {Object.keys(formErrors).length > 0 && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-700">
                There {Object.keys(formErrors).length === 1 ? "is" : "are"}{" "}
                {Object.keys(formErrors).length} error
                {Object.keys(formErrors).length === 1 ? "" : "s"} in your
                submission
              </h3>
              <ul className="mt-2 text-sm text-red-600 list-disc pl-5 space-y-1">
                {Object.values(formErrors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Product Image <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-shrink-0 h-40 w-40 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 relative bg-gray-50 flex items-center justify-center">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                    <span className="text-white text-xs font-medium opacity-0 hover:opacity-100 transition-opacity">
                      Change Image
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <svg
                    className="mx-auto h-10 w-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-1 text-xs text-gray-500">
                    Recommended: 800x800px
                  </p>
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-3">
                  Upload a high-quality product image. Supported formats: JPG,
                  PNG, WEBP (max 5MB)
                </p>
                <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
                  {isUploading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    "Select Image"
                  )}
                  <input
                    type="file"
                    className="sr-only"
                    onChange={handleImageChange}
                    accept="image/*"
                    disabled={isUploading}
                  />
                </label>
              </div>
              {formErrors.image && (
                <p className="text-sm text-red-600 mt-1">{formErrors.image}</p>
              )}
            </div>
          </div>
        </div>

        {/* Product Name */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`block w-full rounded-md shadow-sm border ${
              formErrors.name
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            } py-2 px-3 sm:text-sm`}
            placeholder="e.g., Premium Coffee Beans"
            maxLength={100}
          />
          <div className="flex justify-between">
            {formErrors.name ? (
              <p className="text-sm text-red-600">{formErrors.name}</p>
            ) : (
              <span className="text-xs text-gray-500">
                {formData.name.length}/100 characters
              </span>
            )}
          </div>
        </div>

        {/* Product Description */}
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className={`block w-full rounded-md shadow-sm border ${
              formErrors.description
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            } py-2 px-3 sm:text-sm`}
            placeholder="Describe the product features, benefits, and specifications..."
            maxLength={500}
          />
          <div className="flex justify-between">
            {formErrors.description ? (
              <p className="text-sm text-red-600">{formErrors.description}</p>
            ) : (
              <span className="text-xs text-gray-500">
                {formData.description.length}/500 characters
              </span>
            )}
          </div>
        </div>

        {/* Stock and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stock Status */}
          <div className="space-y-2">
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700"
            >
              Product Status <span className="text-red-500">*</span>
            </label>
            <select
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className={`block w-full rounded-md shadow-sm border ${
                formErrors.stock
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              } py-2 px-3 sm:text-sm`}
            >
              <option value="1">Active (Available)</option>
              <option value="0">Inactive (Out of Stock)</option>
            </select>
            {formErrors.stock && (
              <p className="text-sm text-red-600">{formErrors.stock}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              Price (IDR) <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">Rp</span>
              </div>
              <input
                type="text"
                id="price"
                name="price"
                value={formatPrice(formData.price)}
                onChange={handlePriceChange}
                className={`block w-full pl-10 pr-12 rounded-md border ${
                  formErrors.price
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                } py-2 sm:text-sm`}
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">,00</span>
              </div>
            </div>
            {formErrors.price && (
              <p className="text-sm text-red-600">{formErrors.price}</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || isUploading}
            className={`py-2 px-5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading || isUploading
                ? "bg-indigo-400"
                : "bg-indigo-600 hover:bg-indigo-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {existingProduct ? "Updating..." : "Creating..."}
              </span>
            ) : existingProduct ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
