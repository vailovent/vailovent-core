import { useState } from "react";
import {
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaStar,
  FaChevronDown,
  FaChevronUp,
  FaHeart,
  FaRegHeart,
  FaInfoCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useCartStore } from "../store/cartStore";

export default function ProductCard({ product }) {
  const { addItemToCart } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("Maaf, produk ini sedang habis!");
      return;
    }
    if (quantity <= 0) {
      toast.error("Please select at least 1 item to add to cart");
      return;
    }
    addItemToCart({ ...product, quantity });
    toast.success(
      <div className="flex items-center">
        <img
          src={product.image}
          alt={product.name}
          className="w-10 h-10 rounded-md mr-3 object-cover"
        />
        <div>
          <p className="font-semibold text-sm">{product.name}</p>
          <p className="text-xs text-gray-600">
            {quantity}x added to cart •{" "}
            {product.price.toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            })}
          </p>
        </div>
      </div>,
      {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    setQuantity(1);
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toast.info(
      <div className="flex items-center">
        {isFavorite ? (
          <>
            <FaRegHeart className="text-pink-500 mr-2" />
            <span>Removed from favorites</span>
          </>
        ) : (
          <>
            <FaHeart className="text-pink-500 mr-2" />
            <span>Added to favorites</span>
          </>
        )}
      </div>,
      {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: true,
      }
    );
  };

  const incrementQty = () => {
    if (!isOutOfStock) setQuantity(quantity + 1);
  };
  const decrementQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const formatPrice = (price) => {
    return price.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });
  };

  return (
    <div
      className={`flex flex-col bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 h-full border ${
        isOutOfStock ? "opacity-75 border-gray-200" : "border-gray-100 hover:border-blue-100"
      } relative`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image with interactive elements */}
      <div className="relative overflow-hidden aspect-square w-full group">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isOutOfStock ? "grayscale-[50%]" : "group-hover:scale-105"
          }`}
          loading="lazy"
        />

        {/* Out of Stock Overlay Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-full text-xs uppercase tracking-wider shadow-md">
              Stok Habis
            </span>
          </div>
        )}

        {/* Interactive overlay */}
        {isHovered && !isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center transition-opacity duration-300">
            <button
              className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
              onClick={toggleFavorite}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              {isFavorite ? (
                <FaHeart className="text-pink-500" />
              ) : (
                <FaRegHeart className="text-gray-600 hover:text-pink-500" />
              )}
            </button>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {product.isPopular && (
            <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm">
              <FaStar className="mr-1" /> Popular
            </div>
          )}
          {product.isNew && (
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              New
            </div>
          )}
          {product.discount && (
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              {product.discount}% OFF
            </div>
          )}
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 md:p-5 flex flex-col flex-grow">
        {/* Product Name */}
        <h2
          className="text-lg md:text-xl font-bold text-gray-800 line-clamp-2 mb-2"
          title={product.name}
        >
          {product.name}
        </h2>

        {/* Price - Moved below name for better hierarchy */}
        <p className="text-xl font-bold text-green-600 mb-3">
          {formatPrice(product.price)}
        </p>

        {/* Rating and Category */}
        <div className="flex items-center justify-between mb-3">
          {product.rating ? (
            <div className="flex items-center bg-blue-50 px-2 py-1 rounded text-sm">
              <FaStar className="text-yellow-400 mr-1" />
              <span className="font-medium">{product.rating}</span>
              <span className="text-gray-500 text-xs ml-1">
                ({product.reviewCount || 0})
              </span>
            </div>
          ) : (
            <div className="text-gray-400 text-sm flex items-center">
              <FaInfoCircle className="mr-1" />
              <span>{isOutOfStock ? "Tidak tersedia" : "Tersedia"}</span>
            </div>
          )}
          {product.category && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {product.category}
            </span>
          )}
        </div>

        {/* Expandable Description */}
        <div className="mb-4">
          <p
            className={`text-gray-600 text-sm ${
              isDescriptionExpanded ? "" : "line-clamp-3"
            } transition-all duration-300`}
          >
            {product.description}
          </p>
          {product.description && product.description.length > 80 && (
            <button
              onClick={toggleDescription}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium mt-1 flex items-center transition-colors"
            >
              {isDescriptionExpanded ? (
                <>
                  <span>Show Less</span>
                  <FaChevronUp className="ml-1" size={12} />
                </>
              ) : (
                <>
                  <span>Read More</span>
                  <FaChevronDown className="ml-1" size={12} />
                </>
              )}
            </button>
          )}
        </div>

        {/* Quantity Controls and Add to Cart */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-stretch gap-2">
            {/* Quantity Selector */}
            <div
              className={`flex items-center border border-gray-200 rounded-lg ${
                isOutOfStock ? "bg-gray-100 opacity-50" : "bg-gray-50"
              } flex-1 max-w-[120px]`}
            >
              <button
                onClick={decrementQty}
                disabled={isOutOfStock}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors rounded-l-lg disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
              >
                <FaMinus size={12} />
              </button>
              <span className="px-2 py-1 text-base font-medium w-8 text-center bg-white">
                {isOutOfStock ? 0 : quantity}
              </span>
              <button
                onClick={incrementQty}
                disabled={isOutOfStock}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors rounded-r-lg disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                <FaPlus size={12} />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 flex items-center justify-center px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-medium transition-all shadow-sm min-w-[80px] ${
                isOutOfStock
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-md active:scale-[0.98]"
              }`}
            >
              <FaShoppingCart className="mr-1 sm:mr-2" />
              <span className="text-sm sm:text-base whitespace-nowrap">
                {isOutOfStock ? "Habis" : "Add"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
