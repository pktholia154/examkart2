'use client';

import React from 'react';
import { ExamItem } from '@/lib/types';
import { Video, FileText, CheckCircle2 } from 'lucide-react';

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
    <div className="px-4 py-3 space-y-2.5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Trending Exams
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">
            Official test series, previous papers & video lectures
          </p>
        </div>
        <button
          onClick={onViewAllClick}
          className="text-xs font-semibold text-[#1976D2] hover:underline"
        >
          View All
        </button>
      </div>

      {/* Responsive Grid layout */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
        {exams.map((exam) => {
          const isUnlocked = unlockedExamIds.has(exam.id);

          return (
            <div
              key={exam.id}
              onClick={() => onExamClick(exam)}
              className="group bg-white rounded-lg border border-slate-300 p-2 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer relative"
            >
              <div>
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium bg-blue-50 text-[#1976D2] tracking-wide">
                    {exam.category}
                  </span>
                  {isUnlocked && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-secondary bg-secondary-light px-1 py-0.5 rounded">
                      <CheckCircle2 className="w-2 h-2" />
                      Unlocked
                    </span>
                  )}
                </div>

                {/* Exam Title */}
                <h3 className="text-[11px] sm:text-xs font-semibold text-slate-800 line-clamp-2 leading-tight group-hover:text-[#1976D2] transition-colors mb-2 min-h-[2rem]">
                  {exam.title}
                </h3>

                {/* Metadata stats */}
                <div className="space-y-0.5 text-[10px] text-slate-500 mb-2">
                  <div className="flex items-center gap-1">
                    <Video className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{exam.classes_count || 150}+ Classes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{exam.mocks_count || 50}+ Mocks</span>
                  </div>
                </div>
              </div>

              {/* Pricing & CTA Button */}
              <div className="mt-auto border-t border-slate-200 pt-2">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-[13px] sm:text-sm font-bold text-[#1976D2]">
                    ₹{exam.buy_price}
                  </span>
                  {exam.list_price > exam.buy_price && (
                    <span className="text-[9px] sm:text-[10px] text-slate-400 line-through">
                      ₹{exam.list_price}
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => onBuyClick(exam, e)}
                  className={`w-full py-1 rounded-[4px] font-semibold text-[10px] sm:text-xs tracking-wide transition text-center shadow-xs ${
                    isUnlocked
                      ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      : 'bg-[#f08c00] hover:bg-[#e07b00] text-white'
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
