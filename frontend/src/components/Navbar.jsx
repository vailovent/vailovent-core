import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaHome, FaBars, FaTimes, FaReceipt } from "react-icons/fa";
import { useCartStore } from "../store/cartStore";
import MyOrdersModal from "./MyOrdersModal";
import { getActiveCustomerOrdersCount } from "../utils/orderHistoryHelper";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [activeOrderCount, setActiveOrderCount] = useState(0);
  const { cart } = useCartStore();

  // Read only active in-progress customer orders count (excluding Completed/Expired)
  useEffect(() => {
    const updateCount = () => {
      const activeCount = getActiveCustomerOrdersCount();
      setActiveOrderCount(activeCount);
    };
    updateCount();
    window.addEventListener("storage", updateCount);
    return () => window.removeEventListener("storage", updateCount);
  }, [isOrdersModalOpen]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Fungsi untuk menutup menu dan scroll ke atas
  const handleNavClick = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenOrdersModal = () => {
    setMenuOpen(false);
    setIsOrdersModalOpen(true);
  };

  // Get the cart count
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <header className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 shadow-lg sticky top-0 z-30 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {!logoError ? (
              <img
                src="https://ta-project-soundbox-payment-180294196054-us-east-1-an.s3.us-east-1.amazonaws.com/vailovent-logo-black"
                alt="Vailovent Logo"
                onError={() => setLogoError(true)}
                className="w-10 h-10 rounded-xl border border-gray-700 object-cover shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                V
              </div>
            )}
            <Link
              to="/home"
              className="text-xl sm:text-2xl font-black text-white hover:text-blue-300 tracking-tight transition"
            >
              Vailovent
            </Link>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Link
              to="/home"
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-200 hover:text-white hover:bg-white/10 rounded-xl transition"
            >
              <FaHome className="text-base" />
              <span>Beranda Menu</span>
            </Link>

            <button
              onClick={handleOpenOrdersModal}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-200 hover:text-white hover:bg-white/10 rounded-xl transition relative"
            >
              <FaReceipt className="text-base text-amber-400" />
              <span>Pesanan Saya</span>
              {activeOrderCount > 0 && (
                <span className="bg-amber-500 text-gray-900 text-[10px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center shadow">
                  {activeOrderCount}
                </span>
              )}
            </button>

            <Link
              to="/cart"
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md shadow-blue-500/20 relative"
            >
              <FaShoppingCart className="text-base" />
              <span>Keranjang</span>
              {cartCount > 0 && (
                <span className="bg-red-500 text-white text-[11px] font-black rounded-full h-5 min-w-5 px-1 flex items-center justify-center border-2 border-blue-900 shadow">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              aria-label="Toggle menu navigasi"
              aria-expanded={menuOpen}
              className="text-white text-xl p-2 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop Overlay for Mobile Menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          onClick={toggleMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Slide-in Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-72 max-w-[80vw] bg-gray-900 border-l border-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 md:hidden flex flex-col ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi mobile"
      >
        {/* Drawer Header */}
        <div className="p-5 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
              V
            </div>
            <span className="font-extrabold text-white text-base">Menu Navigasi</span>
          </div>
          <button
            onClick={toggleMenu}
            aria-label="Tutup menu"
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800 transition"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Drawer Links */}
        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          <Link
            to="/home"
            className="flex items-center gap-3.5 px-4 py-3.5 text-gray-200 hover:text-white hover:bg-gray-800/80 rounded-xl font-semibold transition"
            onClick={handleNavClick}
          >
            <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-blue-400">
              <FaHome className="text-base" />
            </div>
            <span>Beranda Menu</span>
          </Link>

          <button
            onClick={handleOpenOrdersModal}
            className="w-full flex items-center justify-between px-4 py-3.5 text-gray-200 hover:text-white hover:bg-gray-800/80 rounded-xl font-semibold transition text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-amber-400">
                <FaReceipt className="text-base" />
              </div>
              <span>Pesanan Saya</span>
            </div>
            {activeOrderCount > 0 && (
              <span className="bg-amber-500 text-gray-900 text-xs font-black rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center shadow">
                {activeOrderCount}
              </span>
            )}
          </button>

          <Link
            to="/cart"
            className="flex items-center justify-between px-4 py-3.5 text-gray-200 hover:text-white hover:bg-gray-800/80 rounded-xl font-semibold transition"
            onClick={handleNavClick}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-blue-400">
                <FaShoppingCart className="text-base" />
              </div>
              <span>Keranjang Pesanan</span>
            </div>
            {cartCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-black rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Drawer Footer */}
        <div className="p-5 border-t border-gray-800 bg-gray-950/50">
          <p className="text-xs text-gray-400 text-center font-medium">
            Vailovent &bull; Smart Restaurant Ordering
          </p>
        </div>
      </div>

      {/* Floating My Orders Modal */}
      <MyOrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
      />
    </>
  );
}
