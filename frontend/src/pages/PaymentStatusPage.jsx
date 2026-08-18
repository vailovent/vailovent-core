import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useTransactionStore } from "../store/transactionStore";
import {
  FaClock,
  FaFire,
  FaUtensils,
  FaCheckCircle,
  FaSyncAlt,
  FaCheck,
  FaExclamationCircle,
} from "react-icons/fa";

const COOKING_STAGES = [
  { key: "Not Started", label: "Pesanan Diterima", icon: FaClock },
  { key: "Being Cooked", label: "Sedang Dimasak", icon: FaFire },
  { key: "Ready to Serve", label: "Siap Disajikan", icon: FaUtensils },
  { key: "Completed", label: "Pesanan Selesai", icon: FaCheckCircle },
];

const PaymentStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const raw_transaction_id = queryParams.get("order_id");
  const transaction_id = raw_transaction_id?.includes("-")
    ? raw_transaction_id.split("-").pop()
    : raw_transaction_id;
  const statusParam = queryParams.get("transaction_status") || "unknown";

  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { fetchTransaction } = useTransactionStore();

  const fetchData = useCallback(
    async (isManualRefresh = false) => {
      if (!transaction_id) {
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      if (isManualRefresh) setIsRefreshing(true);

      try {
        const data = await fetchTransaction(transaction_id);
        if (data && data.transaction) {
          setPaymentDetails(data);
        }
      } catch (error) {
        console.error("Error fetching transaction:", error);
      } finally {
        setLoading(false);
        if (isManualRefresh) setIsRefreshing(false);
      }
    },
    [transaction_id, navigate, fetchTransaction]
  );

  useEffect(() => {
    fetchData();

    // Auto poll cooking status every 15 seconds if order is successful
    const interval = setInterval(() => {
      fetchData();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4" />
        <p className="text-gray-600 font-medium">Memuat rincian pembayaran...</p>
      </div>
    );
  }

  if (!paymentDetails || !paymentDetails.transaction) {
    return (
      <div className="p-8 max-w-md mx-auto my-12 bg-white rounded-2xl shadow-md text-center border border-gray-100">
        <div className="text-red-500 text-5xl mb-4 flex justify-center">
          <FaExclamationCircle />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Data Transaksi Tidak Ditemukan
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Tidak dapat memuat informasi pesanan untuk ID ini.
        </p>
        <button
          onClick={() => navigate("/")}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-sm"
        >
          Kembali ke Menu Utama
        </button>
      </div>
    );
  }

  const { transaction, transactionItems } = paymentDetails;
  const isSuccess =
    statusParam === "settlement" ||
    statusParam === "capture" ||
    transaction.status === "completed";
  const itemsArray = Array.isArray(transactionItems) ? transactionItems : [];

  const currentCookingStatus = transaction.cooking_status || "Not Started";
  const currentStageIndex = COOKING_STAGES.findIndex(
    (s) => s.key === currentCookingStatus
  );

  return (
    <div className="py-10 px-4 max-w-3xl mx-auto">
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
        {/* Header Status Card */}
        <div
          className={`p-6 text-center text-white ${
            isSuccess
              ? "bg-gradient-to-r from-green-500 to-emerald-600"
              : "bg-gradient-to-r from-red-500 to-rose-600"
          }`}
        >
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
            {isSuccess ? <FaCheckCircle /> : <FaExclamationCircle />}
          </div>
          <h1 className="text-2xl font-bold mb-1">
            {isSuccess ? "Pembayaran Berhasil!" : "Pembayaran Belum Berhasil"}
          </h1>
          <p className="text-white/90 text-sm">
            {isSuccess
              ? `Terima kasih ${transaction.customer_name || ""}, pesanan Meja #${transaction.table_code} sedang diproses.`
              : "Silakan periksa kembali metode pembayaran Anda atau lakukan pemesanan ulang."}
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Live Cooking Status Tracker (Only if Success) */}
          {isSuccess && (
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-5 md:p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping inline-block" />
                    Status Pesanan Dapur
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Diperbarui otomatis setiap 15 detik
                  </p>
                </div>
                <button
                  onClick={() => fetchData(true)}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition shadow-sm"
                >
                  <FaSyncAlt className={isRefreshing ? "animate-spin text-blue-600" : ""} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Progress Stepper */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-2">
                {COOKING_STAGES.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isCompleted = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div
                      key={stage.key}
                      className={`flex flex-col items-center text-center p-3 rounded-lg border transition-all ${
                        isCurrent
                          ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                          : isCompleted
                          ? "bg-green-50 text-green-800 border-green-200"
                          : "bg-white text-gray-400 border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 text-base ${
                          isCurrent
                            ? "bg-white text-blue-600"
                            : isCompleted
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {isCompleted ? <FaCheck /> : <Icon />}
                      </div>
                      <span className="text-xs font-semibold leading-tight">
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transaction Metadata Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl text-sm border border-gray-100">
            <div>
              <p className="text-gray-500 text-xs">ID Transaksi</p>
              <p className="font-semibold text-gray-800 truncate" title={transaction._id}>
                {transaction._id}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Kode Meja</p>
              <p className="font-semibold text-gray-800">
                Meja #{transaction.table_code || "-"}
              </p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-gray-500 text-xs">Email Pelanggan</p>
              <p className="font-semibold text-gray-800 truncate">
                {transaction.customer_email || "-"}
              </p>
            </div>
          </div>

          {/* Ordered Items Table */}
          <div>
            <h3 className="text-base font-bold text-gray-800 mb-3">
              Rincian Menu Dipesan
            </h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Menu</th>
                    <th className="px-4 py-3 text-center">Jumlah</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {itemsArray.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.product_name}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {item.qty}x
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                        Rp {parseFloat(item.amount || item.unit_price * item.qty || 0).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-bold text-gray-900 border-t border-gray-200">
                  <tr>
                    <td colSpan="2" className="px-4 py-3 text-right">
                      Total Pembayaran:
                    </td>
                    <td className="px-4 py-3 text-right text-blue-600 text-base">
                      Rp {parseFloat(transaction.total_amount || 0).toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => navigate("/")}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition shadow-md active:scale-[0.99]"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;

