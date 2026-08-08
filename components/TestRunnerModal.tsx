'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  TestLink, 
  ExamSchema, 
  QuestionResponse, 
  ExamResult, 
  QuestionStatus,
  QuestionItem
} from '@/lib/types';
import { 
  fetchExamTestSchema, 
  evaluateSubmission, 
  saveTestSubmission 
} from '@/lib/examkart-engine';
import { RenderBlock, RenderMathText, BlockErrorBoundary } from '@/components/RenderBlock';
import ReactECharts from 'echarts-for-react';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Award, 
  Star, 
  RotateCcw,
  Pause,
  Play,
  Maximize2,
  Grid,
  AlertCircle,
  BarChart3,
  Check,
  HelpCircle,
  Languages,
  BookOpen,
  TrendingUp,
  Target,
  Sparkles
} from 'lucide-react';

interface TestRunnerModalProps {
  test: TestLink | null;
  examTitle: string;
  userId?: string;
  onClose: () => void;
}

export function TestRunnerModal({
  test,
  examTitle,
  userId = 'user_demo_101',
  onClose
}: TestRunnerModalProps) {
  // Test Schema state
  const [examSchema, setExamSchema] = useState<ExamSchema | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // CBT Navigation & State
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(0);
  const [currentQIdx, setCurrentQIdx] = useState<number>(0);

  // Response tracker: map qId -> { ans, status, timeSec }
  const [responses, setResponses] = useState<Record<string, { ans: number | null; status: QuestionStatus; timeSec: number }>>({});
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  // Timer & Controls
  const [timeLeft, setTimeLeft] = useState<number>(3600);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // Submitted & Analytics
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [solutionFilter, setSolutionFilter] = useState<'all' | 'incorrect' | 'unattempted' | 'correct'>('all');
  const [activeLanguage, setActiveLanguage] = useState<'English' | 'Hindi'>('English');

  // Load Exam Schema JSON from URL or Fallback
  useEffect(() => {
    let isMounted = true;
    async function loadExam() {
      if (!test) return;
      setLoading(true);
      try {
        const schema = await fetchExamTestSchema(test.url, test.title);
        if (isMounted) {
          setExamSchema(schema);
          setTimeLeft((schema.timeMinutes || 60) * 60);

          // Initialize response state for all questions
          const initialMap: Record<string, { ans: number | null; status: QuestionStatus; timeSec: number }> = {};
          schema.sections.forEach(sec => {
            sec.questions.forEach(q => {
              initialMap[q.id] = {
                ans: null,
                status: 'not_visited',
                timeSec: 0
              };
            });
          });

          // Mark first question as visited
          const firstQ = schema.sections[0]?.questions[0];
          if (firstQ) {
            initialMap[firstQ.id].status = 'not_answered';
          }

          setResponses(initialMap);
          setQuestionStartTime(Date.now());
        }
      } catch (err) {
        console.error("Failed to load test schema:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadExam();
    return () => {
      isMounted = false;
    };
  }, [test]);

  // Helpers
  const currentSection = examSchema?.sections[activeSectionIdx] || examSchema?.sections[0];
  const currentQ: QuestionItem | undefined = currentSection?.questions[currentQIdx];

  const updateQuestionTimeAndStatus = useCallback((nextQId?: string, nextStatus?: QuestionStatus, selectedAns?: number | null) => {
    if (!currentQ) return;

    const now = Date.now();
    const elapsedSec = Math.max(1, Math.round((now - questionStartTime) / 1000));
    setQuestionStartTime(now);

    setResponses(prev => {
      const existing = prev[currentQ.id] || { ans: null, status: 'not_visited', timeSec: 0 };
      const newAns = selectedAns !== undefined ? selectedAns : existing.ans;
      let newStatus = nextStatus || existing.status;

      // Auto resolve status if not explicitly set
      if (!nextStatus) {
        if (existing.status === 'marked_for_review' || existing.status === 'answered_and_marked') {
          newStatus = newAns !== null ? 'answered_and_marked' : 'marked_for_review';
        } else {
          newStatus = newAns !== null ? 'answered' : 'not_answered';
        }
      }

      const updated = {
        ...prev,
        [currentQ.id]: {
          ans: newAns,
          status: newStatus,
          timeSec: existing.timeSec + elapsedSec
        }
      };

      // Set next question status to 'not_answered' if 'not_visited'
      if (nextQId && updated[nextQId] && updated[nextQId].status === 'not_visited') {
        updated[nextQId] = {
          ...updated[nextQId],
          status: 'not_answered'
        };
      }

      return updated;
    });
  }, [currentQ, questionStartTime]);

  const handleFinalSubmit = useCallback(async () => {
    if (!examSchema) return;

    setIsConfirmModalOpen(false);
    updateQuestionTimeAndStatus();

    const formattedResponses: QuestionResponse[] = Object.entries(responses).map(([qId, data]) => {
      // Find sectionId
      let sectionId = 'sec_1';
      for (const sec of examSchema.sections) {
        if (sec.questions.some(q => q.id === qId)) {
          sectionId = sec.id;
          break;
        }
      }
      return {
        qId,
        sectionId,
        ans: data.ans,
        status: data.status,
        timeSec: data.timeSec
      };
    });

    const totalSpentTime = (examSchema.timeMinutes * 60) - timeLeft;
    const result = evaluateSubmission(examSchema, formattedResponses, totalSpentTime);

    setExamResult(result);
    setIsSubmitted(true);

    // Save to Firestore
    await saveTestSubmission(userId, result);
  }, [examSchema, updateQuestionTimeAndStatus, responses, timeLeft, userId]);

  // Timer Tick Effect
  useEffect(() => {
    if (isSubmitted || isPaused || loading) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, isPaused, loading, handleFinalSubmit]);

  if (!test) return null;

  const handleSelectOption = (optIdx: number) => {
    if (isSubmitted || !currentQ) return;
    const currentResp = responses[currentQ.id];
    const newAns = currentResp?.ans === optIdx ? null : optIdx;
    
    setResponses(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        ans: newAns,
        status: prev[currentQ.id]?.status === 'marked_for_review' || prev[currentQ.id]?.status === 'answered_and_marked'
          ? (newAns !== null ? 'answered_and_marked' : 'marked_for_review')
          : (newAns !== null ? 'answered' : 'not_answered')
      }
    }));
  };

  const handleClearResponse = () => {
    if (!currentQ) return;
    setResponses(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        ans: null,
        status: 'not_answered'
      }
    }));
  };

  const handleMarkForReview = () => {
    if (!currentQ) return;
    const currentAns = responses[currentQ.id]?.ans;
    const newStatus: QuestionStatus = currentAns !== null && currentAns !== undefined 
      ? 'answered_and_marked' 
      : 'marked_for_review';

    handleNextQuestion(newStatus);
  };

  const handleNextQuestion = (overrideStatus?: QuestionStatus) => {
    if (!examSchema || !currentSection) return;

    if (currentQIdx < currentSection.questions.length - 1) {
      const nextQ = currentSection.questions[currentQIdx + 1];
      updateQuestionTimeAndStatus(nextQ.id, overrideStatus);
      setCurrentQIdx(c => c + 1);
    } else if (activeSectionIdx < examSchema.sections.length - 1) {
      const nextSection = examSchema.sections[activeSectionIdx + 1];
      const nextQ = nextSection.questions[0];
      updateQuestionTimeAndStatus(nextQ.id, overrideStatus);
      setActiveSectionIdx(s => s + 1);
      setCurrentQIdx(0);
    } else {
      updateQuestionTimeAndStatus(undefined, overrideStatus);
      setIsConfirmModalOpen(true);
    }
  };

  const handlePrevQuestion = () => {
    if (!examSchema || !currentSection) return;

    if (currentQIdx > 0) {
      const prevQ = currentSection.questions[currentQIdx - 1];
      updateQuestionTimeAndStatus(prevQ.id);
      setCurrentQIdx(c => c - 1);
    } else if (activeSectionIdx > 0) {
      const prevSection = examSchema.sections[activeSectionIdx - 1];
      const prevQ = prevSection.questions[prevSection.questions.length - 1];
      updateQuestionTimeAndStatus(prevQ.id);
      setActiveSectionIdx(s => s - 1);
      setCurrentQIdx(prevSection.questions.length - 1);
    }
  };

  const handleJumpToQuestion = (secIdx: number, qIdx: number) => {
    if (!examSchema) return;
    const targetQ = examSchema.sections[secIdx]?.questions[qIdx];
    if (!targetQ) return;

    updateQuestionTimeAndStatus(targetQ.id);
    setActiveSectionIdx(secIdx);
    setCurrentQIdx(qIdx);
    setIsPaletteOpen(false);
  };

  // Status counters for question palette
  const allQuestionsList = examSchema?.sections.flatMap(s => s.questions) || [];
  const statusCounts = {
    answered: 0,
    not_answered: 0,
    marked_for_review: 0,
    answered_and_marked: 0,
    not_visited: 0
  };

  allQuestionsList.forEach(q => {
    const st = responses[q.id]?.status || 'not_visited';
    statusCounts[st] = (statusCounts[st] || 0) + 1;
  });

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isTimeLow = timeLeft < 300; // < 5 mins

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-2 md:p-4 overflow-hidden select-none">
      <div className="bg-white w-full h-full max-w-7xl max-h-[100vh] sm:max-h-[96vh] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* ================= 1. CBT TOP BAR HEADER ================= */}
        <div className="bg-slate-900 text-white p-2.5 sm:p-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff8f00] to-amber-600 flex items-center justify-center text-slate-950 font-black text-xs shrink-0 shadow-xs">
              CBT
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">
                  Live Examination Simulator
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono hidden sm:inline">
                  TCS iON Pattern
                </span>
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                {examSchema?.title || test.title} — {examTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800 border border-slate-700/80 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-200">
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={activeLanguage}
                onChange={(e) => setActiveLanguage(e.target.value as any)}
                className="bg-transparent border-none text-xs font-bold text-white focus:outline-hidden cursor-pointer"
              >
                <option value="English" className="bg-slate-900 text-white">English</option>
                <option value="Hindi" className="bg-slate-900 text-white">Hindi (हिंदी)</option>
              </select>
            </div>

            {/* Live Countdown Timer */}
            {!isSubmitted && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs font-extrabold transition ${
                isTimeLow 
                  ? 'bg-rose-950/80 border-rose-500/80 text-rose-400 animate-pulse' 
                  : 'bg-slate-800 border-slate-700 text-amber-400'
              }`}>
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Time Left: {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
              </div>
            )}

            {/* Mobile Palette Drawer Trigger */}
            {!isSubmitted && (
              <button
                onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition sm:hidden flex items-center gap-1 text-xs font-bold"
                title="Question Palette"
              >
                <Grid className="w-4 h-4 text-amber-400" />
                <span className="text-[10px]">{allQuestionsList.length}</span>
              </button>
            )}

            {/* Exit Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white transition"
              title="Exit Exam"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-50">
            <div className="w-12 h-12 border-4 border-[#1a237e] border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Loading Exam Questions JSON...</h3>
              <p className="text-xs text-slate-500 mt-1">Initializing KaTeX math engine, ECharts, and block fail-safes</p>
            </div>
          </div>
        ) : !isSubmitted ? (
          /* ================= 2. LIVE CBT EXAM INTERFACE ================= */
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-100 relative">
            
            {/* Section Switcher Tabs */}
            {examSchema && examSchema.sections.length > 0 && (
              <div className="bg-white border-b border-slate-200 px-3 sm:px-5 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
                  Sections:
                </span>
                {examSchema.sections.map((sec, idx) => {
                  const isActive = activeSectionIdx === idx;
                  const secAnsweredCount = sec.questions.filter(q => responses[q.id]?.ans !== null && responses[q.id]?.ans !== undefined).length;

                  return (
                    <button
                      key={sec.id}
                      onClick={() => {
                        updateQuestionTimeAndStatus();
                        setActiveSectionIdx(idx);
                        setCurrentQIdx(0);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 border ${
                        isActive
                          ? 'bg-[#1a237e] text-white border-[#1a237e] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{sec.title}</span>
                      <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                        isActive ? 'bg-indigo-900/60 text-amber-300' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {secAnsweredCount}/{sec.questions.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main Body Grid (Question Area + Question Palette Sidebar) */}
            <div className="flex-1 flex overflow-hidden relative">
              
              {/* Question Screen Left Panel */}
              <div className="flex-1 flex flex-col overflow-y-auto p-3 sm:p-5 space-y-4">
                
                {currentQ ? (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
                    
                    {/* Question Header Meta */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-[#1a237e] text-xs font-black">
                          Q{currentQIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          of {currentSection?.questions.length} questions
                        </span>
                        {currentQ.tag && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono font-bold uppercase tracking-wider border border-slate-200">
                            {currentQ.tag}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                          +{currentQ.positiveMarks || 2.0} / -{currentQ.negativeMarks || 0.25}
                        </span>

                        {/* Bookmark / Review Button */}
                        <button
                          onClick={handleMarkForReview}
                          className={`p-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                            responses[currentQ.id]?.status === 'marked_for_review' || responses[currentQ.id]?.status === 'answered_and_marked'
                              ? 'bg-purple-100 border-purple-300 text-purple-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                          title="Mark for Review"
                        >
                          <Star className={`w-3.5 h-3.5 ${
                            responses[currentQ.id]?.status === 'marked_for_review' || responses[currentQ.id]?.status === 'answered_and_marked'
                              ? 'fill-purple-600 text-purple-600'
                              : 'text-slate-400'
                          }`} />
                          <span className="hidden sm:inline">Review</span>
                        </button>
                      </div>
                    </div>

                    {/* Question Stem Text */}
                    <div className="pt-1">
                      <RenderMathText text={currentQ.stem} className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed" />
                    </div>

                    {/* Question Block Elements (Markdown, ECharts, SVG, Images) */}
                    {currentQ.blocks && currentQ.blocks.length > 0 && (
                      <div className="space-y-3 pt-2">
                        {currentQ.blocks.map((block, bIdx) => (
                          <RenderBlock key={bIdx} block={block} />
                        ))}
                      </div>
                    )}

                    {/* Options List */}
                    <div className="space-y-2.5 pt-3">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Select Option:
                      </span>

                      {currentQ.opts.map((optText, optIdx) => {
                        const isSelected = responses[currentQ.id]?.ans === optIdx;
                        const optionLetter = String.fromCharCode(65 + optIdx);

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(optIdx)}
                            className={`w-full p-3.5 rounded-xl border text-left transition flex items-start gap-3 text-xs sm:text-sm font-medium ${
                              isSelected
                                ? 'bg-indigo-50/90 border-[#1a237e] text-[#1a237e] ring-2 ring-[#1a237e]/20 font-semibold shadow-xs'
                                : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected ? 'bg-[#1a237e] text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {optionLetter}
                            </span>
                            <div className="flex-1 pt-0.5">
                              <RenderMathText text={optText} />
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-[#1a237e] shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500">No question available</div>
                )}
              </div>

              {/* Question Palette Sidebar (Desktop persistent / Mobile drawer) */}
              <div className={`w-72 bg-white border-l border-slate-200 flex flex-col shrink-0 z-30 transition-transform duration-200 ${
                isPaletteOpen ? 'fixed inset-y-0 right-0 z-50 shadow-2xl' : 'hidden sm:flex'
              }`}>
                {/* Palette Header */}
                <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center">
                      U
                    </div>
                    <div>
                      <div className="text-xs font-bold">Candidate: User</div>
                      <div className="text-[10px] text-amber-400">Roll: 2026-CBT-088</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsPaletteOpen(false)}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white sm:hidden"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Color Legend Breakdown */}
                <div className="p-3 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">
                      {statusCounts.answered}
                    </span>
                    <span>Answered</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-rose-600 text-white text-[9px] flex items-center justify-center font-bold">
                      {statusCounts.not_answered}
                    </span>
                    <span>Not Answered</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-slate-200 border border-slate-300 text-slate-700 text-[9px] flex items-center justify-center font-bold">
                      {statusCounts.not_visited}
                    </span>
                    <span>Not Visited</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-purple-600 text-white text-[9px] flex items-center justify-center font-bold">
                      {statusCounts.marked_for_review + statusCounts.answered_and_marked}
                    </span>
                    <span>Review</span>
                  </div>
                </div>

                {/* Question Grid Numbers */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {currentSection?.title} Questions
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {currentSection?.questions.map((q, idx) => {
                      const respStatus = responses[q.id]?.status || 'not_visited';
                      const isCurrent = currentQIdx === idx;

                      let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:border-slate-400';
                      if (respStatus === 'answered') {
                        btnStyle = 'bg-emerald-600 text-white border-emerald-700';
                      } else if (respStatus === 'not_answered') {
                        btnStyle = 'bg-rose-600 text-white border-rose-700';
                      } else if (respStatus === 'marked_for_review') {
                        btnStyle = 'bg-purple-600 text-white border-purple-700';
                      } else if (respStatus === 'answered_and_marked') {
                        btnStyle = 'bg-purple-600 text-white border-purple-700 relative';
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => handleJumpToQuestion(activeSectionIdx, idx)}
                          className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center border shadow-2xs ${btnStyle} ${
                            isCurrent ? 'ring-2 ring-amber-400 ring-offset-2 font-black' : ''
                          }`}
                        >
                          {idx + 1}
                          {respStatus === 'answered_and_marked' && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Test CTA Button */}
                <div className="p-3 bg-slate-50 border-t border-slate-200">
                  <button
                    onClick={() => setIsConfirmModalOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-[#ff8f00] hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition active-press shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>Submit Exam</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* ================= 3. BOTTOM CONTROL BAR ================= */}
            <div className="bg-white border-t border-slate-200 p-2.5 sm:p-3 px-3 sm:px-6 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkForReview}
                  className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold transition hidden sm:inline-flex"
                >
                  Mark for Review & Next
                </button>

                <button
                  onClick={handleClearResponse}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Clear Response
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={activeSectionIdx === 0 && currentQIdx === 0}
                  onClick={handlePrevQuestion}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 text-xs font-bold disabled:opacity-40 transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => handleNextQuestion()}
                  className="px-5 py-2 rounded-xl bg-[#1a237e] hover:bg-indigo-900 text-white font-extrabold text-xs uppercase tracking-wide transition active-press shadow-xs flex items-center gap-1"
                >
                  <span>
                    {activeSectionIdx === (examSchema?.sections.length || 1) - 1 && currentQIdx === (currentSection?.questions.length || 1) - 1
                      ? 'Submit Exam'
                      : 'Save & Next'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* ================= 4. POST-EXAM RESULTS ANALYTICS REPORT (MATCHING SCREENSHOT!) ================= */
          <div className="flex-1 bg-slate-50 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Header Banner */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                  Official CBT Performance Analytics
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  {examResult?.examTitle || 'Test Analysis'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Completed on {new Date(examResult?.completedAt || '').toLocaleString()}
                </p>
              </div>

              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition active-press shadow-xs"
              >
                Back to Dashboard
              </button>
            </div>

            {/* Score & Rank Cards Row (Matching Screenshot Layout!) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Score Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Your Score</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[11px]">
                    Negative Marks: -{examResult?.negativeMarks}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#1a237e]">{examResult?.score}</span>
                  <span className="text-sm font-bold text-slate-400">/ {examResult?.maxScore} pts</span>
                </div>
                <div className="text-xs text-slate-500 font-medium pt-1">
                  Correct: <strong className="text-emerald-600">{examResult?.correctCount}</strong> | Incorrect: <strong className="text-rose-600">{examResult?.incorrectCount}</strong>
                </div>
              </div>

              {/* Accuracy Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Accuracy Rate</span>
                  <Target className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-3xl font-black text-amber-600">
                  {examResult?.accuracy}%
                </div>
                <div className="text-xs text-slate-500 font-medium pt-1">
                  Target threshold: &gt;85.0%
                </div>
              </div>

              {/* Rank & Percentile Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Estimated All India Rank</span>
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-600">16</span>
                  <span className="text-xs font-bold text-slate-400">/ 795 Candidates</span>
                </div>
                <div className="text-xs text-slate-500 font-medium pt-1">
                  Percentile: <strong className="text-indigo-900">98.2th</strong>
                </div>
              </div>

            </div>

            {/* Interactive Chart Section: Accuracy & Time Distribution */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#1a237e]" />
                  <span>Accuracy & Time Distribution per Question</span>
                </h3>
              </div>

              <div style={{ height: 240, width: '100%' }}>
                <ReactECharts
                  option={{
                    animation: false,
                    tooltip: { trigger: 'axis' },
                    xAxis: {
                      type: 'category',
                      data: examResult?.responses.map((_, i) => `Q${i + 1}`) || []
                    },
                    yAxis: [
                      { type: 'value', name: 'Time (s)', min: 0 },
                      { type: 'value', name: 'Correct (1/0)', min: 0, max: 1 }
                    ],
                    series: [
                      {
                        name: 'Time Spent (s)',
                        type: 'bar',
                        data: examResult?.responses.map(r => r.timeSec) || [],
                        itemStyle: { color: '#1a237e' }
                      },
                      {
                        name: 'Accuracy',
                        type: 'line',
                        yAxisIndex: 1,
                        data: examResult?.responses.map(r => {
                          const q = allQuestionsList.find(q => q.id === r.qId);
                          return r.ans === q?.key ? 1 : 0;
                        }) || [],
                        itemStyle: { color: '#059669' }
                      }
                    ]
                  }}
                  opts={{ renderer: 'canvas' }}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            </div>

            {/* Topic Concept Breakdown Analysis */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Concept & Topic Tag Performance Breakdown</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.values(examResult?.topicBreakdown || {}).map(topic => {
                  const tagAcc = topic.total > 0 ? Math.round((topic.correct / topic.total) * 100) : 0;
                  const isWeak = tagAcc < 60;

                  return (
                    <div
                      key={topic.tag}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                        isWeak ? 'bg-rose-50/60 border-rose-200' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-mono font-bold text-slate-900 uppercase">
                          {topic.tag}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Correct: {topic.correct}/{topic.total} | Time: {topic.timeSpent}s
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-sm font-black ${isWeak ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {tagAcc}%
                        </span>
                        <span className={`block text-[10px] font-bold ${isWeak ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {isWeak ? 'Needs Revision' : 'Strong Area'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Question Solutions Explorer */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#1a237e]" />
                  <span>Detailed Solutions & LaTeX Explanations</span>
                </h3>

                {/* Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {(['all', 'incorrect', 'unattempted', 'correct'] as const).map(filterKey => (
                    <button
                      key={filterKey}
                      onClick={() => setSolutionFilter(filterKey)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border transition ${
                        solutionFilter === filterKey
                          ? 'bg-[#1a237e] text-white border-[#1a237e]'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {filterKey}
                    </button>
                  ))}
                </div>
              </div>

              {/* Questions List Solutions */}
              <div className="space-y-4">
                {allQuestionsList.map((q, idx) => {
                  const userResp = examResult?.responses.find(r => r.qId === q.id);
                  const isCorrect = userResp?.ans === q.key;
                  const isUnattempted = userResp?.ans === null || userResp?.ans === undefined;

                  if (solutionFilter === 'incorrect' && (isCorrect || isUnattempted)) return null;
                  if (solutionFilter === 'correct' && !isCorrect) return null;
                  if (solutionFilter === 'unattempted' && !isUnattempted) return null;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border text-xs space-y-3 ${
                        isCorrect
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : isUnattempted
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-rose-50/40 border-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold border-b border-slate-200/60 pb-2">
                        <span className="text-slate-900 text-sm">
                          Q{idx + 1}. {q.tag && <span className="font-mono text-slate-500 ml-1">[{q.tag}]</span>}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : isUnattempted
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isCorrect ? 'Correct (+2.0)' : isUnattempted ? 'Unattempted (0.0)' : 'Incorrect (-0.25)'}
                        </span>
                      </div>

                      <RenderMathText text={q.stem} className="font-semibold text-slate-800" />

                      {/* Options breakdown */}
                      <div className="space-y-1.5 pt-1">
                        {q.opts.map((optText, optIdx) => {
                          const isUserSelected = userResp?.ans === optIdx;
                          const isCorrectOpt = q.key === optIdx;

                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-lg border flex items-center justify-between font-medium ${
                                isCorrectOpt
                                  ? 'bg-emerald-100/80 border-emerald-300 text-emerald-900 font-bold'
                                  : isUserSelected
                                  ? 'bg-rose-100/80 border-rose-300 text-rose-900 font-bold'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                                <RenderMathText text={optText} />
                              </div>

                              <div>
                                {isCorrectOpt && <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">Correct Key</span>}
                                {!isCorrectOpt && isUserSelected && <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-bold">Your Choice</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* LaTeX Explanation */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Detailed Solution:
                        </span>
                        <RenderMathText text={q.sol} className="text-slate-700 leading-relaxed" />
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Confirmation Modal prior to Submit */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">Submit Examination?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to complete and submit your test? Here is your attempt summary:
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs font-bold text-slate-700">
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <span className="font-mono">{allQuestionsList.length}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Answered:</span>
                <span className="font-mono">{statusCounts.answered}</span>
              </div>
              <div className="flex justify-between text-purple-600">
                <span>Marked for Review:</span>
                <span className="font-mono">{statusCounts.marked_for_review + statusCounts.answered_and_marked}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Not Answered / Visited:</span>
                <span className="font-mono">{statusCounts.not_answered + statusCounts.not_visited}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
              >
                Resume Exam
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex-1 py-2.5 rounded-xl bg-[#ff8f00] hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition active-press shadow-xs"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
