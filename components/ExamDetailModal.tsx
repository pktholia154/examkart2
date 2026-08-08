'use client';

import React, { useState } from 'react';
import { ExamItem, TestLink } from '@/lib/types';
import { X, Play, Clock, FileText, CheckCircle2, ChevronRight, Video, Sparkles } from 'lucide-react';

interface ExamDetailModalProps {
  exam: ExamItem | null;
  isUnlocked: boolean;
  onClose: () => void;
  onUnlock: () => void;
  onStartTest: (test: TestLink) => void;
}

export function ExamDetailModal({
  exam,
  isUnlocked,
  onClose,
  onUnlock,
  onStartTest
}: ExamDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'papers' | 'practice' | 'sectional' | 'chapter'>('practice');

  if (!exam) return null;

  // Flatten tests
  const previousPapersList = exam.previouspapers?.flat() || [];
  const practiceTestsList = exam.practicetests?.flat() || [];
  const sectionalList = exam.sectional?.flat() || [];
  const chapterwiseList = exam.chapterwise?.flat() || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all">
      <div className="bg-white w-full sm:max-w-2xl max-h-[90vh] sm:rounded-2xl rounded-t-2xl shadow-xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
        
        {/* Header Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-start justify-between relative">
          <div className="space-y-1 pr-6">
            <span className="text-[10px] font-extrabold uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
              {exam.category}
            </span>
            <h2 className="text-base sm:text-lg font-bold leading-snug">
              {exam.title}
            </h2>
            <p className="text-xs text-slate-300 line-clamp-2">
              {exam.full_description || exam.seo_description}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Exam Stats Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-around text-xs font-medium text-slate-700">
          <div className="flex items-center gap-1.5">
            <Video className="w-4 h-4 text-[#1a237e]" />
            <span>{exam.classes_count || 150}+ Classes</span>
          </div>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#1a237e]" />
            <span>{exam.mocks_count || 50}+ Full Mocks</span>
          </div>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Instant Analysis</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 px-4 bg-white overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('practice')}
            className={`py-2.5 px-3 font-semibold text-xs border-b-2 whitespace-nowrap transition ${
              activeTab === 'practice'
                ? 'border-[#1a237e] text-[#1a237e]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Practice Mocks ({practiceTestsList.length})
          </button>
          <button
            onClick={() => setActiveTab('papers')}
            className={`py-2.5 px-3 font-semibold text-xs border-b-2 whitespace-nowrap transition ${
              activeTab === 'papers'
                ? 'border-[#1a237e] text-[#1a237e]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Previous Papers ({previousPapersList.length})
          </button>
          <button
            onClick={() => setActiveTab('sectional')}
            className={`py-2.5 px-3 font-semibold text-xs border-b-2 whitespace-nowrap transition ${
              activeTab === 'sectional'
                ? 'border-[#1a237e] text-[#1a237e]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sectional ({sectionalList.length})
          </button>
          <button
            onClick={() => setActiveTab('chapter')}
            className={`py-2.5 px-3 font-semibold text-xs border-b-2 whitespace-nowrap transition ${
              activeTab === 'chapter'
                ? 'border-[#1a237e] text-[#1a237e]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Chapterwise ({chapterwiseList.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5 min-h-[220px]">
          {activeTab === 'practice' && (
            practiceTestsList.map((test, idx) => (
              <TestItemRow
                key={idx}
                test={test}
                isUnlocked={isUnlocked}
                onStart={() => onStartTest(test)}
              />
            ))
          )}

          {activeTab === 'papers' && (
            previousPapersList.map((test, idx) => (
              <TestItemRow
                key={idx}
                test={test}
                isUnlocked={isUnlocked}
                onStart={() => onStartTest(test)}
              />
            ))
          )}

          {activeTab === 'sectional' && (
            sectionalList.map((test, idx) => (
              <TestItemRow
                key={idx}
                test={test}
                isUnlocked={isUnlocked}
                onStart={() => onStartTest(test)}
              />
            ))
          )}

          {activeTab === 'chapter' && (
            chapterwiseList.map((test, idx) => (
              <TestItemRow
                key={idx}
                test={test}
                isUnlocked={isUnlocked}
                onStart={() => onStartTest(test)}
              />
            ))
          )}
        </div>

        {/* Bottom CTA Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Total Price</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900">₹{exam.buy_price}</span>
              <span className="text-xs text-slate-400 line-through">₹{exam.list_price}</span>
            </div>
          </div>

          {!isUnlocked ? (
            <button
              onClick={onUnlock}
              className="px-6 py-2.5 rounded-xl bg-[#ff8f00] hover:bg-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition active-press shadow-sm"
            >
              UNLOCK ALL TESTS (₹{exam.buy_price})
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs bg-emerald-100/80 px-4 py-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              <span>Full Pass Unlocked</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function TestItemRow({
  test,
  isUnlocked,
  onStart
}: {
  test: TestLink;
  isUnlocked: boolean;
  onStart: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition">
      <div className="space-y-1 pr-2">
        <h4 className="text-xs font-bold text-slate-900 leading-tight">
          {test.title}
        </h4>
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3 text-slate-400" />
            {test.questionsCount || 100} Questions
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {test.timeMinutes || 60} Mins
          </span>
        </div>
      </div>

      <button
        onClick={onStart}
        className="px-3 py-1.5 rounded-lg bg-[#1a237e] hover:bg-[#1a237e]/90 text-white font-bold text-xs flex items-center gap-1 shrink-0 active-press"
      >
        <Play className="w-3 h-3 fill-white" />
        <span>Start</span>
      </button>
    </div>
  );
}
