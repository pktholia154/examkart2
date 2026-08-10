'use client';

import React, { useState, useEffect } from 'react';
import { ExamItem, TestLink } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  ArrowLeft, 
  ChevronRight, 
  FileText, 
  Users, 
  Clock, 
  HelpCircle, 
  Award, 
  Languages, 
  Sparkles, 
  CheckCircle2, 
  Lock,
  Play,
  Check
} from 'lucide-react';

interface ExamDetailsPageProps {
  exam: ExamItem;
  isUnlocked: boolean;
  onBack: () => void;
  onUnlockExam: (exam: ExamItem) => void;
  onStartTest: (test: TestLink, examTitle: string) => void;
}

export function ExamDetailsPage({
  exam: initialExam,
  isUnlocked,
  onBack,
  onUnlockExam,
  onStartTest
}: ExamDetailsPageProps) {
  const [exam, setExam] = useState<ExamItem>(initialExam);
  const [activeFilter, setActiveFilter] = useState<'all' | 'exam' | 'subject' | 'chapter' | 'paper'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchExamDetails() {
      try {
        const docRef = doc(db, 'exams', initialExam.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && isMounted) {
          setExam({ id: docSnap.id, ...docSnap.data() } as ExamItem);
        }
      } catch (err) {
        console.error("Failed to fetch exam details:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchExamDetails();
    return () => { isMounted = false; };
  }, [initialExam.id]);

  function parseTestLinks(data: any, type: string, defaultBadge?: string): TestLink[] {
    if (!data) return [];
    let flatArray: any[] = [];
    if (Array.isArray(data)) {
      flatArray = data.flat(Infinity);
    } else if (typeof data === 'object') {
      flatArray = Object.values(data).flat(Infinity);
    }
    
    return flatArray.filter(Boolean).map((t: any, i: number) => ({
      title: t.title || 'Untitled Test',
      url: t.url || '#',
      type: type as any,
      isFree: t.isFree ?? (i === 0), // Default first item to free if undefined
      marks: t.marks || t.questionsCount || 100,
      questionsCount: t.questionsCount || 100,
      timeMinutes: t.timeMinutes || 60,
      language: t.language || 'English',
      badge: t.badge || defaultBadge
    }));
  }

  // Consolidate test lists with tags/types
  const previousPapersList = parseTestLinks(exam.previouspapers, 'paper', 'Must Attempt');
  const practiceTestsList = parseTestLinks(exam.practicetests, 'exam', 'Must Attempt');
  const sectionalList = parseTestLinks(exam.sectional, 'subject');
  const chapterwiseList = parseTestLinks(exam.chapterwise, 'chapter');

  // Counts
  const examTestsCount = practiceTestsList.length;
  const subjectTestsCount = sectionalList.length;
  const chapterTestsCount = chapterwiseList.length;
  const previousPapersCount = previousPapersList.length;
  
  const totalTestsCount = examTestsCount + subjectTestsCount + chapterTestsCount + previousPapersCount;

  // All combined tests list for filtering
  const allTests: TestLink[] = [
    ...practiceTestsList,
    ...sectionalList,
    ...chapterwiseList,
    ...previousPapersList
  ];

  const displayedTests = activeFilter === 'all' 
    ? allTests 
    : allTests.filter(t => t.type === activeFilter);

  return (
    <div className="bg-white min-h-screen text-slate-900 pb-28 animate-in fade-in duration-150">
      {/* Top Header Navigation / Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto no-scrollbar">
            <button onClick={onBack} className="hover:text-slate-900 transition">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="hover:text-slate-900 cursor-pointer">{exam.category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="text-[#28811f] font-semibold truncate">Mock Tests</span>
          </nav>
        </div>

        {/* Exam Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
          {exam.title} Mock Test 2026, Online Test Series for Prelims & Mains
        </h1>

        {/* Subtitle Description */}
        <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
          Prepare for {exam.title} 2026 with ExamKart&apos;s free mock test series, designed strictly on the latest {exam.category} syllabus and exam pattern. Whether you are targeting Prelims or Mains, these tests cover all sections: English Language, Numerical Ability, and Reasoning Ability for Prelims, and General Awareness, Computer Aptitude, and Speed Drills. With {totalTestsCount} total tests, including memory-based papers, sectional tests, and chapter-wise practice, you get complete exam coverage in one place.
        </p>

        {/* Stats Cards (2 Cards: Total Tests & Users) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 my-6 max-w-md">
          {/* Total Tests Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-green-50 text-[#28811f] border border-green-100 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-base sm:text-xl font-bold text-[#28811f] leading-none">
                {totalTestsCount}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Total Tests
              </div>
            </div>
          </div>

          {/* Users Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-base sm:text-xl font-bold text-emerald-700 leading-none">
                479k+
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Active Users
              </div>
            </div>
          </div>
        </div>

        {/* "What You'll Get" Section */}
        <div className="mt-6 mb-8">
          <h2 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
            What You&apos;ll Get
          </h2>

          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              All Tests ({allTests.length})
            </button>

            <button
              onClick={() => setActiveFilter('exam')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'exam'
                  ? 'bg-green-50 text-[#28811f] border-[#28811f]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="font-bold">{examTestsCount}</span>
              <span>Practice Papers</span>
            </button>

            <button
              onClick={() => setActiveFilter('subject')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'subject'
                  ? 'bg-green-50 text-[#28811f] border-[#28811f]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="font-bold">{subjectTestsCount}</span>
              <span>Sectional Test</span>
            </button>

            <button
              onClick={() => setActiveFilter('chapter')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'chapter'
                  ? 'bg-green-50 text-[#28811f] border-[#28811f]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="font-bold">{chapterTestsCount}</span>
              <span>Chapterwise</span>
            </button>

            <button
              onClick={() => setActiveFilter('paper')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'paper'
                  ? 'bg-green-50 text-[#28811f] border-[#28811f]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="font-bold">{previousPapersCount}</span>
              <span>Previous Papers</span>
            </button>
          </div>
        </div>

        {/* Test List Section Header */}
        <div className="mt-8 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {exam.title} Free Mock Test 2026 (Prelims and Mains)
          </h2>
        </div>

        {/* Test Cards List */}
        <div className="space-y-4">
          {displayedTests.map((test, index) => {
            const canAccess = isUnlocked || test.isFree;

            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-primary/50 transition-all overflow-hidden"
              >
                {/* Main Card Content */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2.5 flex-1">
                    {/* Top Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {test.isFree && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-secondary-light text-secondary">
                          <Sparkles className="w-3 h-3 text-secondary" />
                          Free
                        </span>
                      )}

                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-primary-light text-primary">
                        {test.badge || 'Must Attempt'}
                      </span>
                    </div>

                    {/* Test Title */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {test.title}
                    </h3>

                    {/* Metadata Row */}
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-600 flex-wrap pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>{test.questionsCount} Questions</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>{test.marks} Marks</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{test.timeMinutes} Mins</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Button */}
                  <div className="sm:text-right shrink-0">
                    <button
                      onClick={() => {
                        if (canAccess) {
                          onStartTest(test, exam.title);
                        } else {
                          onUnlockExam(exam);
                        }
                      }}
                      className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition active-press border ${
                        canAccess
                          ? 'border-primary text-primary hover:bg-primary hover:text-white'
                          : 'bg-tertiary text-slate-950 border-tertiary hover:bg-tertiary-hover'
                      }`}
                    >
                      {canAccess ? 'Attempt now' : `Unlock (₹${exam.buy_price})`}
                    </button>
                  </div>
                </div>

                {/* Bottom Language Footer */}
                <div className="bg-slate-50/80 border-t border-slate-100 px-4 sm:px-5 py-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Languages className="w-3.5 h-3.5 text-slate-400" />
                  <span>{test.language || 'English'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Sticky Bar for Locked Exams */}
      {!isUnlocked && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 z-40 shadow-lg">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider block">
                Unlock Complete Series
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-extrabold text-slate-900">
                  ₹{exam.buy_price}
                </span>
                {exam.list_price > exam.buy_price && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{exam.list_price}
                  </span>
                )}
                <span className="text-xs font-bold text-secondary bg-secondary-light px-1.5 py-0.5 rounded">
                  {Math.round((1 - exam.buy_price / exam.list_price) * 100)}% OFF
                </span>
              </div>
            </div>

            <button
              onClick={() => onUnlockExam(exam)}
              className="px-6 py-2.5 rounded-xl bg-tertiary hover:bg-tertiary-hover text-slate-950 font-extrabold text-xs sm:text-sm uppercase tracking-wide transition active-press shadow-xs"
            >
              UNLOCK ALL TESTS (₹{exam.buy_price})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
