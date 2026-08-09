'use client';

import React from 'react';
import { ExamItem } from '@/lib/types';
import { Video, FileText, CheckCircle2, Zap } from 'lucide-react';

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
      <div className="px-4 py-6 text-center text-slate-700 font-bold text-sm bg-white rounded-2xl border border-slate-200 my-2">
        No exams found for this category.
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 py-3 space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-950 tracking-tight flex items-center gap-1.5">
            <span>Trending Exam Batches</span>
            <span className="text-[10px] font-black bg-amber-100 text-amber-950 border border-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
              <Zap className="w-3 h-3 fill-amber-950" /> Live Series
            </span>
          </h2>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">
            Official test series, previous papers & video lectures
          </p>
        </div>
        <button
          onClick={onViewAllClick}
          className="text-xs sm:text-sm font-extrabold text-[#1976D2] hover:underline px-2 py-1 bg-blue-50/80 rounded-lg border border-blue-200"
        >
          View All
        </button>
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
        {exams.map((exam) => {
          const isUnlocked = unlockedExamIds.has(exam.id);
          const discountPercent = exam.list_price > exam.buy_price
            ? Math.round(((exam.list_price - exam.buy_price) / exam.list_price) * 100)
            : 0;

          return (
            <div
              key={exam.id}
              onClick={() => onExamClick(exam)}
              className="group bg-white rounded-2xl border border-slate-300/90 hover:border-[#1976D2] p-2.5 sm:p-3 flex flex-col justify-between shadow-xs hover:shadow-md transition-all cursor-pointer relative"
            >
              <div>
                {/* Category & Status Badges Row */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black bg-sky-100 text-sky-950 border border-sky-300/80 uppercase tracking-wider">
                    {exam.category}
                  </span>
                  {isUnlocked && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-emerald-950 bg-emerald-100 px-1.5 py-0.5 rounded-md border border-emerald-300 uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      Unlocked
                    </span>
                  )}
                </div>

                {/* Exam Title */}
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-950 line-clamp-2 leading-tight group-hover:text-[#1976D2] transition-colors mb-2 min-h-[2.25rem]">
                  {exam.title}
                </h3>

                {/* Specs / Meta Badges (Classes & Mocks count) */}
                <div className="bg-slate-50/90 p-2 rounded-xl border border-slate-200/80 space-y-1 mb-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-800">
                    <Video className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{exam.classes_count || 150}+ Video Classes</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-800">
                    <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{exam.mocks_count || 50}+ Full Mocks</span>
                  </div>
                </div>
              </div>

              {/* Bottom Section: Pricing & CTA Button */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-sm sm:text-base font-black text-slate-950">
                      ₹{exam.buy_price}
                    </span>
                    {exam.list_price > exam.buy_price && (
                      <span className="text-[10px] sm:text-xs font-bold text-slate-400 line-through">
                        ₹{exam.list_price}
                      </span>
                    )}
                  </div>
                  {discountPercent > 0 && (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => onBuyClick(exam, e)}
                  className={`w-full py-1.5 rounded-lg font-black text-xs sm:text-sm tracking-wider uppercase transition text-center shadow-xs ${
                    isUnlocked
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 border border-amber-600 active:scale-95'
                  }`}
                >
                  {isUnlocked ? 'ACCESS' : 'BUY'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

