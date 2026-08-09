'use client';

import React, { useState } from 'react';
import { BookItem } from '@/lib/types';
import {
  ArrowLeft,
  ChevronRight,
  Search,
  BookOpen,
  ShoppingCart,
  Share2,
  Clock,
  Star,
  FileText,
  CheckCircle2,
  Building2,
  Check,
  Sparkles,
  Zap,
  Layers,
  Globe,
  Award
} from 'lucide-react';
import { BookReaderModal } from '@/components/BookReaderModal';

interface BookDetailsPageProps {
  book: BookItem;
  isUnlocked: boolean;
  onBack: () => void;
  onBuyBook: (book: BookItem) => void;
  onRentBook?: (book: BookItem) => void;
}

export function BookDetailsPage({
  book,
  isUnlocked,
  onBack,
  onBuyBook,
  onRentBook
}: BookDetailsPageProps) {
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [readerFormat, setReaderFormat] = useState<'pdf' | 'html'>('pdf');

  const publisher = book.publisher || 'Mocktime Publication';
  const rating = book.rating || 4.8;
  const reviewCount = book.review_count || 128;
  const rentPrice = book.rent_price || Math.round(book.buy_price * 0.22);
  const mcqCount = book.mcq_count || '2400+';

  const hasHtml = Boolean(book.html_file || (book as any).htmlurl);
  const hasPdf = Boolean(book.pdf_file || (book as any).pdfurl || book.sample_file || (book as any).sampleurl);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('E-Book link copied to clipboard!');
    } else {
      showToast('Sharing link generated!');
    }
  };

  return (
    <div className="bg-white min-h-screen text-slate-900 pb-28 animate-in fade-in duration-150">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <div className="border-b border-slate-100 bg-white sticky top-0 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center justify-center shrink-0"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
              {book.category}
            </h2>
          </div>

          <button
            onClick={() => showToast('Search catalog...')}
            className="text-xs sm:text-sm font-extrabold text-[#1976D2] hover:underline flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-3 sm:pt-5 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto no-scrollbar">
          <button onClick={onBack} className="hover:text-slate-900 transition">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="hover:text-slate-900 cursor-pointer">Categories</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-[#1976D2] font-semibold truncate">{book.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-slate-400 truncate max-w-[150px]">{book.title}</span>
        </nav>

        {/* Book Hero Layout (Cover + Info) */}
        <div className="flex flex-row gap-4 sm:gap-6 items-start">
          {/* Left Book Cover Visual */}
          <div className="w-24 sm:w-36 shrink-0">
            <div className="relative aspect-3/4 rounded-md bg-slate-100 shadow-sm border border-slate-200 overflow-hidden group">
              {book.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={book.cover} 
                  alt={book.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1976D2] to-[#0D47A1] text-white p-2 flex flex-col justify-between">
                  <span className="text-[8px] sm:text-[10px] font-black uppercase text-blue-100 block truncate">{book.category}</span>
                  <div className="text-[10px] sm:text-xs font-bold text-white/90 line-clamp-3 leading-tight">{book.title}</div>
                  <span className="text-[8px] text-blue-100 font-semibold block truncate border-t border-white/20 pt-1">
                    {publisher}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Info Section */}
          <div className="flex-1 space-y-2 w-full">
            <span className="text-xs font-black text-[#1976D2] uppercase tracking-wider bg-blue-100/90 border border-blue-200 px-2.5 py-1 rounded-md inline-block">
              {book.category}
            </span>

            <h1 className="text-lg sm:text-2xl font-black text-slate-950 tracking-tight leading-snug">
              {book.title}
            </h1>

            {/* Rating and Reviews */}
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
              <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-black text-slate-950">{rating}</span>
              </div>
              <span>•</span>
              <span className="text-slate-700 font-bold">{reviewCount} Verified Reviews</span>
            </div>

            {/* Publisher info */}
            <div className="flex items-center gap-1.5 text-xs text-slate-800 font-extrabold">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span>{publisher}</span>
            </div>

            {/* Price & Formats display */}
            <div className="pt-2 flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-950">
                  ₹{book.buy_price}
                </span>
                {book.list_price > book.buy_price && (
                  <>
                    <span className="text-sm sm:text-base font-bold text-slate-400 line-through">
                      ₹{book.list_price}
                    </span>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                      {Math.round((1 - book.buy_price / book.list_price) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Format selection pills */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-black text-slate-700 uppercase">Formats:</span>
                {hasPdf && (
                  <button
                    onClick={() => setReaderFormat('pdf')}
                    className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 border-2 transition ${
                      readerFormat === 'pdf'
                        ? 'bg-[#1976D2] text-white border-[#1976D2]'
                        : 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                )}
                {hasHtml && (
                  <button
                    onClick={() => setReaderFormat('html')}
                    className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 border-2 transition ${
                      readerFormat === 'html'
                        ? 'bg-[#1976D2] text-white border-[#1976D2]'
                        : 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>HTML / EPUB</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Stack */}
        <div className="space-y-4 pt-2">
          {/* 3 Outlined Buttons Row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* Sample Button */}
            <button
              onClick={() => setIsReaderOpen(true)}
              className="w-full border-2 border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-950 font-black rounded-xl py-3 px-1 text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition shadow-xs active-press"
            >
              <BookOpen className="w-4 h-4 text-slate-800 stroke-[2.5]" />
              <span>Sample</span>
            </button>

            {/* Rent Button */}
            <button
              onClick={() => {
                if (!isUnlocked) {
                  if (onRentBook) onRentBook(book);
                  else onBuyBook(book);
                }
              }}
              disabled={isUnlocked}
              className={`w-full border-2 border-slate-300 font-black rounded-xl py-3 px-1 text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition shadow-xs active-press ${
                isUnlocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-70 border-slate-200' : 'bg-white hover:bg-slate-50 text-slate-950'
              }`}
            >
              <Clock className="w-4 h-4 text-slate-800 stroke-[2.5]" />
              <span>Rent ₹{rentPrice}</span>
            </button>

            {/* Buy Button */}
            <button
              onClick={() => {
                if (isUnlocked) {
                  setIsReaderOpen(true);
                } else {
                  onBuyBook(book);
                }
              }}
              className="w-full border-2 border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-950 font-black rounded-xl py-3 px-1 text-xs sm:text-sm flex flex-col items-center justify-center gap-0.5 transition shadow-xs active-press"
            >
              {isUnlocked ? (
                <>
                  <BookOpen className="w-4 h-4 text-[#1976D2] stroke-[2.5]" />
                  <span className="text-[#1976D2] font-black">Read Now</span>
                </>
              ) : (
                <>
                  <span>Buy ₹{book.buy_price}</span>
                </>
              )}
            </button>
          </div>

          {/* Add to Cart Solid Button */}
          {!isUnlocked && (
            <button
              onClick={() => onBuyBook(book)}
              className="w-full bg-[#1976D2] hover:bg-[#1565C0] text-white font-black rounded-xl py-3.5 px-6 text-sm sm:text-base flex items-center justify-center gap-2 transition shadow-md border-2 border-blue-700 active-press uppercase tracking-wider"
            >
              <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
              <span>Add to Cart — ₹{book.buy_price}</span>
            </button>
          )}

          {/* Icon Actions */}
          <div className="flex items-center justify-center gap-6 py-3 border-y border-slate-100">
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-800 transition group"
              title="Share"
            >
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition">
                <Share2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium">Share</span>
            </button>
            
            <button
              className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-red-500 transition group"
              title="Add to Wishlist"
            >
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-red-50 transition">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </div>
              <span className="text-[10px] font-medium">Wishlist</span>
            </button>

            <button
              className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-[#1976D2] transition group"
              title="Like"
            >
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
              </div>
              <span className="text-[10px] font-medium">Like</span>
            </button>
          </div>
        </div>

        {/* ABOUT THIS E-BOOK Section */}
        <div className="pt-6 space-y-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-[#1976D2] font-extrabold text-sm sm:text-base tracking-wide uppercase">
            <FileText className="w-5 h-5 text-[#1976D2]" />
            <span>ABOUT THIS E-BOOK</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {book.category} {book.title} {mcqCount} chapterwise MCQ bank improves syllabus mastery, concept revision, PYQ practice, solutions, tests, accuracy, speed, strategy, confidence, and focused postgraduate exam readiness.
          </p>

          <div className="space-y-2 pt-1">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              Prepare {book.category} for {book.title}
            </h3>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800">
              Structured Preparation That Stays Relevant
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Serious {book.category} preparation needs more than scattered notes. This question bank gives language graduates, literature learners, translation aspirants, and {book.category} candidates a structured practice resource containing {mcqCount} chapterwise MCQs across grammar and syntax, vocabulary, literary history, comprehension passages, and recent exam trends.
            </p>
          </div>

          {/* Table of Contents / Features List */}
          <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#1976D2]" />
              <span>Chapters & Table of Contents</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                <Check className="w-4 h-4 text-secondary shrink-0" />
                <span>Chapter 1: Foundations & Core Concepts</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                <Check className="w-4 h-4 text-secondary shrink-0" />
                <span>Chapter 2: Grammar, Syntax & Speed Rules</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                <Check className="w-4 h-4 text-secondary shrink-0" />
                <span>Chapter 3: PYQ Chapterwise Solved Papers</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                <Check className="w-4 h-4 text-secondary shrink-0" />
                <span>Chapter 4: Advanced Practice Sets & Solutions</span>
              </div>
            </div>
          </div>

          {/* Specifications Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
            <div className="bg-slate-50 p-3 font-extrabold text-slate-900">
              E-Book Specifications
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-slate-500 font-medium">Publisher</span>
              <span className="font-bold text-slate-900">{publisher}</span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-slate-500 font-medium">Format</span>
              <span className="font-bold text-slate-900">Interactive Digital E-Book</span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-slate-500 font-medium">Device Compatibility</span>
              <span className="font-bold text-slate-900">Android, iOS, Web & Tablet</span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-slate-500 font-medium">Validity</span>
              <span className="font-bold text-slate-900">Lifetime Unlimited Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reader Modal */}
      {isReaderOpen && (
        <BookReaderModal
          book={book}
          isUnlocked={isUnlocked}
          initialFormat={readerFormat}
          onClose={() => setIsReaderOpen(false)}
          onBuy={() => {
            setIsReaderOpen(false);
            onBuyBook(book);
          }}
        />
      )}
    </div>
  );
}
