import { useEffect } from "react";
import {
  FaExclamationTriangle,
  FaSignOutAlt,
  FaTrashAlt,
  FaTimes,
  FaUtensils,
  FaCheckCircle,
} from "react-icons/fa";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Aksi",
  message = "Apakah Anda yakin ingin melanjutkan tindakan ini?",
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "danger", // 'danger', 'warning', 'info', 'success'
  isLoading = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <FaTrashAlt />,
          badgeClass: "bg-red-100 text-red-600 border border-red-200",
          btnClass:
            "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-500/20",
        };
      case "warning":
        return {
          icon: <FaSignOutAlt />,
          badgeClass: "bg-amber-100 text-amber-600 border border-amber-200",
          btnClass:
            "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-amber-500/20",
        };
      case "success":
        return {
          icon: <FaCheckCircle />,
          badgeClass: "bg-emerald-100 text-emerald-600 border border-emerald-200",
          btnClass:
            "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-emerald-500/20",
        };
      case "info":
      default:
        return {
          icon: <FaUtensils />,
          badgeClass: "bg-blue-100 text-blue-600 border border-blue-200",
          btnClass:
            "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-500/20",
        };
    }
  };

  const currentVariant = getVariantStyles();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 transform transition-all animate-scaleUp">
        {/* Header */}
        <div className="p-5 sm:p-6 flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl shadow-sm ${currentVariant.badgeClass}`}
          >
            {currentVariant.icon}
          </div>

          <div className="flex-1 min-w-0">
            <h3
              id="confirm-modal-title"
              className="text-lg font-bold text-gray-900 leading-snug"
            >
              {title}
            </h3>
            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
            aria-label="Tutup modal"
          >
            <FaTimes />
          </button>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-5 py-4 sm:px-6 flex items-center justify-end gap-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-100 transition disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-md transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${currentVariant.btnClass}`}
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
