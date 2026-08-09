'use client';

import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory: string;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  activeCategory
}: SearchBarProps) {
  return (
    <div className="px-2 sm:px-4 pt-3 pb-1">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-slate-800 stroke-[2.5] pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Search ${activeCategory !== 'All' ? activeCategory : ''} exams, test series, books...`}
          className="w-full pl-10 pr-10 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-xs sm:text-sm text-slate-950 placeholder:text-slate-500 placeholder:font-semibold focus:outline-none focus:ring-2 focus:ring-[#1976D2]/20 focus:border-[#1976D2] transition-all font-bold shadow-xs"
        />
        {searchQuery ? (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 p-1 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        ) : (
          <SlidersHorizontal className="absolute right-3.5 w-4 h-4 text-slate-700 stroke-[2.2] pointer-events-none" />
        )}
      </div>
    </div>
  );
}

