import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PaymentHistory from "../components/PaymentHistory";
import AdminNav from "../components/AdminNav";

export default function PaymentHistoryPage() {
  const navigate = useNavigate();
  const { status } = useParams();
  const [selectedStatus, setSelectedStatus] = useState(status || "completed");

  const statusOptions = [
    { label: "Completed", value: "completed" },
    { label: "Pending", value: "pending" },
    { label: "Challenge FDS", value: "challengeByFDS" },
    { label: "Denied", value: "denied" },
    { label: "Expired", value: "expired" },
    { label: "Cancelled", value: "cancelled" },
  ];

  useEffect(() => {
    if (status) {
      setSelectedStatus(status);
    }
  }, [status]);

  const handleStatusChange = (newStatus) => {
    if (newStatus !== selectedStatus) {
      setSelectedStatus(newStatus);
      navigate(`/admin/transaction/${newStatus}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status filter bar */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-200 mb-8">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
            Filter Status Pembayaran
          </p>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleStatusChange(value)}
                className={`px-3.5 py-1.5 rounded-xl transition text-xs sm:text-sm font-semibold ${
                  selectedStatus === value
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <PaymentHistory status={selectedStatus} />
      </div>
    </div>
  );
}
