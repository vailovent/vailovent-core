import { Link } from "react-router-dom";
import { FaHome, FaExclamationTriangle } from "react-icons/fa";

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-gray-100">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          <FaExclamationTriangle />
        </div>
        <h1 className="text-6xl font-extrabold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-800 mb-3">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Maaf, halaman yang Anda cari tidak tersedia, telah dipindahkan, atau alamat URL yang dimasukkan salah.
        </p>
        <Link
          to="/home"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-md transition-all active:scale-[0.98]"
        >
          <FaHome className="text-lg" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
