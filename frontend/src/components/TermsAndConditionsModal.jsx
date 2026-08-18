import { useEffect, useState } from "react";
import { useTermsAndConditionsStore } from "../store/termsAndConditionsStore";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaChevronUp,
  FaChevronDown,
  FaLock,
  FaExternalLinkAlt,
} from "react-icons/fa";

export default function TermsAndConditionsGate({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [readTimeEstimate, setReadTimeEstimate] = useState("2-3 minutes");
  const { fetchTermsAndConditions, termsAndConditions, isLoading, error } =
    useTermsAndConditionsStore();

  // Check acceptance status on component mount
  useEffect(() => {
    const hasAcceptedTerms = sessionStorage.getItem("hasAcceptedTerms");
    if (hasAcceptedTerms !== "true") {
      fetchTermsAndConditions();
      setIsModalOpen(true);

      // Calculate read time based on content length
      if (termsAndConditions.length > 0) {
        const totalWords = termsAndConditions.reduce(
          (acc, term) => acc + term.text.split(/\s+/).length,
          0
        );
        const minutes = Math.max(1, Math.ceil(totalWords / 200)); // 200 wpm reading speed
        setReadTimeEstimate(`${minutes}-${minutes + 1} minutes`);
      }
    }
  }, [fetchTermsAndConditions, termsAndConditions.length]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 20;
    setHasScrolled(scrolledToBottom);
  };

  const handleAccept = () => {
    sessionStorage.setItem("hasAcceptedTerms", "true");
    setIsModalOpen(false);
    // Optional: Track acceptance in analytics
  };

  const [isDeclined, setIsDeclined] = useState(false);

  const handleDecline = () => {
    setIsDeclined(true);
  };

  const toggleSection = (no) => {
    setExpandedSections((prev) => ({
      ...prev,
      [no]: !prev[no],
    }));
  };

  const expandAllSections = () => {
    const allExpanded = {};
    termsAndConditions.forEach((term) => {
      allExpanded[term.no] = true;
    });
    setExpandedSections(allExpanded);
  };

  const collapseAllSections = () => {
    setExpandedSections({});
  };

  // If terms are declined, show clean restricted access view
  if (isModalOpen && isDeclined) {
    return (
      <div className="fixed inset-0 bg-gray-900/80 z-[9999] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 md:p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            <FaTimesCircle />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Akses Layanan Dibatasi
          </h2>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Untuk menggunakan layanan pemesanan dan menu digital Vailovent, Anda perlu menyetujui Syarat &amp; Ketentuan serta Kebijakan Privasi kami.
          </p>
          <button
            onClick={() => setIsDeclined(false)}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md active:scale-[0.98]"
          >
            Baca Kembali &amp; Setujui
          </button>
        </div>
      </div>
    );
  }

  // If terms aren't accepted, show the modal and block page content
  if (isModalOpen) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-4 md:p-6">
        {/* Main modal container */}
        <div className="w-full max-w-4xl h-full max-h-[90vh] flex flex-col bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header with gradient and lock icon */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-5 md:p-6 text-white">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-3 mb-2">
                <FaLock className="text-xl md:text-2xl" />
                <h1 className="text-xl md:text-2xl font-bold">
                  Terms & Conditions Agreement
                </h1>
              </div>
              <p className="text-blue-100 text-sm md:text-base max-w-2xl">
                To continue using our services, please review and accept our
                updated Terms & Conditions
              </p>
              <div className="mt-3 bg-blue-400/20 px-3 py-1 rounded-full text-xs md:text-sm">
                Estimated read time: {readTimeEstimate}
              </div>
            </div>
          </div>

          {/* Content area with scrollable terms */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Controls bar */}
            <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                {termsAndConditions.length} sections
              </div>
              <div className="flex gap-2">
                <button
                  onClick={expandAllSections}
                  className="text-xs md:text-sm px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAllSections}
                  className="text-xs md:text-sm px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div
              className="flex-1 overflow-y-auto p-4 md:p-6"
              onScroll={handleScroll}
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-600">
                    Loading terms and conditions...
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Please wait while we retrieve the latest terms
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 text-4xl mb-3">⚠️</div>
                  <p className="text-red-600 font-semibold">{error}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Failed to load terms and conditions
                  </p>
                  <button
                    onClick={() => fetchTermsAndConditions()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {termsAndConditions.map((term) => (
                    <div
                      key={term.no}
                      className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200"
                    >
                      <button
                        onClick={() => toggleSection(term.no)}
                        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 text-left font-semibold text-gray-800"
                      >
                        <span>
                          {term.no}. {term.title}
                        </span>
                        {expandedSections[term.no] ? (
                          <FaChevronUp className="text-gray-500" />
                        ) : (
                          <FaChevronDown className="text-gray-500" />
                        )}
                      </button>
                      {expandedSections[term.no] && (
                        <div className="p-4 bg-white border-t border-gray-200 text-gray-600 leading-relaxed">
                          {term.text}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with actions and status */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {hasScrolled ? (
                    <>
                      <FaCheckCircle className="text-green-500 text-base" />
                      <span>You have reviewed all terms</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <span>Please scroll down to review all terms</span>
                    </>
                  )}
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleDecline}
                    className="flex-1 sm:flex-initial px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
                  >
                    Decline
                  </button>
                  <button
                    onClick={handleAccept}
                    disabled={!hasScrolled}
                    className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                      hasScrolled
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-95"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <FaCheckCircle />
                    <span>Accept Terms</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-gray-500 text-xs md:text-sm">
                  By accepting, you agree to our{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Terms & Conditions{" "}
                    <FaExternalLinkAlt className="inline text-xs" />
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Privacy Policy{" "}
                    <FaExternalLinkAlt className="inline text-xs" />
                  </a>
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Pembaruan Terakhir: 2025
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only render children if terms are accepted
  return children;
}
