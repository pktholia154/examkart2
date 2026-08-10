'use client';

import React from 'react';
import { BookItem } from '@/lib/types';
import { CheckCircle2 } from 'lucide-react';
import { BookCover } from '@/components/BookCover';

interface BooksGridProps {
  books: BookItem[];
  unlockedBookIds: Set<string>;
  onBookClick: (book: BookItem) => void;
  onAddClick: (book: BookItem, e: React.MouseEvent) => void;
  onViewAllClick?: () => void;
}

export function BooksGrid({
  books,
  unlockedBookIds,
  onBookClick,
  onAddClick,
  onViewAllClick
}: BooksGridProps) {
  if (!books || books.length === 0) {
    return null;
  }

  return (
    <div className="px-2 sm:px-4 py-1.5 sm:py-3 space-y-2 sm:space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight">
            Bestselling Books
          </h2>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
            Handcrafted theory, formula handbooks & solved archives
          </p>
        </div>
        <button
          onClick={onViewAllClick}
          className="text-xs font-semibold text-[#28811f] hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Grid of books - Exactly 2 items per row on mobile/small viewports */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
        {books.map((book) => {
          const isUnlocked = unlockedBookIds.has(book.id);

          const listPrice = book.list_price || 300;
          const buyPrice = book.buy_price || 240;
          const discountPercent = listPrice > buyPrice
            ? Math.round(((listPrice - buyPrice) / listPrice) * 100)
            : 20;

          return (
            <div
              key={book.id}
              onClick={() => onBookClick(book)}
              className="group bg-white rounded-xl sm:rounded-2xl border border-slate-300 p-2 sm:p-3.5 flex flex-col justify-between hover:border-[#28811f] hover:shadow-md transition-all cursor-pointer relative"
            >
              <div>
                {/* Top Row: Cover Thumbnail (Left) + Category, Price, Format Badges (Right) */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {/* Dynamic Procedural Book Cover Engine */}
                  <BookCover
                    title={book.title}
                    category={book.category}
                    code={(book as any).code || (book as any).abbrev}
                    className="w-12 sm:w-14"
                  />

                  {/* Metadata Stack: Category, Price, Format Badges */}
                  <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
                    <div className="text-xs sm:text-[13px] font-bold text-[#28811f] leading-tight truncate">
                      {book.category || 'Banking'}
                    </div>

                    {/* Price & Discount */}
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-base sm:text-lg font-black text-slate-950 tracking-tight leading-none">
                        ₹{buyPrice}
                      </span>
                      {listPrice > buyPrice && (
                        <span className="text-[11px] sm:text-xs text-slate-400 line-through font-normal leading-none">
                          {listPrice}
                        </span>
                      )}
                      <span className="text-[11px] sm:text-xs font-bold text-[#28811f] leading-none">
                        {discountPercent}% off
                      </span>
                    </div>

                    {/* Format Badges (PDF & EPUB with blue checkmarks) */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-slate-700">
                        <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#2563eb] text-white flex items-center justify-center shrink-0">
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        pdf
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-slate-700">
                        <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#2563eb] text-white flex items-center justify-center shrink-0">
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        epub
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Full Width Title & SEO Description */}
                <div className="mt-2.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight line-clamp-2 group-hover:text-[#28811f] transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-normal leading-snug mt-1 line-clamp-1">
                    {book.seo_description || book.subtitle || 'Seo description here in just 1 row'}
                  </p>
                </div>
              </div>

              {/* Bottom Row: Unlocked badge if applicable & Underline shelf accent */}
              <div className="mt-auto pt-1">
                {isUnlocked && (
                  <div className="mb-1 flex justify-end">
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#28811f] bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Unlocked
                    </span>
                  </div>
                )}

                {/* Underline accent shelf bar matching reference image */}
                <div className="w-2/3 h-1 bg-slate-900 rounded-full mx-auto mt-1.5 opacity-90" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


