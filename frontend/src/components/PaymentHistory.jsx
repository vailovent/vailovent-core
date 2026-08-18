import { useEffect, useState, useCallback } from "react";
import { useTransactionStore } from "../store/transactionStore";
import { useAdminStore } from "../store/adminStore";
import { toast } from "react-toastify";
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
} from "react-icons/fi";
import { FaFireAlt, FaUtensils, FaCheckDouble } from "react-icons/fa";

export default function PaymentHistory({ status }) {
  const {
    fetchAllTransactionByStatus,
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
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "descending",
  });

  // Create a map of product details for easy lookup
  const productsMap = productDetails.reduce((map, product) => {
    map[product._id] = product;
    return map;
  }, {});

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    if (!status) return;
    try {
      await fetchAllTransactionByStatus(status);
    } catch (err) {
      toast.error(err.message);
    }
  }, [status, fetchAllTransactionByStatus]);

  useEffect(() => {
    clearTransactions();
    fetchTransactions();
  }, [status, fetchTransactions, clearTransactions]);

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
      toast.success("Status updated successfully!");
    } catch (error) {
      toast.error("Failed to update status!");
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
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  // Filter transactions by search
  const filteredTransactions = sortedTransactions.filter((transaction) => {
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
        return (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
            <FiFrown className="mr-1" /> Failed
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Transaction Management
        </h1>
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
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
            {filteredTransactions.map((transaction) => (
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
                    <div className="flex justify-between items-center">
                      {getStatusBadge(transaction.status)}
                      <button
                        onClick={() =>
                          setSelectedTransaction(
                            selectedTransaction === transaction._id
                              ? null
                              : transaction._id
                          )
                        }
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {selectedTransaction === transaction._id
                          ? "Hide Details"
                          : "View Details"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedTransaction === transaction._id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {/* Customer Info */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">
                          Customer Information
                        </h3>
                        <div className="space-y-2">
                          <p className="flex items-center text-sm text-gray-600">
                            <FiUser className="mr-2" />
                            <span className="font-medium">Name:</span>{" "}
                            {transaction.customer_name}
                          </p>
                          <p className="flex items-center text-sm text-gray-600">
                            <FiMail className="mr-2" />
                            <span className="font-medium">Email:</span>{" "}
                            {transaction.customer_email}
                          </p>
                          <p className="flex items-center text-sm text-gray-600">
                            <FiHash className="mr-2" />
                            <span className="font-medium">
                              Table Code:
                            </span>{" "}
                            {transaction.table_code || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Order Status */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">
                          Order Status
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Cooking Status
                            </label>
                            <div className="flex items-center">
                              {getCookingStatusIcon(
                                cookingStatus[transaction._id] ||
                                  transaction.cooking_status
                              )}
                              <select
                                value={
                                  cookingStatus[transaction._id] ||
                                  transaction.cooking_status
                                }
                                onChange={(e) =>
                                  handleCookingStatusChange(
                                    transaction._id,
                                    e.target.value
                                  )
                                }
                                className="flex-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                                disabled={
                                  transaction.status !== "completed" ||
                                  isUpdating
                                }
                              >
                                <option value="Not Started">Not Started</option>
                                <option value="Being Cooked">
                                  Being Cooked
                                </option>
                                <option value="Ready to Serve">
                                  Ready to Serve
                                </option>
                                <option value="Completed">Completed</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Payment:</span>{" "}
                              {getStatusBadge(transaction.status)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="md:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">
                          Order Items
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Item
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Quantity
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Price
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Subtotal
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {transactionItems
                                .filter(
                                  (item) =>
                                    item.transaction_id === transaction._id
                                )
                                .map((item) => {
                                  const product = productsMap[item.product_id];
                                  return (
                                    <tr key={item._id}>
                                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {item.product_name || product?.name || "Unknown Product"}
                                      </td>
                                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.qty || 0}
                                      </td>
                                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatCurrency(item.unit_price || product?.price || 0)}
                                      </td>
                                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatCurrency(
                                          item.amount ||
                                            (item.unit_price || product?.price || 0) * (item.qty || 0)
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td
                                  colSpan="3"
                                  className="px-4 sm:px-6 py-4 text-right text-sm font-medium text-gray-500"
                                >
                                  Total:
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                  {formatCurrency(transaction.total_amount)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
