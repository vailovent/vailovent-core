import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomerOrders } from "../utils/orderHistoryHelper";
import { formatCurrency } from "../utils/FormatCurrency";
import {
  FaReceipt,
  FaTimes,
  FaUtensils,
  FaClock,
  FaFire,
  FaCheckCircle,
  FaSearch,
  FaExternalLinkAlt,
} from "react-icons/fa";

export default function MyOrdersModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchOrderId, setSearchOrderId] = useState("");

  useEffect(() => {
    if (isOpen) {
      setOrders(getCustomerOrders());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTrackSearch = (e) => {
    e.preventDefault();
    const cleanId = searchOrderId.trim();
    if (!cleanId) return;

    const targetOrderId = cleanId.startsWith("VAILOVENT-")
      ? cleanId
      : `VAILOVENT-${cleanId}`;

    onClose();
    navigate(`/payment-status?order_id=${encodeURIComponent(targetOrderId)}`);
  };

  const handleOpenOrder = (orderId) => {
    onClose();
    navigate(`/payment-status?order_id=${encodeURIComponent(orderId)}`);
  };

  const getCookingBadge = (cookingStatus) => {
    switch (cookingStatus) {
      case "Being Cooked":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
            <FaFire className="text-amber-500 animate-pulse" />
            <span>Sedang Dimasak</span>
          </span>
        );
      case "Ready to Serve":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">
            <FaUtensils className="text-blue-500" />
            <span>Siap Disajikan</span>
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
            <FaCheckCircle className="text-emerald-500" />
            <span>Pesanan Selesai</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-xs font-bold">
            <FaClock className="text-gray-500" />
            <span>Pesanan Diterima</span>
          </span>
        );
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[11px] font-bold">
            Lunas
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-md text-[11px] font-bold">
            Menunggu Bayar
          </span>
        );
      case "expired":
        return (
          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-md text-[11px] font-bold">
            Kedaluwarsa
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-md text-[11px] font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="my-orders-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-gray-100 transform transition-all animate-scaleUp overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 p-5 sm:p-6 text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-inner">
              <FaReceipt className="text-lg" />
            </div>
            <div>
              <h3 id="my-orders-modal-title" className="text-base sm:text-lg font-bold">
                Pesanan & Riwayat Saya
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Pantau proses memasak dan struk transaksi restoran Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800 transition"
            aria-label="Tutup riwayat pesanan"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        {/* Quick Search Lookup */}
        <div className="p-4 sm:p-5 bg-blue-50/50 border-b border-blue-100">
          <form onSubmit={handleTrackSearch} className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaSearch className="text-xs" />
              </div>
              <input
                type="text"
                placeholder="Punya Order ID dari struk? (Contoh: VAILOVENT-...)"
                className="w-full pl-9 pr-3 py-2 bg-white border border-blue-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition shrink-0"
            >
              Lacak
            </button>
          </form>
        </div>

        {/* Order Cards List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {orders.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl">
                <FaReceipt />
              </div>
              <p className="font-bold text-gray-800 text-sm">Belum Ada Riwayat Pesanan</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Setelah Anda memesan makanan atau minuman, daftar struk dan status masak pesanan akan otomatis tersimpan di sini.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.order_id || order.transaction_id}
                className="p-4 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition bg-white space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-blue-600 text-white rounded-lg text-xs font-black">
                        Meja {order.table_code}
                      </span>
                      {getPaymentBadge(order.status)}
                    </div>
                    <p className="text-xs font-mono text-gray-500 mt-1.5 truncate max-w-[220px] sm:max-w-none">
                      {order.order_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-blue-700">
                      {formatCurrency(order.total_amount || 0)}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    {order.status === "completed" && getCookingBadge(order.cooking_status)}
                  </div>
                  <button
                    onClick={() => handleOpenOrder(order.order_id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition ml-auto"
                  >
                    <span>Pantau Status Live</span>
                    <FaExternalLinkAlt className="text-[10px]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Riwayat tersimpan di browser perangkat Anda</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
