'use client';

import React from 'react';
import { BookItem } from '@/lib/types';
import { BookOpen, CheckCircle2 } from 'lucide-react';

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
    <div className="px-4 py-3 space-y-2.5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Bestselling Books
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">
            Handcrafted theory, formula handbooks & solved archives
          </p>
        </div>
        <button
          onClick={onViewAllClick}
          className="text-xs font-semibold text-[#1976D2] hover:underline"
        >
          View All
        </button>
      </div>

      {/* Grid of books */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
        {books.map((book) => {
          const isUnlocked = unlockedBookIds.has(book.id);

          return (
            <div
              key={book.id}
              onClick={() => onBookClick(book)}
              className="group bg-white rounded-lg border border-slate-300 p-2 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer"
            >
              <div>
                {/* Book Cover Box */}
                <div className="relative aspect-[3/4] rounded-md bg-slate-100 overflow-hidden mb-2 flex items-center justify-center border border-slate-200">
                  {book.cover ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="p-3 text-center">
                      <span className="text-[10px] sm:text-xs font-medium text-slate-500">Cover</span>
                    </div>
                  )}

                  {isUnlocked && (
                    <div className="absolute top-1 right-1 bg-secondary text-white text-[9px] font-bold px-1 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                      <CheckCircle2 className="w-2 h-2" />
                      Owned
                    </div>
                  )}
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-[11px] sm:text-xs font-semibold text-slate-800 line-clamp-2 leading-tight group-hover:text-[#1976D2] transition-colors min-h-[2rem]">
                  {book.title}
                </h3>
                <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium mb-2 truncate mt-1">
                  {book.subtitle || book.edition || 'Print + E-Book'}
                </p>
              </div>

              {/* Pricing & Add/Read Button */}
              <div className="pt-2 border-t border-slate-200 mt-auto">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-[13px] sm:text-sm font-bold text-[#1a237e]">
                    ₹{book.buy_price}
                  </span>
                  {book.list_price > book.buy_price && (
                    <span className="text-[9px] sm:text-[10px] text-slate-400 line-through">
                      ₹{book.list_price}
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => onAddClick(book, e)}
                  className={`w-full py-1 rounded-[4px] font-semibold text-[10px] sm:text-xs tracking-wide border transition text-center shadow-xs ${
                    isUnlocked
                      ? 'border-secondary bg-secondary-light text-secondary hover:bg-secondary/20'
                      : 'border-[#1a237e] text-[#1a237e] bg-white hover:bg-slate-50'
                  }`}
                >
                  {isUnlocked ? 'READ PDF' : 'ADD'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
