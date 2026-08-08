'use client';

import React, { useState } from 'react';
import { BookItem } from '@/lib/types';
import { X, BookOpen, Download, Bookmark, ArrowLeft, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';

interface BookReaderModalProps {
  book: BookItem | null;
  isUnlocked: boolean;
  onClose: () => void;
  onBuy: () => void;
}

export function BookReaderModal({
  book,
  isUnlocked,
  onClose,
  onBuy
}: BookReaderModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarked, setBookmarked] = useState(false);

  if (!book) return null;

  const totalPages = 42;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 transition-all">
      <div className="bg-white w-full sm:max-w-3xl h-[85vh] rounded-2xl shadow-xl overflow-hidden flex flex-col">
        
        {/* Top Reader Toolbar */}
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold truncate max-w-xs sm:max-w-md">
                {book.title}
              </h3>
              <p className="text-[10px] text-slate-300">
                {book.subtitle || 'Official E-Book Reader'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`p-1.5 rounded-lg transition ${
                bookmarked ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Bookmark Page"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reader Canvas View */}
        <div className="flex-1 bg-slate-100 p-4 sm:p-6 overflow-y-auto flex justify-center items-center">
          <div className="bg-white w-full max-w-xl h-full rounded-xl shadow-md p-6 sm:p-8 flex flex-col justify-between border border-slate-200">
            {/* Page Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs text-slate-400 font-medium">
              <span>ExamKart Digital Reader</span>
              <span>Chapter 1: Foundation Concepts</span>
            </div>

            {/* Page Main Content */}
            <div className="my-auto space-y-4 text-slate-800 leading-relaxed text-sm">
              <h2 className="text-lg font-bold text-[#1a237e]">
                1.1 Introduction to Competitive Exam Mastery
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                To excel in competitive exams such as {book.category}, understanding fundamental shortcuts, formula derivations, and speed strategies is paramount.
              </p>

              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-700 space-y-2">
                <div className="font-bold text-[#1a237e] flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>Key Formulas & Solved Examples</span>
                </div>
                <p>
                  1. Speed = Distance / Time<br />
                  2. Relative Speed in same direction = S1 - S2<br />
                  3. Compound Interest Shortcut: A = P(1 + r/100)^n
                </p>
              </div>

              {!isUnlocked && currentPage > 3 && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center space-y-2">
                  <p className="text-xs font-semibold text-amber-900">
                    You are viewing the Free Sample Preview. Unlock full book access to read all {totalPages} chapters!
                  </p>
                  <button
                    onClick={onBuy}
                    className="px-4 py-2 bg-[#ff8f00] hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-xs"
                  >
                    Unlock Full E-Book (₹{book.buy_price})
                  </button>
                </div>
              )}
            </div>

            {/* Page Footer Controls */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-slate-100 disabled:opacity-40"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <span className="font-semibold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages || (!isUnlocked && currentPage >= 3)}
                onClick={() => setCurrentPage(p => p + 1)}
                className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-slate-100 disabled:opacity-40"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">₹{book.buy_price}</span>
            <span className="text-xs text-slate-400 line-through">₹{book.list_price}</span>
          </div>

          {!isUnlocked ? (
            <button
              onClick={onBuy}
              className="px-5 py-2 rounded-xl bg-[#ff8f00] hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wide transition active-press"
            >
              UNLOCK E-BOOK
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs bg-emerald-100 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>Full Book Unlocked</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
