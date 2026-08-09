'use client';

import React from 'react';
import { BookItem } from '@/lib/types';
import { CheckCircle2, Heart, Star, Plus, BookOpen } from 'lucide-react';

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
    <div className="px-2 sm:px-4 py-3 space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-950 tracking-tight flex items-center gap-1.5">
            <span>Bestselling Books</span>
            <span className="text-[10px] font-black bg-emerald-100 text-emerald-950 border border-emerald-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Top Rated
            </span>
          </h2>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">
            Handcrafted theory, formula handbooks & solved archives
          </p>
        </div>
        <button
          onClick={onViewAllClick}
          className="text-xs sm:text-sm font-extrabold text-[#1976D2] hover:underline px-2 py-1 bg-blue-50/80 rounded-lg border border-blue-200"
        >
          View All
        </button>
      </div>

      {/* Grid of books */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
        {books.map((book) => {
          const isUnlocked = unlockedBookIds.has(book.id);
          const discountPercent = book.list_price > book.buy_price
            ? Math.round(((book.list_price - book.buy_price) / book.list_price) * 100)
            : 0;

          return (
            <div
              key={book.id}
              onClick={() => onBookClick(book)}
              className="group bg-white rounded-2xl border border-slate-300/90 hover:border-[#1976D2] p-2.5 sm:p-3 flex flex-col justify-between shadow-xs hover:shadow-md transition-all cursor-pointer relative"
            >
              <div>
                {/* Book Cover Container */}
                <div className="relative aspect-4/5 rounded-xl bg-slate-100/80 border border-slate-200/80 flex items-center justify-center p-2 mb-2.5 overflow-hidden group-hover:bg-slate-100 transition-colors">
                  {book.cover ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1976D2] to-[#0D47A1] text-white p-2.5 rounded-lg flex flex-col justify-between shadow-xs">
                      <span className="text-[9px] font-extrabold uppercase text-amber-300 block truncate tracking-wider">
                        {book.category}
                      </span>
                      <div className="text-xs font-black text-white leading-snug line-clamp-3">
                        {book.title}
                      </div>
                      <span className="text-[9px] text-blue-100 font-bold block truncate border-t border-white/20 pt-1">
                        ExamKart Edition
                      </span>
                    </div>
                  )}

                  {/* Wishlist Heart Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 shadow-md text-slate-500 hover:text-rose-600 transition-colors border border-slate-200"
                  >
                    <Heart className="w-3.5 h-3.5" />
                  </button>

                  {/* Owned Tag */}
                  {isUnlocked && (
                    <div className="absolute top-2 left-2 bg-emerald-700 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1 uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" />
                      Owned
                    </div>
                  )}
                </div>

                {/* Specs Badge Pill (like 'No Added Sugar' / '75 ml' in Blinkit image) */}
                <div className="mb-1.5 flex items-center gap-1.5 flex-wrap">
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100/90 text-amber-950 border border-amber-300/80 tracking-tight">
                    {book.format === 'html' ? 'Interactive EPUB' : 'Full Theory & PYQ'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-950 line-clamp-2 leading-tight group-hover:text-[#1976D2] transition-colors mb-1.5">
                  {book.title}
                </h3>

                {/* Publisher Subtitle */}
                <p className="text-[11px] text-slate-700 font-bold mb-2">
                  ExamKart Official
                </p>
              </div>

              {/* Bottom Section: Pricing, Rating & ADD Button */}
              <div className="mt-2 pt-2 border-t border-slate-200">
                {/* Rating Row */}
                <div className="flex items-center justify-between mb-1.5 text-[11px]">
                  <div className="flex items-center gap-1 font-extrabold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded-md">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>4.8</span>
                    <span className="text-slate-500 font-semibold text-[10px]">(1.2k)</span>
                  </div>
                </div>

                {/* Price Row & ADD Button */}
                <div className="flex items-end justify-between gap-1">
                  <div>
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span className="text-sm sm:text-base font-black text-slate-950">
                        ₹{book.buy_price}
                      </span>
                      {book.list_price > book.buy_price && (
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 line-through">
                          ₹{book.list_price}
                        </span>
                      )}
                    </div>
                    {discountPercent > 0 && (
                      <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200 block mt-0.5">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* High-Contrast ADD Pill Button */}
                  <button
                    onClick={(e) => onAddClick(book, e)}
                    className={`px-3 py-1.5 rounded-lg font-black text-xs sm:text-sm tracking-wide transition uppercase shadow-xs flex items-center gap-1 border-2 ${
                      isUnlocked
                        ? 'bg-[#1976D2] hover:bg-[#1565C0] text-white border-[#1976D2]'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-600'
                    }`}
                  >
                    {isUnlocked ? (
                      <>
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>READ</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>ADD</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

