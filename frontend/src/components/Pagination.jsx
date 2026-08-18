import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate visible page numbers (max 5 buttons)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 border-t border-gray-200 mt-6">
      {/* Information text */}
      <p className="text-xs sm:text-sm text-gray-500 font-medium text-center sm:text-left">
        Menampilkan <span className="font-bold text-gray-800">{startItem}</span> -{" "}
        <span className="font-bold text-gray-800">{endItem}</span> dari{" "}
        <span className="font-bold text-gray-800">{totalItems}</span> total
      </p>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 shadow-sm"
          aria-label="Halaman sebelumnya"
        >
          <FaChevronLeft className="text-xs" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        {/* Number Buttons */}
        <div className="flex items-center gap-1">
          {pages[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs sm:text-sm font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
              >
                1
              </button>
              {pages[0] > 2 && (
                <span className="px-1 text-gray-400 font-bold text-xs">...</span>
              )}
            </>
          )}

          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm ${
                currentPage === p
                  ? "bg-blue-600 text-white shadow-blue-500/20 border border-blue-600"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {p}
            </button>
          ))}

          {pages[pages.length - 1] < totalPages && (
            <>
              {pages[pages.length - 1] < totalPages - 1 && (
                <span className="px-1 text-gray-400 font-bold text-xs">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs sm:text-sm font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 shadow-sm"
          aria-label="Halaman selanjutnya"
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <FaChevronRight className="text-xs" />
        </button>
      </div>
    </div>
  );
}
