import { useState } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaHome, FaBars, FaTimes } from "react-icons/fa";
import { useCartStore } from "../store/cartStore"; // Import store

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { cart } = useCartStore(); // Ambil cart dari store

  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Fungsi untuk menutup menu dan scroll ke atas
  const handleNavClick = () => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };

  // Get the cart count
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-700 shadow-lg sticky top-0 z-10 transition-shadow duration-300">
      <div className="container mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {!logoError ? (
            <img
              src="https://ta-project-soundbox-payment-180294196054-us-east-1-an.s3.us-east-1.amazonaws.com/vailovent-logo-black"
              alt="Vailovent Logo"
              onError={() => setLogoError(true)}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-500 object-cover"
            />
          ) : (
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg border-2 border-gray-500">
              V
            </div>
          )}
          <Link
            to="/home"
            className="text-2xl md:text-3xl font-extrabold text-white hover:text-gray-300 tracking-tight"
          >
            Vailovent
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 items-center">
          <Link
            to="/home"
            className="flex items-center space-x-2 text-white hover:text-gray-300 transition duration-200"
          >
            <FaHome />
            <span className="font-medium">Home</span>
          </Link>

          <Link
            to="/cart"
            className="flex items-center space-x-2 text-white hover:text-gray-300 transition duration-200 relative"
          >
            <FaShoppingCart />
            <span className="font-medium">Cart</span>
            {cartCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 ml-1">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            aria-label="Toggle menu navigasi"
            aria-expanded={menuOpen}
            className="text-white text-2xl p-2 rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-colors"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Slide In from Right */}
      <div
        className={`fixed inset-y-0 right-0 w-64 bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl transform transition-transform duration-300 z-20 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="py-6 px-4">
          <button
            onClick={toggleMenu}
            aria-label="Tutup menu"
            className="block ml-auto text-white text-2xl p-2 rounded hover:bg-gray-700 transition"
          >
            <FaTimes />
          </button>
          <div className="mt-6 space-y-3">
            <Link
              to="/home"
              className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-700/50 rounded-lg font-medium transition"
              onClick={handleNavClick}
            >
              <FaHome className="text-lg" />
              <span>Home</span>
            </Link>

            <Link
              to="/cart"
              className="flex items-center justify-between px-4 py-3 text-white hover:bg-gray-700/50 rounded-lg font-medium transition"
              onClick={handleNavClick}
            >
              <div className="flex items-center gap-3">
                <FaShoppingCart className="text-lg" />
                <span>Cart</span>
              </div>
              {cartCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2.5 py-0.5">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Backdrop overlay for mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 md:hidden"
          onClick={toggleMenu}
        />
      )}
    </div>
  );
}
