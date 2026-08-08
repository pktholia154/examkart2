'use client';

import React from 'react';
import { BookItem } from '@/lib/types';
import { CheckCircle2, Heart, Star, Plus } from 'lucide-react';

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
    <div className="px-2 sm:px-4 py-3 space-y-2.5">
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
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4 md:gap-6">
        {books.map((book) => {
          const isUnlocked = unlockedBookIds.has(book.id);

          return (
            <div
              key={book.id}
              onClick={() => onBookClick(book)}
              className="group flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Book Cover Box */}
                <div className="relative aspect-square rounded-2xl bg-[#FAFAFA] flex items-center justify-center p-4 sm:p-6 mb-3">
                  {book.cover ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                      style={{ aspectRatio: '2/3' }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="p-3 text-center border border-slate-200 bg-white w-full h-full flex items-center justify-center rounded-sm" style={{ aspectRatio: '2/3' }}>
                      <span className="text-[10px] sm:text-xs font-medium text-slate-400">Cover</span>
                    </div>
                  )}
                  
                  <button className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-sm text-slate-400 hover:text-rose-500 transition-colors">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>

                  {isUnlocked && (
                    <div className="absolute top-2 left-2 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Owned
                    </div>
                  )}
                </div>

                {/* Pricing Info */}
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <span className="text-[13px] sm:text-sm font-extrabold text-black">
                    ${book.buy_price}
                  </span>
                  {book.list_price > book.buy_price && (
                    <>
                      <span className="text-[10px] sm:text-xs font-medium text-slate-400 line-through">
                        ${book.list_price}
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold text-teal-600">
                        ({Math.round(((book.list_price - book.buy_price) / book.list_price) * 100)}%)
                      </span>
                    </>
                  )}
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-xs sm:text-sm font-semibold text-black line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors mb-1">
                  {book.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium line-clamp-1">
                  Examkart
                </p>
              </div>

              {/* Rating & Add/Read Button */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-0.5 text-[11px] font-medium text-slate-600">
                  0 <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                </div>
                
                <button
                  onClick={(e) => onAddClick(book, e)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition shadow-sm ${
                    isUnlocked
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-[#339900] text-white hover:bg-[#287a00]'
                  }`}
                >
                  {isUnlocked ? (
                     <CheckCircle2 className="w-4 h-4" />
                  ) : (
                     <Plus className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
