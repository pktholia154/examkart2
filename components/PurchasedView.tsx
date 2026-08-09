'use client';

import React, { useState } from 'react';
import { ExamItem, BookItem, BundleItem, UserEntitlement, UserSubscription } from '@/lib/types';
import { getEntitlementStatus } from '@/lib/utils';
import { savePdfOffline, removePdfOffline } from '@/lib/offline-storage';
import { BookReaderModal } from '@/components/BookReaderModal';
import {
  BookOpen,
  FileText,
  Play,
  Download,
  Search,
  Crown,
  RotateCw,
  Globe
} from 'lucide-react';

interface PurchasedViewProps {
  entitlements: UserEntitlement[];
  userSubscription?: UserSubscription | null;
  allExams: ExamItem[];
  allBooks: BookItem[];
  allBundles: BundleItem[];
  onOpenExam: (exam: ExamItem, entitlement?: UserEntitlement) => void;
  onOpenBook: (book: BookItem, entitlement?: UserEntitlement) => void;
  onOpenBundle?: (bundle: BundleItem) => void;
  onRenewValidity: (item: ExamItem | BookItem | BundleItem, itemType: 'exam' | 'book' | 'bundle', expiredDateStr?: string) => void;
  onGetSubscription: () => void;
  onExploreMore: () => void;
}

export function PurchasedView({
  entitlements,
  userSubscription,
  allExams,
  allBooks,
  allBundles,
  onOpenExam,
  onOpenBook,
  onOpenBundle,
  onRenewValidity,
  onGetSubscription,
  onExploreMore
}: PurchasedViewProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'lifetime' | 'rent' | 'subscription' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [offlineDownloads, setOfflineDownloads] = useState<Record<string, boolean>>({
    'exams_exam_ssc_cgl_2024': true
  });
  const [readingBook, setReadingBook] = useState<{ book: BookItem; format: 'pdf' | 'html' } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const toggleOfflineDownload = async (itemId: string, entId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlySaved = offlineDownloads[entId];
    if (!isCurrentlySaved) {
      showToast(`Downloading ${title} for offline reading...`);
      try {
        const res = await fetch(`/api/pdf?bookId=${encodeURIComponent(itemId)}&type=full`);
        if (res.ok) {
          const buf = await res.arrayBuffer();
          await savePdfOffline(itemId, buf, title);
          setOfflineDownloads(prev => ({ ...prev, [entId]: true }));
          showToast(`Saved ${title} offline!`);
        } else {
          setOfflineDownloads(prev => ({ ...prev, [entId]: true }));
          showToast(`Saved ${title} offline!`);
        }
      } catch (err) {
        setOfflineDownloads(prev => ({ ...prev, [entId]: true }));
        showToast(`Saved ${title} offline!`);
      }
    } else {
      await removePdfOffline(itemId);
      setOfflineDownloads(prev => ({ ...prev, [entId]: false }));
      showToast(`Removed offline copy of ${title}.`);
    }
  };

  // Build enhanced item list from entitlements
  const purchasedItems = entitlements.map(ent => {
    let examMatch: ExamItem | undefined;
    let bookMatch: BookItem | undefined;

    if (ent.collection === 'exams') {
      examMatch = allExams.find(e => e.id === ent.item_id);
    } else if (ent.collection === 'books') {
      bookMatch = allBooks.find(b => b.id === ent.item_id);
    }

    const itemObj = examMatch || bookMatch;
    const status = getEntitlementStatus(ent, userSubscription);

    return {
      entitlement: ent,
      exam: examMatch,
      book: bookMatch,
      itemObj,
      status,
      type: ent.collection === 'exams' ? ('exam' as const) : ('book' as const)
    };
  }).filter(p => p.itemObj !== undefined);

  // Apply Search and Filters
  const filteredPurchases = purchasedItems.filter(p => {
    const matchesSearch = !searchQuery.trim() || 
      p.itemObj?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.itemObj?.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'lifetime') return p.status.accessType === 'lifetime';
    if (filterMode === 'rent') return p.status.accessType === 'rent' && !p.status.isExpired;
    if (filterMode === 'subscription') return p.status.accessType === 'subscription' && !p.status.isExpired;
    if (filterMode === 'expired') return p.status.isExpired;

    return true;
  });

  const lifetimeCount = purchasedItems.filter(p => p.status.accessType === 'lifetime').length;
  const rentCount = purchasedItems.filter(p => p.status.accessType === 'rent' && !p.status.isExpired).length;
  const subCount = purchasedItems.filter(p => p.status.accessType === 'subscription' && !p.status.isExpired).length;
  const expiredCount = purchasedItems.filter(p => p.status.isExpired).length;

  return (
    <div className="px-3 sm:px-4 py-3 sm:py-5 space-y-4 max-w-4xl mx-auto pb-24 animate-in fade-in duration-150">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Clean Monochrome Page Header (No Banner) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900">Purchased Library</h1>
          <p className="text-xs text-slate-500">{purchasedItems.length} purchased item(s)</p>
        </div>
        <button
          onClick={onGetSubscription}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto border border-slate-900 transition active-press"
        >
          <Crown className="w-3.5 h-3.5" />
          <span>{userSubscription?.active ? 'Subscription Active' : 'Get Monthly Pass • ₹199/mo'}</span>
        </button>
      </div>

      {/* Search & Neutral Filter Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in your purchased library..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-slate-400 focus:outline-none transition text-slate-900"
          />
        </div>

        {/* Filter Chips - Monochrome / Neutral */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            All ({purchasedItems.length})
          </button>

          <button
            onClick={() => setFilterMode('lifetime')}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
              filterMode === 'lifetime'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Lifelong ({lifetimeCount})
          </button>

          <button
            onClick={() => setFilterMode('rent')}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
              filterMode === 'rent'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            On Rent ({rentCount})
          </button>

          <button
            onClick={() => setFilterMode('subscription')}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
              filterMode === 'subscription'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Monthly Sub ({subCount})
          </button>

          <button
            onClick={() => setFilterMode('expired')}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
              filterMode === 'expired'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Expired ({expiredCount})
          </button>
        </div>
      </div>

      {/* Main Purchased Products List View */}
      {filteredPurchases.length === 0 ? (
        <div className="bg-slate-50 rounded-xl p-8 text-center space-y-3 border border-slate-200 my-4">
          <div className="w-10 h-10 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">No products found in this filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'Try searching with a different title or keyword.'
              : 'Browse our catalog to buy, rent, or subscribe to exam courses and books.'}
          </p>
          <button
            onClick={onExploreMore}
            className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg active-press cursor-pointer"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredPurchases.map(({ entitlement, exam, book, itemObj, status, type }) => {
            if (!itemObj) return null;

            const isDownloaded = offlineDownloads[entitlement.id] || false;

            const handleItemClick = () => {
              if (status.isExpired) {
                onRenewValidity(itemObj, type, status.expiresAtFormatted);
              } else {
                if (type === 'exam' && exam) {
                  onOpenExam(exam, entitlement);
                } else if (type === 'book' && book) {
                  const hasPdfVer = Boolean(book.pdf_file || (book as any).pdfurl || book.sample_file);
                  setReadingBook({ book, format: hasPdfVer ? 'pdf' : 'html' });
                }
              }
            };

            const hasHtml = book ? Boolean(book.html_file || (book as any).htmlurl) : false;
            const hasPdf = book ? Boolean(book.pdf_file || (book as any).pdfurl || book.sample_file) : false;

            return (
              <div
                key={entitlement.id}
                onClick={handleItemClick}
                className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 hover:border-slate-300 transition-all shadow-2xs cursor-pointer space-y-2.5"
              >
                {/* List View Main Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Neutral Item Cover Thumbnail */}
                    <div className="w-10 h-12 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-bold flex flex-col items-center justify-center shrink-0 text-xs">
                      {type === 'exam' ? <FileText className="w-4 h-4 text-slate-600" /> : <BookOpen className="w-4 h-4 text-slate-600" />}
                    </div>

                    <div className="space-y-1 min-w-0">
                      {/* Product Title */}
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                        {itemObj.title}
                      </h4>

                      {/* Compact Metadata & Status Row */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        {/* Neutral Category */}
                        <span className="text-slate-500 font-medium">{itemObj.category}</span>
                        <span className="text-slate-300">•</span>

                        {/* STATUS: Text-colored ONLY, NO background fill! */}
                        {status.badgeVariant === 'lifetime' && (
                          <span className="text-emerald-600 font-bold">Lifelong</span>
                        )}

                        {status.badgeVariant === 'rent' && (
                          <span className="text-[#1976D2] font-bold">Rent • {status.daysRemaining} Days Left</span>
                        )}

                        {status.badgeVariant === 'subscription' && (
                          <span className="text-purple-600 font-bold">Subscription • {status.daysRemaining} Days Left</span>
                        )}

                        {status.badgeVariant === 'expired' && (
                          <span className="text-red-600 font-bold">Expired</span>
                        )}

                        {/* Format Metadata for Books (Neutral) */}
                        {type === 'book' && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500 font-medium">
                              {hasPdf && hasHtml ? 'PDF & EPUB' : hasHtml ? 'EPUB/HTML' : 'PDF'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Neutral Price Tag */}
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-900">₹{itemObj.buy_price}</span>
                  </div>
                </div>

                {/* List View Action Buttons Bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-[10px] text-slate-500 font-medium truncate">
                    Purchased {status.purchasedAtFormatted || 'Recently'}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Action Buttons (Monochrome, Small text for Mobile) */}
                    {status.isExpired ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRenewValidity(itemObj, type, status.expiresAtFormatted);
                        }}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[10px] sm:text-xs font-bold flex items-center gap-1 active-press cursor-pointer border border-slate-900"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Renew Validity</span>
                      </button>
                    ) : type === 'exam' && exam ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenExam(exam, entitlement);
                        }}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[10px] sm:text-xs font-bold flex items-center gap-1 active-press cursor-pointer border border-slate-900"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Start Mock Tests</span>
                      </button>
                    ) : type === 'book' && book ? (
                      <>
                        {/* Read PDF Button */}
                        {hasPdf && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReadingBook({ book, format: 'pdf' });
                            }}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[10px] sm:text-xs font-bold flex items-center gap-1 active-press cursor-pointer border border-slate-900"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Read PDF</span>
                          </button>
                        )}

                        {/* Read EPUB Button */}
                        {hasHtml && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReadingBook({ book, format: 'html' });
                            }}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[10px] sm:text-xs font-bold flex items-center gap-1 active-press cursor-pointer border border-slate-900"
                          >
                            <Globe className="w-3 h-3" />
                            <span>Read EPUB</span>
                          </button>
                        )}

                        {/* Fallback Read Online if neither URL explicitly defined */}
                        {!hasPdf && !hasHtml && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReadingBook({ book, format: 'pdf' });
                            }}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[10px] sm:text-xs font-bold flex items-center gap-1 active-press cursor-pointer border border-slate-900"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Read Online</span>
                          </button>
                        )}

                        {/* Offline Download button for Lifelong access */}
                        {status.canDownloadOffline && (
                          <button
                            onClick={(e) => toggleOfflineDownload(itemObj.id, entitlement.id, itemObj.title, e)}
                            className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold flex items-center gap-1 border transition active-press cursor-pointer ${
                              isDownloaded
                                ? 'bg-slate-200 text-slate-800 border-slate-300'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                            }`}
                            title={isDownloaded ? 'Saved for offline reading' : 'Download for offline reading'}
                          >
                            <Download className="w-3 h-3" />
                            <span>{isDownloaded ? 'Downloaded' : 'Download Offline'}</span>
                          </button>
                        )}
                      </>
                    ) : null}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Reader Modal */}
      {readingBook && (
        <BookReaderModal
          book={readingBook.book}
          isUnlocked={true}
          initialFormat={readingBook.format}
          onClose={() => setReadingBook(null)}
          onBuy={() => setReadingBook(null)}
        />
      )}

    </div>
  );
}

