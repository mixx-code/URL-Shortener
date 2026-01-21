'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  pagination: {
    currentPage: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { currentPage, perPage, total, totalPages, hasNext, hasPrev } = pagination;

  return (
    <div className="px-4 py-3 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="text-sm text-gray-700 text-center sm:text-left">
          <p>
            Showing {((currentPage - 1) * perPage) + 1} to{' '}
            {Math.min(currentPage * perPage, total || 0)} of{' '}
            {total || 0} results
          </p>
        </div>
        <div className="flex items-center justify-center space-x-1 sm:space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrev}
            className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-black"
            title={!hasPrev ? "You're on first page" : "Go to previous page"}
          >
            <span className="hidden sm:inline">Previous</span>
            <ChevronLeft className="w-4 h-4 sm:hidden text-black" />
          </button>
          
          <div className="flex items-center space-x-1 text-black">
            {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded-md ${
                  pageNum === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                title={`Go to page ${pageNum}`}
              >
                {pageNum}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext}
            className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-black"
            title={!hasNext ? "You're on last page" : "Go to next page"}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4 sm:hidden text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}
