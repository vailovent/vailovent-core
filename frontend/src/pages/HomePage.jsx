import { useEffect, useState, useMemo } from "react";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import { useProductStore } from "../store/productStore";
import { FaShoppingCart, FaSearch, FaTimes, FaHeart, FaUtensils, FaCheckCircle } from "react-icons/fa";
import { useCartStore } from "../store/cartStore";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const { products, isLoading, error, fetchProducts } = useProductStore();
  const { cart } = useCartStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'favorites', 'available'
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  useEffect(() => {
    fetchProducts();
    try {
      const savedFavs = JSON.parse(localStorage.getItem("vailovent_favorites") || "[]");
      setFavorites(savedFavs);
    } catch {
      setFavorites([]);
    }
  }, [fetchProducts]);

  // Sync favorites when user changes tabs or local storage triggers
  const handleFilterClick = (filterType) => {
    setActiveFilter(filterType);
    setCurrentPage(1);
    if (filterType === "favorites") {
      try {
        const savedFavs = JSON.parse(localStorage.getItem("vailovent_favorites") || "[]");
        setFavorites(savedFavs);
      } catch {
        setFavorites([]);
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Format harga ke dalam IDR
  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });
  };

  // Hitung total quantity dalam cart
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Hitung total harga dalam cart
  const totalAmount = cart.reduce(
    (acc, item) => acc + (item.price || 0) * item.quantity,
    0
  );

  // Filter products by search and category chip
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description &&
          product.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeFilter === "favorites") {
        return favorites.includes(product._id);
      }
      if (activeFilter === "available") {
        return (product.stock || 0) > 0;
      }
      return true;
    });
  }, [products, searchQuery, activeFilter, favorites]);

  // Paginate list
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Hero Banner Section */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12 md:py-16 px-6 relative overflow-hidden border-b border-gray-800 shadow-md">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-4 backdrop-blur-sm">
            <FaUtensils className="text-xs" />
            Sistem Pemesanan Cerdas di Meja Restoran
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Nikmati Kelezatan Kuliner <br className="hidden md:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              Vailovent
            </span>
          </h1>
          <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Pilih menu favorit Anda langsung dari meja, lakukan pembayaran instan, dan pantau status memasak dapur secara real-time.
          </p>

          {/* Search Bar Input */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <FaSearch />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari makanan atau minuman lezat..."
              className="w-full pl-11 pr-10 py-3.5 bg-white text-gray-900 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/30 text-sm font-medium transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content & Filter Tabs */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
            <button
              onClick={() => handleFilterClick("all")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                activeFilter === "all"
                  ? "bg-blue-600 text-white shadow-blue-500/20"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Semua Menu ({products.length})
            </button>

            <button
              onClick={() => handleFilterClick("available")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                activeFilter === "available"
                  ? "bg-blue-600 text-white shadow-blue-500/20"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <FaCheckCircle className="text-xs text-emerald-500" />
              Tersedia
            </button>

            <button
              onClick={() => handleFilterClick("favorites")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                activeFilter === "favorites"
                  ? "bg-pink-600 text-white shadow-pink-500/20"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <FaHeart className="text-xs text-pink-500" />
              Favorit Saya
            </button>
          </div>

          <span className="text-xs text-gray-500 font-medium hidden sm:inline">
            Menampilkan {filteredProducts.length} hidangan
          </span>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-3" />
            <p className="text-sm font-medium text-gray-500">Memuat daftar menu...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 text-center max-w-md mx-auto bg-red-50 rounded-2xl border border-red-200 text-red-700 my-8">
            <p className="font-semibold">Gagal memuat menu</p>
            <p className="text-xs mt-1 text-red-500">{error}</p>
            <button
              onClick={() => fetchProducts()}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && (
          <>
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-auto my-8 border border-gray-200 shadow-sm">
                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  <FaUtensils />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  Menu Tidak Ditemukan
                </h3>
                <p className="text-xs text-gray-500 mb-6">
                  {searchQuery
                    ? `Tidak ada hidangan yang cocok dengan kata kunci "${searchQuery}"`
                    : activeFilter === "favorites"
                    ? "Anda belum menambahkan menu ke daftar favorit."
                    : "Belum ada produk yang tersedia saat ini."}
                </p>
                {(searchQuery || activeFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveFilter("all");
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
                  >
                    Reset Filter Pencarian
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 min-[520px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredProducts.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Modern Cart Bar (Optimized for Mobile Thumb Zone & Desktop) */}
      {totalQuantity > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-30 pointer-events-none animate-fadeIn">
          <button
            onClick={() => navigate("/cart")}
            className="w-full sm:w-auto pointer-events-auto bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 hover:from-blue-700 hover:to-indigo-900 text-white p-3.5 sm:px-6 sm:py-3.5 rounded-2xl shadow-2xl flex items-center justify-between sm:justify-start gap-4 transition-all transform active:scale-98 border border-white/25 backdrop-blur-md"
            aria-label="Lihat keranjang pesanan"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <FaShoppingCart className="text-xl text-white" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[11px] font-black rounded-full h-5 min-w-5 px-1 flex items-center justify-center border-2 border-blue-900 shadow-md">
                  {totalQuantity}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[11px] text-blue-200 font-medium leading-none">Keranjang Pesanan</p>
                <p className="text-xs sm:text-sm font-extrabold tracking-tight mt-1">
                  {totalQuantity} Menu Dipilih
                </p>
              </div>
            </div>

            <div className="text-right pl-4 border-l border-white/20">
              <p className="text-[10px] text-blue-200 uppercase tracking-wider font-bold">Total Tagihan</p>
              <p className="text-sm sm:text-base font-black text-white">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
