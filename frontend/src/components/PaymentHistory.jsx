import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useTransactionStore } from "../store/transactionStore";
import { useAdminStore } from "../store/adminStore";
import { toast } from "react-toastify";
import Pagination from "./Pagination";
import {
  FiArrowDown,
  FiArrowUp,
  FiClock,
  FiCheckCircle,
  FiLoader,
  FiFrown,
  FiShoppingBag,
  FiUser,
  FiMail,
  FiHash,
  FiCalendar,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi";
import { FaFireAlt, FaUtensils, FaCheckDouble } from "react-icons/fa";

// Audio Synthesizer Chime for incoming order alerts (Web Audio API)
const playOrderChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // First Tone (E5 - 659.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Second Harmonics (C6 - 1046.5Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1046.5, now + 0.12);
    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch (e) {
    console.warn("Audio chime playback error:", e);
  }
};

export default function PaymentHistory({ status }) {
  const {
    fetchAllTransactionByStatus,
    syncTransactionStatus,
    syncAllPendingTransactions,
    transactions = [],
    transactionItems = [],
    productDetails = [],
    isLoading,
    error,
    clearTransactions,
  } = useTransactionStore();

  const { updateTransactionCookingStatus, isLoading: isUpdating } =
    useAdminStore();

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [cookingStatus, setCookingStatus] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [syncingId, setSyncingId] = useState(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "descending",
  });

  const knownTransactionIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);

  const handleSyncStatus = async (transactionId, e) => {
    if (e) e.stopPropagation();
    try {
      setSyncingId(transactionId);
      await syncTransactionStatus(transactionId);
      await fetchAllTransactionByStatus(status, false);
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAllPending = async () => {
    try {
      setIsSyncingAll(true);
      await syncAllPendingTransactions();
      await fetchAllTransactionByStatus(status, false);
    } catch (err) {
      console.error("Sync all error:", err);
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Create a map of product details for easy lookup
  const productsMap = productDetails.reduce((map, product) => {
    map[product._id] = product;
    return map;
  }, {});

  // Fetch transactions with silent background option & diff detection
  const fetchTransactions = useCallback(
    async (isSilent = false) => {
      if (!status) return;
      try {
        const result = await fetchAllTransactionByStatus(status, isSilent);
        if (result && result.data && Array.isArray(result.data.transactions)) {
          const incoming = result.data.transactions;
          const currentKnown = knownTransactionIdsRef.current;

          if (!isInitialLoadRef.current && isSilent) {
            // Find newly arrived transactions
            const newOrders = incoming.filter((t) => !currentKnown.has(t._id));
            if (newOrders.length > 0) {
              playOrderChime();
              newOrders.forEach((newTx) => {
                toast.info(
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                      🔔
                    </div>
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-gray-900">
                        Pesanan Baru Diterima!
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Meja {newTx.table_code || "-"} &bull; {newTx.customer_name}
                      </p>
                    </div>
                  </div>,
                  { autoClose: 6000 }
                );
              });
            }
          }

          // Update known IDs
          knownTransactionIdsRef.current = new Set(incoming.map((t) => t._id));
          if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
          }
        }
      } catch (err) {
        if (!isSilent) {
          toast.error(err.message);
        }
      }
    },
    [status, fetchAllTransactionByStatus]
  );

  // Initial load on status change
  useEffect(() => {
    clearTransactions();
    knownTransactionIdsRef.current = new Set();
    isInitialLoadRef.current = true;
    setCurrentPage(1);
    fetchTransactions(false);
  }, [status, fetchTransactions, clearTransactions]);

  // Real-Time Background Auto-Sync Interval (8 Seconds) + Page Visibility API
  useEffect(() => {
    if (!isAutoSyncEnabled || !status) return;

    const intervalId = setInterval(() => {
      // Pause polling if tab is currently hidden
      if (!document.hidden) {
        fetchTransactions(true);
      }
    }, 8000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchTransactions(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAutoSyncEnabled, status, fetchTransactions]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (typeof amount !== "number" || isNaN(amount)) {
      return "Rp 0";
    }
    return amount.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle cooking status change
  const handleCookingStatusChange = async (transactionId, newStatus) => {
    try {
      setCookingStatus((prev) => ({ ...prev, [transactionId]: newStatus }));
      await updateTransactionCookingStatus(transactionId, newStatus);
      toast.success("Status memasak berhasil diperbarui!");
    } catch (error) {
      toast.error("Gagal memperbarui status memasak!");
      setCookingStatus((prev) => ({
        ...prev,
        [transactionId]: prev[transactionId],
      }));
    }
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }, [transactions, sortConfig]);

  // Filter transactions by search
  const filteredTransactions = useMemo(() => {
    return sortedTransactions.filter((transaction) => {
      const searchLower = searchQuery.toLowerCase();
      const tableCode = transaction.table_code?.toString() || "";

      return (
        transaction._id?.toLowerCase().includes(searchLower) ||
        transaction.customer_name?.toLowerCase().includes(searchLower) ||
        transaction.customer_email?.toLowerCase().includes(searchLower) ||
        tableCode.toLowerCase().includes(searchLower) ||
        transaction.total_amount?.toString().includes(searchLower)
      );
    });
  }, [sortedTransactions, searchQuery]);

  const totalPages = Math.ceil(filteredTransactions.length / PAGE_SIZE) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTransactions.slice(start, start + PAGE_SIZE);
  }, [filteredTransactions, currentPage, PAGE_SIZE]);

  // Get cooking status icon - now used in the select dropdown
  const getCookingStatusIcon = (status) => {
    switch (status) {
      case "Not Started":
        return <FiClock className="text-gray-500 mr-2" />;
      case "Being Cooked":
        return <FaFireAlt className="text-orange-500 mr-2" />;
      case "Ready to Serve":
        return <FaUtensils className="text-blue-500 mr-2" />;
      case "Completed":
        return <FaCheckDouble className="text-green-500 mr-2" />;
      default:
        return <FiLoader className="text-gray-500 mr-2" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
            <FiCheckCircle className="mr-1" /> Completed
          </span>
        );
      case "pending":
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
            <FiLoader className="mr-1 animate-spin" /> Pending
          </span>
        );
      case "failed":
      case "cancelled":
      case "denied":
        return (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
            <FiFrown className="mr-1" /> {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      case "expired":
        return (
          <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
            <FiClock className="mr-1" /> Expired
          </span>
        );
      case "challengeByFDS":
      case "challengebyFDS":
        return (
          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
            <FiAlertTriangle className="mr-1" /> Challenge FDS
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Daftar Transaksi {status ? `(${status.toUpperCase()})` : ""}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Kelola dan pantau status pembayaran serta proses memasak pesanan
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Live Sync Status Toggle Pill */}
          <button
            onClick={() => setIsAutoSyncEnabled(!isAutoSyncEnabled)}
            className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition shadow-sm ${
              isAutoSyncEnabled
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
            }`}
            title={
              isAutoSyncEnabled
                ? "Live Sync Aktif: Data baru otomatis diperbarui tiap 8 detik tanpa reload"
                : "Live Sync Dijeda: Klik untuk mengaktifkan kembali"
            }
          >
            <span className="relative flex h-2.5 w-2.5">
              {isAutoSyncEnabled && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isAutoSyncEnabled ? "bg-emerald-500" : "bg-gray-400"
                }`}
              ></span>
            </span>
            <span>{isAutoSyncEnabled ? "Live Sync (8s)" : "Sync Dijeda"}</span>
          </button>

          {status === "pending" && (
            <button
              onClick={handleSyncAllPending}
              disabled={isSyncingAll || isLoading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition disabled:opacity-50 whitespace-nowrap"
              title="Periksa dan sinkronkan semua transaksi pending dengan Midtrans"
            >
              <FiRefreshCw className={`text-sm ${isSyncingAll ? "animate-spin" : ""}`} />
              <span>{isSyncingAll ? "Menyinkronkan..." : "Sinkronkan Semua Data Pending"}</span>
            </button>
          )}

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari transaksi / pemesan..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-xl" role="alert" aria-live="assertive">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiFrown className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredTransactions.length === 0 && !error && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No transactions found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? "No transactions match your search criteria"
              : `No ${status} transactions found`}
          </p>
        </div>
      )}

      {/* Transactions List */}
      {!isLoading && filteredTransactions.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-gray-50 px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
            <div
              className="col-span-4 md:col-span-2 flex items-center cursor-pointer"
              onClick={() => requestSort("_id")}
            >
              Transaction ID
              {sortConfig.key === "_id" && (
                <span className="ml-1">
                  {sortConfig.direction === "ascending" ? (
                    <FiArrowUp className="inline" />
                  ) : (
                    <FiArrowDown className="inline" />
                  )}
                </span>
              )}
            </div>
            <div className="hidden md:flex md:col-span-3">Customer</div>
            <div
              className="hidden md:flex md:col-span-2 items-center cursor-pointer"
              onClick={() => requestSort("total_amount")}
            >
              Amount
              {sortConfig.key === "total_amount" && (
                <span className="ml-1">
                  {sortConfig.direction === "ascending" ? (
                    <FiArrowUp className="inline" />
                  ) : (
                    <FiArrowDown className="inline" />
                  )}
                </span>
              )}
            </div>
            <div
              className="col-span-4 md:col-span-2 items-center cursor-pointer"
              onClick={() => requestSort("createdAt")}
            >
              Date
              {sortConfig.key === "createdAt" && (
                <span className="ml-1">
                  {sortConfig.direction === "ascending" ? (
                    <FiArrowUp className="inline" />
                  ) : (
                    <FiArrowDown className="inline" />
                  )}
                </span>
              )}
            </div>
            <div className="col-span-4 md:col-span-3">Status</div>
          </div>

          {/* Transactions */}
          <div className="divide-y divide-gray-200">
            {paginatedTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                {/* Mobile View */}
                <div className="md:hidden grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Transaction ID</p>
                    <p className="text-sm font-medium truncate">
                      {transaction._id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-sm font-medium">
                      {formatCurrency(transaction.total_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm font-medium">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <div className="mt-1">
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                  <div className="col-span-2">
                    <p className="text-sm font-medium truncate">
                      {transaction._id}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiUser className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.customer_name}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <FiMail className="mr-1" />
                          {transaction.customer_email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium">
                      {formatCurrency(transaction.total_amount)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 flex items-center">
                      <FiCalendar className="mr-1" />
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(transaction.status)}
                        {transaction.status === "pending" && (
                          <button
                            onClick={(e) => handleSyncStatus(transaction._id, e)}
                            disabled={syncingId === transaction._id}
                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition text-xs flex items-center gap-1 border border-blue-200"
                            title="Periksa dan sinkronkan status dengan Midtrans API"
                          >
                            <FiRefreshCw
                              className={`text-xs ${
                                syncingId === transaction._id ? "animate-spin" : ""
                              }`}
                            />
                            <span className="hidden xl:inline text-[11px] font-semibold">Cek Midtrans</span>
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-semibold whitespace-nowrap px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile View Detail Button */}
                <div className="md:hidden flex justify-end pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedTransaction(transaction)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                  >
                    Lihat Detail Pesanan &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="px-4 sm:px-6 py-2 bg-gray-50 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredTransactions.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* Floating Transaction Details Modal */}
      {selectedTransaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="transaction-detail-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTransaction(null);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-gray-100 transform transition-all animate-scaleUp overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 p-5 sm:p-6 text-white flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-inner">
                  <FiShoppingBag className="text-lg" />
                </div>
                <div>
                  <h3 id="transaction-detail-title" className="text-base sm:text-lg font-bold">
                    Detail Transaksi & Pesanan
                  </h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    ID: {selectedTransaction._id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800 transition"
                aria-label="Tutup detail modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
              {/* Customer & Order Metadata Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-2.5">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Informasi Pelanggan
                  </h4>
                  <div className="flex items-center gap-2">
                    <FiUser className="text-blue-600 text-sm shrink-0" />
                    <span className="text-sm font-bold text-gray-900 truncate">
                      {selectedTransaction.customer_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMail className="text-blue-600 text-sm shrink-0" />
                    <span className="text-xs text-gray-600 truncate">
                      {selectedTransaction.customer_email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">Nomor Meja:</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-xs font-black">
                      Meja {selectedTransaction.table_code}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-2.5">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status & Pembayaran
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Status Bayar:</span>
                    <div>{getStatusBadge(selectedTransaction.status)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Waktu Order:</span>
                    <span className="text-xs font-medium text-gray-800">
                      {formatDate(selectedTransaction.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Order ID:</span>
                    <span className="text-xs font-mono text-gray-700 truncate max-w-[150px]">
                      {selectedTransaction.order_id || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cooking Status Control */}
              <div className="bg-blue-50/60 p-4 sm:p-5 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <FaUtensils className="text-blue-600" />
                    <span>Status Memasak Pesanan (Dapur)</span>
                  </h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Perbarui tahap memasak agar pelanggan dapat memantau secara live
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center bg-white border border-gray-300 rounded-xl px-3 py-2 shadow-sm w-full sm:w-auto">
                    {getCookingStatusIcon(
                      cookingStatus[selectedTransaction._id] ||
                        selectedTransaction.cooking_status ||
                        "Not Started"
                    )}
                    <select
                      className="text-xs sm:text-sm font-bold text-gray-900 bg-transparent focus:outline-none cursor-pointer w-full"
                      value={
                        cookingStatus[selectedTransaction._id] ||
                        selectedTransaction.cooking_status ||
                        "Not Started"
                      }
                      onChange={(e) =>
                        handleCookingStatusChange(
                          selectedTransaction._id,
                          e.target.value
                        )
                      }
                      disabled={
                        selectedTransaction.status !== "completed" ||
                        isUpdating
                      }
                    >
                      <option value="Not Started">Pesanan Diterima (Not Started)</option>
                      <option value="Being Cooked">Sedang Dimasak (Being Cooked)</option>
                      <option value="Ready to Serve">Siap Disajikan (Ready to Serve)</option>
                      <option value="Completed">Pesanan Selesai (Completed)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FiShoppingBag className="text-blue-600" />
                  <span>Daftar Menu yang Dipesan</span>
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 text-left">Menu</th>
                        <th className="px-4 py-3 text-center">Jumlah</th>
                        <th className="px-4 py-3 text-right">Harga Satuan</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactionItems
                        .filter(
                          (item) =>
                            item.transaction_id === selectedTransaction._id
                        )
                        .map((item) => {
                          const product = productsMap[item.product_id];
                          return (
                            <tr key={item._id} className="hover:bg-gray-50/80 transition">
                              <td className="px-4 py-3.5 whitespace-nowrap text-xs sm:text-sm font-bold text-gray-900">
                                {item.product_name || product?.name || "Unknown Product"}
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-xs sm:text-sm text-center font-semibold text-gray-700">
                                {item.qty || 0}x
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-xs sm:text-sm text-right text-gray-600">
                                {formatCurrency(item.unit_price || product?.price || 0)}
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-xs sm:text-sm text-right font-bold text-gray-900">
                                {formatCurrency(
                                  item.amount ||
                                    (item.unit_price || product?.price || 0) * (item.qty || 0)
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                    <tfoot className="bg-gray-50/80 font-bold">
                      <tr>
                        <td colSpan="3" className="px-4 py-3.5 text-right text-sm text-gray-700">
                          Total Pembayaran:
                        </td>
                        <td className="px-4 py-3.5 text-right text-base text-blue-700 font-extrabold">
                          {formatCurrency(selectedTransaction.total_amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-5 py-4 sm:px-6 border-t border-gray-100 flex items-center justify-between gap-3">
              <div>
                {selectedTransaction.status === "pending" && (
                  <button
                    onClick={(e) => handleSyncStatus(selectedTransaction._id, e)}
                    disabled={syncingId === selectedTransaction._id}
                    className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-blue-200 transition"
                  >
                    <FiRefreshCw className={`text-xs ${syncingId === selectedTransaction._id ? "animate-spin" : ""}`} />
                    <span>Cek Status Midtrans</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
