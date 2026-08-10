'use client';

import React from 'react';
import { ExamItem } from '@/lib/types';
import { CheckCircle2 } from 'lucide-react';

interface ExamsGridProps {
  exams: ExamItem[];
  unlockedExamIds: Set<string>;
  onExamClick: (exam: ExamItem) => void;
  onBuyClick: (exam: ExamItem, e: React.MouseEvent) => void;
  onViewAllClick?: () => void;
}

export function ExamsGrid({
  exams,
  unlockedExamIds,
  onExamClick,
  onBuyClick,
  onViewAllClick
}: ExamsGridProps) {
  if (!exams || exams.length === 0) {
    return (
      <div className="px-4 py-4 text-center text-slate-500 text-sm">
        No exams found for this category.
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 py-1.5 sm:py-3 space-y-2 sm:space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight">
            Trending Exams
          </h2>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
            Official test series, previous papers & video lectures
          </p>
        </div>
        <button
          onClick={onViewAllClick}
          className="text-xs font-semibold text-[#28811f] hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Grid layout - Exactly 2 items per row with tight gaps on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
        {exams.map((exam) => {
          const isUnlocked = unlockedExamIds.has(exam.id);

          // Get first letter for avatar circle badge
          const firstChar = exam.title
            ? exam.title.trim().charAt(0).toUpperCase()
            : (exam.category ? exam.category.trim().charAt(0).toUpperCase() : 'E');

          // Calculate discount pricing
          const listPrice = exam.list_price || 300;
          const buyPrice = exam.buy_price || 240;
          const discountPercent = listPrice > buyPrice
            ? Math.round(((listPrice - buyPrice) / listPrice) * 100)
            : 20;

          return (
            <div
              key={exam.id}
              onClick={() => onExamClick(exam)}
              className="group bg-white rounded-xl sm:rounded-2xl border border-slate-300 p-2 sm:p-3.5 flex flex-col justify-between hover:border-[#28811f] hover:shadow-md transition-all cursor-pointer relative"
            >
              <div>
                {/* Top Row: Green Avatar Badge + Category & Title */}
                <div className="flex items-start gap-2.5 mb-1.5">
                  {/* Avatar Circle Badge */}
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#28811f] text-white font-extrabold text-base sm:text-lg flex items-center justify-center shrink-0 shadow-xs uppercase select-none">
                    {firstChar}
                  </div>

                  {/* Category & Title */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-[13px] font-bold text-[#28811f] leading-tight truncate">
                      {exam.category}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight line-clamp-2 mt-0.5 group-hover:text-[#28811f] transition-colors">
                      {exam.title}
                    </h3>
                  </div>
                </div>

                {/* Subtitle tag line as shown in reference image */}
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-normal leading-snug my-1.5 line-clamp-2">
                  Papers . Practice Tests . Chapterwise . Topics
                </p>
              </div>

              {/* Bottom Row: Price, Struck-through Price, Discount % Tag */}
              <div className="mt-auto pt-1">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-base sm:text-xl font-black text-slate-950 tracking-tight">
                    ₹{buyPrice}
                  </span>
                  {listPrice > buyPrice && (
                    <span className="text-xs text-slate-400 line-through font-normal">
                      {listPrice}
                    </span>
                  )}
                  <span className="text-xs sm:text-sm font-bold text-[#28811f]">
                    {discountPercent}% off
                  </span>

                  {isUnlocked && (
                    <span className="ml-auto inline-flex items-center gap-0.5 text-[9px] font-bold text-[#28811f] bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Unlocked
                    </span>
                  )}
                </div>

                {/* Underline accent shelf bar matching reference image */}
                <div className="w-2/3 h-1 bg-slate-900 rounded-full mx-auto mt-2 opacity-90" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

