'use client';

import React, { useState, useMemo } from 'react';
import { BookItem } from '@/lib/types';
import { INITIAL_BOOKS } from '@/lib/seed-data';
import {
  ArrowLeft,
  ChevronRight,
  BookOpen,
  ShoppingCart,
  Clock,
  Heart,
  Share2,
  FileText,
  CheckCircle2,
  Building2,
  Check,
  Sparkles,
  Layers,
  Globe
} from 'lucide-react';
import { BookReaderModal } from '@/components/BookReaderModal';
import { BookCover } from '@/components/BookCover';

interface BookDetailsPageProps {
  book: BookItem;
  isUnlocked: boolean;
  onBack: () => void;
  onBuyBook: (book: BookItem) => void;
  onRentBook?: (book: BookItem) => void;
  allBooks?: BookItem[];
  onSelectBook?: (book: BookItem) => void;
}

export function BookDetailsPage({
  book,
  isUnlocked,
  onBack,
  onBuyBook,
  onRentBook,
  allBooks,
  onSelectBook
}: BookDetailsPageProps) {
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [readerFormat, setReaderFormat] = useState<'pdf' | 'html'>('pdf');

  const publisher = book.publisher || 'ExamKart Publications';
  const rentPrice = book.rent_price || Math.round(book.buy_price * 0.16) || 39;
  const buyPrice = book.buy_price || 240;
  const listPrice = book.list_price || Math.round(buyPrice * 1.25) || 300;
  const discountPercent = Math.round((1 - buyPrice / listPrice) * 100) || 20;
  const mcqCount = book.mcq_count || '2400+';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('E-Book link copied to clipboard!');
    } else {
      showToast('E-Book link generated!');
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    showToast(!isWishlisted ? 'Added to your Wishlist!' : 'Removed from Wishlist');
  };

  // Get similar books (excluding current book)
  const similarBooks = useMemo(() => {
    const list = allBooks && allBooks.length > 0 ? allBooks : INITIAL_BOOKS;
    const sameCategory = list.filter(
      (b) => b.id !== book.id && b.category.toLowerCase() === book.category.toLowerCase()
    );
    const otherBooks = list.filter(
      (b) => b.id !== book.id && b.category.toLowerCase() !== book.category.toLowerCase()
    );
    return [...sameCategory, ...otherBooks].slice(0, 5);
  }, [allBooks, book]);

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
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center justify-center shrink-0 cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-extrabold text-slate-900 truncate">
              {book.category}
            </h2>
          </div>

          {/* Top Right Action Icons: Wishlist & Share */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={toggleWishlist}
              className={`p-2 rounded-full border transition flex items-center justify-center cursor-pointer ${
                isWishlisted
                  ? 'bg-red-50 text-red-500 border-red-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition flex items-center justify-center cursor-pointer"
              title="Share E-Book"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4 space-y-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-500 font-medium overflow-x-auto no-scrollbar">
          <button onClick={onBack} className="hover:text-slate-900 transition">
            Home
          </button>
          <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
          <span className="hover:text-slate-900 cursor-pointer">Books</span>
          <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
          <span className="text-[#28811f] font-semibold truncate">{book.category}</span>
        </nav>

        {/* 1. Main Book Details Header (Matching reference image) */}
        <div className="flex items-start gap-3 sm:gap-4 pt-1">
          {/* Left Book Cover Thumbnail */}
          <BookCover
            title={book.title}
            category={book.category}
            code={(book as any).code || (book as any).abbrev}
            className="w-16 sm:w-20 shrink-0"
          />

          {/* Right Info Section */}
          <div className="flex-1 min-w-0 space-y-1">
            {/* Title (Max two rows) */}
            <h1 className="text-base sm:text-lg font-bold text-slate-950 leading-tight line-clamp-2">
              {book.title}
            </h1>

            {/* Category in green text */}
            <div className="text-xs sm:text-sm font-bold text-[#28811f]">
              {book.category || 'Banking'}
            </div>

            {/* Price & Discount Row: ₹240  300  20% off */}
            <div className="flex items-baseline gap-2 flex-wrap pt-0.5">
              <span className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-none">
                ₹{buyPrice}
              </span>
              {listPrice > buyPrice && (
                <span className="text-xs sm:text-sm text-slate-400 line-through font-normal leading-none">
                  {listPrice}
                </span>
              )}
              <span className="text-xs sm:text-sm font-bold text-[#28811f] leading-none">
                {discountPercent}% off
              </span>
            </div>

            {/* Formats Badges (PDF & EPUB with blue checkmarks) */}
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                <span className="w-3.5 h-3.5 rounded-full bg-[#2563eb] text-white flex items-center justify-center shrink-0">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                pdf
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                <span className="w-3.5 h-3.5 rounded-full bg-[#2563eb] text-white flex items-center justify-center shrink-0">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                epub
              </span>
            </div>
          </div>
        </div>

        {/* 2. Four Action Cards Grid (2x2) Matching Reference Image */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 pt-2">
          {/* Card 1 (Top Left): Read Sample now -> Sample */}
          <button
            onClick={() => setIsReaderOpen(true)}
            className="bg-gradient-to-br from-blue-100/90 via-blue-50 to-blue-200/40 border border-blue-200/90 rounded-xl p-2.5 sm:p-3 flex items-center justify-between text-left transition hover:shadow-2xs active-press cursor-pointer"
          >
            <div className="space-y-0.5">
              <span className="block text-[10px] sm:text-xs font-semibold text-slate-700 leading-tight">
                Read Sample now
              </span>
              <span className="block text-xs sm:text-sm font-black text-slate-900 leading-tight">
                Sample
              </span>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-green-100/80 border border-green-200/80 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-[#28811f]" />
            </div>
          </button>

          {/* Card 2 (Top Right): buy now -> ₹240.00 -> lifelong access */}
          <button
            onClick={() => {
              if (isUnlocked) setIsReaderOpen(true);
              else onBuyBook(book);
            }}
            className="bg-gradient-to-br from-amber-100/90 via-orange-50 to-amber-200/40 border border-amber-200/90 rounded-xl p-2.5 sm:p-3 flex items-center justify-between text-left transition hover:shadow-2xs active-press cursor-pointer"
          >
            <div className="space-y-0.5 min-w-0">
              <span className="block text-[10px] sm:text-xs font-semibold text-slate-700 leading-tight">
                buy now
              </span>
              <span className="block text-xs sm:text-sm font-black text-slate-900 leading-tight">
                ₹{buyPrice}.00
              </span>
              <span className="block text-[9px] sm:text-[10px] font-normal text-slate-500 truncate leading-tight">
                lifelong access & Offline read
              </span>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-100/80 border border-orange-200/80 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4 text-orange-500" />
            </div>
          </button>

          {/* Card 3 (Bottom Left): get on rent -> ₹39.00 -> validity 30 Days */}
          <button
            onClick={() => {
              if (!isUnlocked) {
                if (onRentBook) onRentBook(book);
                else onBuyBook(book);
              }
            }}
            disabled={isUnlocked}
            className={`border border-slate-300 rounded-xl p-2.5 sm:p-3 flex items-center justify-between text-left transition active-press cursor-pointer ${
              isUnlocked
                ? 'bg-slate-50 opacity-60 cursor-not-allowed'
                : 'bg-white hover:border-orange-300 hover:shadow-2xs'
            }`}
          >
            <div className="space-y-0.5 min-w-0">
              <span className="block text-[10px] sm:text-xs font-semibold text-slate-700 leading-tight">
                get on rent
              </span>
              <span className="block text-xs sm:text-sm font-black text-slate-900 leading-tight">
                ₹{rentPrice}.00
              </span>
              <span className="block text-[9px] sm:text-[10px] font-normal text-slate-500 truncate leading-tight">
                validity 30 Days (Monthly)
              </span>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-50 border border-orange-200/60 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-orange-500" />
            </div>
          </button>

          {/* Card 4 (Bottom Right): Add to Cart -> ₹240.00 -> Add & Buy multiple books */}
          <button
            onClick={() => onBuyBook(book)}
            className="bg-white border border-slate-300 hover:border-orange-300 rounded-xl p-2.5 sm:p-3 flex items-center justify-between text-left transition hover:shadow-2xs active-press cursor-pointer"
          >
            <div className="space-y-0.5 min-w-0">
              <span className="block text-[10px] sm:text-xs font-semibold text-slate-700 leading-tight">
                Add to Cart
              </span>
              <span className="block text-xs sm:text-sm font-black text-slate-900 leading-tight">
                ₹{buyPrice}.00
              </span>
              <span className="block text-[9px] sm:text-[10px] font-normal text-slate-500 truncate leading-tight">
                Add & Buy multiple books
              </span>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-50 border border-orange-200/60 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4 text-orange-500" />
            </div>
          </button>
        </div>

        {/* 3. SEO Book Description */}
        <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed pt-1">
          {book.seo_description ||
            `SEO book description here SEO book description here SEO book description here SEO book description here`}
        </p>

        {/* 4. About book Section */}
        <div className="space-y-2 pt-3 border-t border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
            About book
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Detailed book description here Detailed book description here Detailed book description here Detailed book description here Detailed book description here. {book.category} {book.title} {mcqCount} chapterwise MCQ bank improves syllabus mastery, concept revision, PYQ practice, solutions, tests, accuracy, speed, strategy, confidence, and focused competitive exam readiness. Serious candidates need more than scattered notes. This question bank gives language graduates, literature learners, translation aspirants, and competitive exam candidates a structured practice resource containing chapterwise practice sets across core syntax, vocabulary, domain knowledge, and recent exam trends.
          </p>
        </div>

        {/* 5. Chapters & Table of Contents Card */}
        <div className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 space-y-2.5">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#28811f]" />
            <span>Chapters & Table of Contents</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
              <Check className="w-4 h-4 text-[#28811f] shrink-0" />
              <span>Chapter 1: Foundations & Core Concepts</span>
            </div>
            <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
              <Check className="w-4 h-4 text-[#28811f] shrink-0" />
              <span>Chapter 2: Syntax, Rules & Shortcuts</span>
            </div>
            <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
              <Check className="w-4 h-4 text-[#28811f] shrink-0" />
              <span>Chapter 3: PYQ Solved Archives</span>
            </div>
            <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
              <Check className="w-4 h-4 text-[#28811f] shrink-0" />
              <span>Chapter 4: Advanced Practice Sets & Solutions</span>
            </div>
          </div>
        </div>

        {/* 6. Specifications Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
          <div className="bg-slate-50 p-3 font-bold text-slate-900">
            E-Book Specifications
          </div>
          <div className="p-3 flex justify-between">
            <span className="text-slate-500 font-medium">Publisher</span>
            <span className="font-bold text-slate-900">{publisher}</span>
          </div>
          <div className="p-3 flex justify-between">
            <span className="text-slate-500 font-medium">Format</span>
            <span className="font-bold text-slate-900">Interactive Digital E-Book (PDF & EPUB)</span>
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

        {/* 7. Similar Books Section (At least 4 or 5 similar books) */}
        {similarBooks.length > 0 && (
          <div className="pt-6 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
                  Similar Books
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  Handcrafted prep material & solved archives
                </p>
              </div>
            </div>

            {/* Grid of similar books */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              {similarBooks.map((simBook) => {
                const simBuyPrice = simBook.buy_price || 240;
                const simListPrice = simBook.list_price || Math.round(simBuyPrice * 1.25) || 300;
                const simDiscount = Math.round((1 - simBuyPrice / simListPrice) * 100);

                return (
                  <div
                    key={simBook.id}
                    onClick={() => {
                      if (onSelectBook) onSelectBook(simBook);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group bg-white rounded-xl sm:rounded-2xl border border-slate-300 p-2 sm:p-3 flex flex-col justify-between hover:border-[#28811f] hover:shadow-md transition-all cursor-pointer relative"
                  >
                    <div>
                      {/* Top Row: Thumbnail + Details */}
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <BookCover
                          title={simBook.title}
                          category={simBook.category}
                          code={(simBook as any).code || (simBook as any).abbrev}
                          className="w-12 sm:w-14"
                        />

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="text-xs sm:text-[13px] font-bold text-[#28811f] leading-tight truncate">
                            {simBook.category || 'Banking'}
                          </div>

                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-base sm:text-lg font-black text-slate-950 tracking-tight leading-none">
                              ₹{simBuyPrice}
                            </span>
                            {simListPrice > simBuyPrice && (
                              <span className="text-[11px] text-slate-400 line-through font-normal leading-none">
                                {simListPrice}
                              </span>
                            )}
                            <span className="text-[11px] font-bold text-[#28811f] leading-none">
                              {simDiscount}% off
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700">
                              <span className="w-3.5 h-3.5 rounded-full bg-[#2563eb] text-white flex items-center justify-center shrink-0">
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                              pdf
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700">
                              <span className="w-3.5 h-3.5 rounded-full bg-[#2563eb] text-white flex items-center justify-center shrink-0">
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                              epub
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Title & SEO description */}
                      <div className="mt-2.5">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight line-clamp-2 group-hover:text-[#28811f] transition-colors">
                          {simBook.title}
                        </h3>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 font-normal leading-snug mt-1 line-clamp-1">
                          {simBook.seo_description || simBook.subtitle || 'Seo description here in just 1 row'}
                        </p>
                      </div>
                    </div>

                    <div className="w-2/3 h-1 bg-slate-900 rounded-full mx-auto mt-2 opacity-90" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
