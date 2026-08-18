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
  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("vailovent_favorites") || "[]");
      return Array.isArray(saved) && saved.includes(product._id);
    } catch {
      return false;
    }
  });
  const [isHovered, setIsHovered] = useState(false);

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("Maaf, produk ini sedang habis!");
      return;
    }
    if (quantity <= 0) {
      toast.error("Pilih minimal 1 porsi menu untuk ditambahkan ke keranjang");
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
            {quantity}x ditambahkan ke keranjang •{" "}
            {((product.price || 0) * quantity).toLocaleString("id-ID", {
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
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    try {
      const saved = JSON.parse(localStorage.getItem("vailovent_favorites") || "[]");
      const updated = newFavoriteState
        ? Array.from(new Set([...saved, product._id]))
        : saved.filter((id) => id !== product._id);
      localStorage.setItem("vailovent_favorites", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save favorite in localStorage:", err);
    }

    toast.info(
      <div className="flex items-center">
        {newFavoriteState ? (
          <>
            <FaHeart className="text-pink-500 mr-2" />
            <span>Ditambahkan ke favorit</span>
          </>
        ) : (
          <>
            <FaRegHeart className="text-pink-500 mr-2" />
            <span>Dihapus dari favorit</span>
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
      className={`flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 h-full border ${
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
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-2">
            <span className="bg-red-600 text-white font-extrabold px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs uppercase tracking-wider shadow-lg text-center">
              Stok Habis
            </span>
          </div>
        )}

        {/* Always Accessible Favorite Button (Optimized for Mobile & Desktop) */}
        {!isOutOfStock && (
          <button
            className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-white/90 backdrop-blur-sm p-2 sm:p-2.5 rounded-full shadow-md hover:bg-white active:scale-90 transition-all"
            onClick={toggleFavorite}
            aria-label={
              isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"
            }
          >
            {isFavorite ? (
              <FaHeart className="text-pink-500 text-xs sm:text-base" />
            ) : (
              <FaRegHeart className="text-gray-600 hover:text-pink-500 text-xs sm:text-base" />
            )}
          </button>
        )}
      </div>

      {/* Product Content */}
      <div className="p-3 sm:p-5 flex flex-col flex-grow">
        {/* Product Name */}
        <h2
          className="text-xs sm:text-base md:text-lg font-bold text-gray-800 line-clamp-2 mb-1"
          title={product.name}
        >
          {product.name}
        </h2>

        {/* Price */}
        <p className="text-sm sm:text-lg md:text-xl font-extrabold text-green-600 mb-1.5 sm:mb-2.5">
          {formatPrice(product.price)}
        </p>

        {/* Stock Status Badge */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span
            className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full ${
              isOutOfStock
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOutOfStock ? "bg-red-500" : "bg-emerald-500"
              }`}
            />
            {isOutOfStock ? "Stok Habis" : "Tersedia"}
          </span>
        </div>

        {/* Expandable Description */}
        <div className="mb-2 sm:mb-4">
          <p
            className={`text-gray-600 text-[11px] sm:text-xs md:text-sm ${
              isDescriptionExpanded ? "" : "line-clamp-2 sm:line-clamp-3"
            } transition-all duration-300 leading-snug sm:leading-relaxed`}
          >
            {product.description}
          </p>
          {product.description && product.description.length > 50 && (
            <button
              onClick={toggleDescription}
              className="text-blue-600 hover:text-blue-700 text-[10px] sm:text-xs font-semibold mt-0.5 sm:mt-1 flex items-center gap-0.5"
            >
              {isDescriptionExpanded ? (
                <>
                  <span>Tutup</span>
                  <FaChevronUp size={8} />
                </>
              ) : (
                <>
                  <span>Selengkapnya</span>
                  <FaChevronDown size={8} />
                </>
              )}
            </button>
          )}
        </div>

        {/* Quantity Controls and Add to Cart */}
        <div className="mt-auto pt-2.5 sm:pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quantity Selector with compact responsive sizing */}
            <div
              className={`flex items-center border border-gray-300 rounded-xl overflow-hidden ${
                isOutOfStock ? "bg-gray-100 opacity-50" : "bg-gray-50 shadow-inner"
              } h-9 sm:h-11`}
            >
              <button
                onClick={decrementQty}
                disabled={isOutOfStock}
                className="w-7 sm:w-9 h-full flex items-center justify-center text-gray-600 hover:bg-gray-200 active:bg-gray-300 active:scale-95 transition-colors disabled:cursor-not-allowed text-[10px] sm:text-xs"
                aria-label="Kurangi jumlah"
              >
                <FaMinus />
              </button>
              <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-bold text-gray-800 bg-white h-full flex items-center justify-center border-x border-gray-200">
                {isOutOfStock ? 0 : quantity}
              </span>
              <button
                onClick={incrementQty}
                disabled={isOutOfStock}
                className="w-7 sm:w-9 h-full flex items-center justify-center text-gray-600 hover:bg-gray-200 active:bg-gray-300 active:scale-95 transition-colors disabled:cursor-not-allowed text-[10px] sm:text-xs"
                aria-label="Tambah jumlah"
              >
                <FaPlus />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 h-9 sm:h-11 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 rounded-xl font-bold transition-all shadow-sm ${
                isOutOfStock
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 active:scale-95 shadow-md shadow-blue-500/20"
              }`}
            >
              <FaShoppingCart className="text-xs sm:text-sm" />
              <span className="text-[11px] sm:text-sm whitespace-nowrap">
                {isOutOfStock ? "Habis" : "Tambah"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
