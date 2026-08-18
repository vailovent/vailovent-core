import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaClipboardList, FaUtensils, FaSignOutAlt, FaUserShield } from "react-icons/fa";
import { useAuthStore } from "../store/authStore";

export default function AdminNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signout } = useAuthStore();

  const isTransactions = location.pathname.startsWith("/admin/transaction");
  const isProducts = location.pathname.startsWith("/admin/products");

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar dari panel admin?");
    if (confirmLogout) {
      await signout();
      navigate("/admin/signin");
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              <FaUserShield className="text-base" />
            </div>
            <div>
              <span className="font-extrabold text-gray-900 text-base sm:text-lg">
                Admin Panel
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-blue-100 text-blue-800 rounded-full">
                Restoran
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/admin/transaction"
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isTransactions
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <FaClipboardList className={isTransactions ? "text-blue-600" : "text-gray-400"} />
              <span className="hidden xs:inline">Daftar Transaksi</span>
            </Link>

            <Link
              to="/admin/products"
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isProducts
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <FaUtensils className={isProducts ? "text-blue-600" : "text-gray-400"} />
              <span className="hidden xs:inline">Kelola Menu</span>
            </Link>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
            title="Keluar dari sesi admin"
          >
            <FaSignOutAlt />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
