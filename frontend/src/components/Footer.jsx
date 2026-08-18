import { Link } from "react-router-dom";
import { FaInstagram, FaEnvelope, FaPhoneAlt, FaShieldAlt } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-black text-gray-300 py-12 mt-16 border-t border-gray-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              Vailovent
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Sistem pemesanan makanan & minuman cerdas langsung dari meja restoran Anda. Cepat, higienis, dan terintegrasi Soundbox otomatis.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-white mb-4">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/home"
                  className="hover:text-blue-400 transition-colors"
                >
                  Daftar Menu
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="hover:text-blue-400 transition-colors"
                >
                  Keranjang Pesanan
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/signin"
                  className="text-gray-500 hover:text-gray-300 transition-colors text-xs"
                >
                  Portal Manajemen Restoran
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Privacy */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-white mb-4 flex items-center gap-1.5">
              <FaShieldAlt className="text-blue-400 text-xs" />
              Legal & Privasi
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/terms"
                  className="hover:text-blue-400 transition-colors"
                >
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-blue-400 transition-colors"
                >
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Socials */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-white mb-4">
              Bantuan & Kontak
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-blue-400 text-xs shrink-0" />
                <a
                  href="mailto:vailovent@gmail.com"
                  className="hover:text-blue-400 transition-colors truncate"
                >
                  vailovent@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FaPhoneAlt className="text-blue-400 text-xs shrink-0" />
                <a
                  href="tel:+6289527749870"
                  className="hover:text-blue-400 transition-colors"
                >
                  +62 895 2774 9870
                </a>
              </li>
              <li className="flex items-center gap-2 pt-1">
                <a
                  href="https://www.instagram.com/_excelv/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-pink-400 hover:text-pink-300 transition-colors"
                >
                  <FaInstagram className="text-sm" />
                  <span>@_excelv</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-gray-800/80 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-3">
          <p>&copy; {new Date().getFullYear()} Vailovent. Seluruh Hak Cipta Dilindungi.</p>
          <p>Powered by Smart IoT Soundbox & Midtrans</p>
        </div>
      </div>
    </footer>
  );
}
