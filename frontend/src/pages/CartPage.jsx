import { useState, useEffect } from "react";
import { FaTrash, FaPlus, FaMinus, FaArrowLeft } from "react-icons/fa";
import { useTransactionStore } from "../store/transactionStore";
import { useCartStore } from "../store/cartStore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [tableCode, setTableCode] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();
  const { cart, setCart, removeItemFromCart } = useCartStore();

  const { setTransactionDetails, createTransaction, error, isLoading } =
    useTransactionStore();

  useEffect(() => {
    const storedCustomer = JSON.parse(sessionStorage.getItem("customer"));
    if (storedCustomer) {
      setCustomerName(storedCustomer.name);
      setCustomerEmail(storedCustomer.email);
      setTableCode(storedCustomer.tableCode);
    } else {
      setCustomerName("");
      setCustomerEmail("");
      setTableCode("");
    }
  }, []);

  const handleIncrement = (index) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity += 1;
    setCart(updatedCart);
  };

  const handleDecrement = (index) => {
    const updatedCart = [...cart];
    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity -= 1;
    } else {
      updatedCart.splice(index, 1);
    }
    setCart(updatedCart);
  };

  const handleRemoveItem = (index) => {
    removeItemFromCart(cart[index]._id);
    toast.success("Item removed from cart");
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });
  };

  const handleOpenConfirmation = () => {
    if (!customerName.trim() || !customerEmail.trim() || !tableCode.trim()) {
      toast.error("Mohon lengkapi semua data pelanggan & nomor meja sebelum checkout!");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleExecuteCheckout = async () => {
    setShowConfirmModal(false);

    const transactionData = {
      table_code: tableCode,
      customer_name: customerName,
      customer_email: customerEmail,
      products: cart.map((item) => ({
        product_id: item._id,
        qty: item.quantity,
      })),
    };

    setTransactionDetails(transactionData);

    try {
      const response = await createTransaction();
      if (!response || !response.redirect_url) {
        toast.error("Transaksi gagal dibuat. Silakan coba lagi.");
        return;
      }

      toast.success("Transaksi berhasil dibuat! Mengalihkan ke pembayaran...");
      setCart([]);
      sessionStorage.removeItem("cart");

      // Direct redirection to avoid mobile pop-up blockers
      window.location.href = response.redirect_url;
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Gagal membuat transaksi!");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <FaArrowLeft className="mr-2" />
          Back to Menu
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Your Order Summary
        </h1>
      </div>

      {cart.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-500 mb-6">
              Looks like you haven't added any items yet
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Menu
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div
                key={`${item._id}-${index}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-1/3 h-48 sm:h-auto">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 sm:p-6 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {formatCurrency(item.price)} each
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleDecrement(index)}
                          className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <FaMinus size={14} />
                        </button>
                        <span className="px-4 py-1 text-lg font-medium w-12 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrement(index)}
                          className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <FaPlus size={14} />
                        </button>
                      </div>
                      <p className="text-lg font-semibold text-gray-800">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Details & Checkout */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Customer Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      !customerName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      !customerEmail ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Table Number
                  </label>
                  <input
                    type="text"
                    value={tableCode}
                    onChange={(e) => setTableCode(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      !tableCode ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Table number"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Order Summary
              </h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={`summary-${item._id}`}
                    className="flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">{item.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500 text-sm w-8 text-right">
                        x{item.quantity}
                      </span>
                      <span className="text-gray-800 font-medium w-24 text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
              <button
                onClick={handleOpenConfirmation}
                disabled={isLoading}
                className={`w-full mt-6 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-md transition-all active:scale-[0.99] ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Memproses Pesanan...
                  </div>
                ) : (
                  "Lanjut ke Pembayaran"
                )}
              </button>
              {error && (
                <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Final Order Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Konfirmasi Pesanan
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Pastikan rincian nomor meja dan pesanan Anda sudah sesuai sebelum melanjutkan pembayaran.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-6 border border-gray-200 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Nomor Meja:</span>
                <span className="font-bold text-gray-900">Meja #{tableCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nama Pelanggan:</span>
                <span className="font-semibold text-gray-900">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-semibold text-gray-900 truncate max-w-[200px]" title={customerEmail}>
                  {customerEmail}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-base">
                <span className="text-gray-900">Total Tagihan:</span>
                <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteCheckout}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-md transition"
              >
                {isLoading ? "Memproses..." : "Bayar Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
