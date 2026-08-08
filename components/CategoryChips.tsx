'use client';

import React from 'react';
import { ExamCategory } from '@/lib/types';

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
  // Always include "SSC" first as shown in image or "All"
  const allCategories = [
    { id: 'all', name: 'All', slug: 'all', seo_description: '', isActive: true, display_order: 0 },
    ...categories
  ];

  return (
    <div className="px-4 py-2">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {allCategories.map((cat) => {
          const isActive = activeCategory.toLowerCase() === cat.name.toLowerCase() || (activeCategory === 'All' && cat.name === 'All');
          return (
            <button
              key={cat.id || cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all active-press border ${
                isActive
                  ? 'bg-[#1976D2] text-white border-[#1976D2] shadow-sm font-semibold'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
