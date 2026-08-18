import { useEffect, useState } from "react";
import { useTermsAndConditionsStore } from "../store/termsAndConditionsStore";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function TermsPage() {
  const { fetchTermsAndConditions, termsAndConditions, isLoading, error } =
    useTermsAndConditionsStore();
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    fetchTermsAndConditions();
  }, [fetchTermsAndConditions]);

  const toggleSection = (no) => {
    setExpandedSections((prev) => ({ ...prev, [no]: !prev[no] }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Syarat &amp; Ketentuan
        </h1>
        <p className="text-gray-500 text-sm">
          Harap baca syarat dan ketentuan berikut sebelum menggunakan layanan kami.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 font-medium">Gagal memuat syarat &amp; ketentuan.</p>
          <button
            onClick={() => fetchTermsAndConditions()}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {!isLoading && !error && termsAndConditions.length === 0 && (
        <p className="text-center text-gray-500">
          Tidak ada syarat &amp; ketentuan yang tersedia saat ini.
        </p>
      )}

      {!isLoading && !error && termsAndConditions.length > 0 && (
        <div className="space-y-4">
          {termsAndConditions.map((term) => (
            <div
              key={term.no}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleSection(term.no)}
                className="flex items-center justify-between w-full text-left px-5 py-4 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {term.no}
                  </span>
                  <span className="font-semibold text-gray-800">{term.title}</span>
                </div>
                {expandedSections[term.no] ? (
                  <FaChevronUp className="text-gray-400 flex-shrink-0" />
                ) : (
                  <FaChevronDown className="text-gray-400 flex-shrink-0" />
                )}
              </button>

              {expandedSections[term.no] && (
                <div className="px-5 pb-5 pt-2 bg-white border-t border-gray-100">
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                    {term.text}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-10 text-xs text-gray-400 text-center">
        Dengan menggunakan layanan Vailovent, Anda menyatakan telah membaca dan
        menyetujui seluruh syarat &amp; ketentuan di atas.
      </p>
    </div>
  );
}
