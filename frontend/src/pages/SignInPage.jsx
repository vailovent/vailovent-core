import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { FiUser, FiLock, FiLoader } from "react-icons/fi";
import { FaUserShield } from "react-icons/fa";

export default function SignInPage() {
  const navigate = useNavigate();
  const { signin, isLoading } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [isFocused, setIsFocused] = useState({
    username: false,
    password: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await signin(username, password);
      navigate("/admin/transaction");
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Username atau password salah. Silakan coba lagi."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-gray-100 to-indigo-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-md border border-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 text-center text-white">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/15 flex items-center justify-center text-2xl shadow-inner border border-white/20">
            <FaUserShield className="text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Portal Admin Restoran
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1.5 font-medium">
            Masuk untuk mengelola transaksi & menu dapur
          </p>
        </div>

        {/* Form Section */}
        <div className="p-6 sm:p-8">
          {errorMessage && (
            <div
              className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl"
              role="alert"
              aria-live="assertive"
            >
              <p className="text-red-700 text-sm font-semibold">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
                Username
              </label>
              <div
                className={`relative rounded-xl transition ${
                  isFocused.username ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiUser className="text-base" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none bg-gray-50 text-sm font-medium"
                  placeholder="Masukkan username admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setIsFocused({ ...isFocused, username: true })}
                  onBlur={() => setIsFocused({ ...isFocused, username: false })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
                Password
              </label>
              <div
                className={`relative rounded-xl transition ${
                  isFocused.password ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiLock className="text-base" />
                </div>
                <input
                  type="password"
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none bg-gray-50 text-sm font-medium"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsFocused({ ...isFocused, password: true })}
                  onBlur={() => setIsFocused({ ...isFocused, password: false })}
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className={`w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 transition active:scale-95 shadow-blue-500/20 ${
                  isLoading ? "opacity-80 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FiLoader className="animate-spin mr-2 h-4 w-4" />
                    Memverifikasi Masuk...
                  </>
                ) : (
                  "Masuk ke Dashboard"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center font-medium">
            &copy; {new Date().getFullYear()} Vailovent &bull; Sistem Manajemen Restoran
          </p>
        </div>
      </div>
    </div>
  );
}
