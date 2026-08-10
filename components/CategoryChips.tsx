'use client';

import React, { useState } from 'react';
import { ExamCategory } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CategoryChipsProps {
  categories: ExamCategory[];
  activeCategory: string;
  onSelectCategory: (categoryName: string) => void;
}

export function CategoryChips({
  categories,
  activeCategory,
  onSelectCategory
}: CategoryChipsProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const allCategories = [
    { id: 'all', name: 'All', slug: 'all', seo_description: '', isActive: true, display_order: 0 },
    ...categories
  ];

  const INITIAL_SHOW_COUNT = 8;
  const visibleCategories = isExpanded ? allCategories : allCategories.slice(0, INITIAL_SHOW_COUNT);
  const remainingCount = Math.max(0, allCategories.length - INITIAL_SHOW_COUNT);

  return (
    <div className="px-2 sm:px-4 py-1 sm:py-2">
      <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
        {visibleCategories.map((cat) => {
          const isActive =
            activeCategory.toLowerCase() === cat.name.toLowerCase() ||
            (activeCategory === 'All' && cat.name === 'All');

          return (
            <button
              key={cat.id || cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all active-press border cursor-pointer ${
                isActive
                  ? 'bg-[#28811f] text-white border-[#28811f] shadow-2xs font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          );
        })}

        {/* See More / See Less Button */}
        {allCategories.length > INITIAL_SHOW_COUNT && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold bg-slate-100 text-[#28811f] border border-slate-300 hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer"
          >
            {isExpanded ? (
              <>
                See Less <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                See More {remainingCount > 0 && `(+${remainingCount})`} <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}


