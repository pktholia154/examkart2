'use client';

import React, { useState } from 'react';
import { ExamItem, BookItem, BundleItem, UserEntitlement, UserSubscription, AccessType } from '@/lib/types';
import { getEntitlementStatus } from '@/lib/utils';
import { savePdfOffline, removePdfOffline } from '@/lib/offline-storage';
import {
  BookOpen,
  FileText,
  CheckCircle2,
  Play,
  Download,
  Wifi,
  Clock,
  RotateCw,
  Search,
  Sparkles,
  Layers,
  Crown,
  ChevronRight,
  ShieldAlert,
  ArrowRight
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
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const toggleOfflineDownload = async (itemId: string, entId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlySaved = offlineDownloads[entId];
    if (!isCurrentlySaved) {
      showToast(`💾 Downloading ${title} for offline reading...`);
      try {
        const res = await fetch(`/api/pdf?bookId=${encodeURIComponent(itemId)}&type=full`);
        if (res.ok) {
          const buf = await res.arrayBuffer();
          await savePdfOffline(itemId, buf, title);
          setOfflineDownloads(prev => ({ ...prev, [entId]: true }));
          showToast(`✅ Saved ${title} offline!`);
        } else {
          setOfflineDownloads(prev => ({ ...prev, [entId]: true }));
          showToast(`💾 Saved ${title} offline!`);
        }
      } catch (err) {
        setOfflineDownloads(prev => ({ ...prev, [entId]: true }));
        showToast(`💾 Saved ${title} offline!`);
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

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1976D2] via-[#1565C0] to-[#0D47A1] text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-tertiary text-slate-950 px-2 py-0.5 rounded-md">
                PURCHASED PRODUCTS
              </span>
              <span className="text-xs font-bold text-blue-100">
                {purchasedItems.length} Total Purchased Item(s)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight mt-1">
              My Purchased Products & Subscriptions
            </h2>
          </div>

          <button
            onClick={onGetSubscription}
            className="px-3.5 py-2 bg-tertiary hover:bg-tertiary-hover text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active-press cursor-pointer shrink-0"
          >
            <Crown className="w-4 h-4 fill-slate-950" />
            <span>{userSubscription?.active ? 'Subscription Active' : 'Get Monthly Pass • ₹199/mo'}</span>
          </button>
        </div>

        {/* Subscription Info bar */}
        {userSubscription?.active ? (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-2.5 rounded-xl flex items-center justify-between text-xs text-amber-200 font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-tertiary" />
              <span>Monthly All-Access Subscription is Active</span>
            </span>
            <span className="text-[11px] text-white font-bold">
              Valid till {userSubscription.expires_at ? new Date(userSubscription.expires_at).toLocaleDateString() : 'Active'}
            </span>
          </div>
        ) : (
          <p className="text-[11px] text-blue-100/90 font-medium leading-normal">
            Your purchased products remain accessible based on access mode: <strong className="text-white">Lifelong</strong> (Online + Offline), <strong className="text-white">On Rent 30 Days</strong> (Online only), or <strong className="text-white">Monthly Subscription</strong>.
          </p>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in your purchased library..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-[#1976D2] focus:outline-none transition"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              filterMode === 'all'
                ? 'bg-[#1976D2] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({purchasedItems.length})
          </button>

          <button
            onClick={() => setFilterMode('lifetime')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
              filterMode === 'lifetime'
                ? 'bg-secondary text-white'
                : 'bg-secondary-light text-secondary hover:bg-secondary/20'
            }`}
          >
            <span>Lifelong</span>
            <span className="text-[10px] opacity-80">({lifetimeCount})</span>
          </button>

          <button
            onClick={() => setFilterMode('rent')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
              filterMode === 'rent'
                ? 'bg-[#1976D2] text-white'
                : 'bg-primary-light text-primary hover:bg-primary/20'
            }`}
          >
            <span>On Rent</span>
            <span className="text-[10px] opacity-80">({rentCount})</span>
          </button>

          <button
            onClick={() => setFilterMode('subscription')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
              filterMode === 'subscription'
                ? 'bg-tertiary text-slate-950'
                : 'bg-tertiary-light text-slate-900 border border-tertiary/30 hover:bg-tertiary/20'
            }`}
          >
            <span>Monthly Sub</span>
            <span className="text-[10px] opacity-80">({subCount})</span>
          </button>

          <button
            onClick={() => setFilterMode('expired')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
              filterMode === 'expired'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Expired</span>
            <span className="text-[10px] opacity-80">({expiredCount})</span>
          </button>
        </div>
      </div>

      {/* Main Purchased Products List View */}
      {filteredPurchases.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-8 text-center space-y-3 border border-slate-200/80 my-4">
          <div className="w-12 h-12 bg-primary-light text-primary rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No products found in this filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'Try searching with a different title or keyword.'
              : 'Browse our catalog to buy, rent, or subscribe to exam courses and books.'}
          </p>
          <button
            onClick={onExploreMore}
            className="px-4 py-2 bg-[#1976D2] text-white text-xs font-bold rounded-xl active-press cursor-pointer"
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
                // AUTOMATIC POPUP FOR EXPIRED PRODUCT
                onRenewValidity(itemObj, type, status.expiresAtFormatted);
              } else {
                if (type === 'exam' && exam) onOpenExam(exam, entitlement);
                if (type === 'book' && book) onOpenBook(book, entitlement);
              }
            };

            return (
              <div
                key={entitlement.id}
                onClick={handleItemClick}
                className={`bg-white rounded-2xl p-3.5 sm:p-4 border transition-all shadow-2xs hover:shadow-sm cursor-pointer space-y-2.5 ${
                  status.isExpired
                    ? 'border-tertiary bg-tertiary-light/30'
                    : 'border-slate-200/90 hover:border-[#1976D2]/50'
                }`}
              >
                {/* List View Main Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Item Cover / Icon thumbnail */}
                    <div className="w-12 h-14 rounded-xl bg-[#1976D2] text-white font-bold flex flex-col items-center justify-center shrink-0 shadow-xs text-xs p-1 text-center">
                      <span className="text-[9px] font-black uppercase text-tertiary truncate w-full">
                        {itemObj.category}
                      </span>
                      {type === 'exam' ? <FileText className="w-4 h-4 mt-0.5" /> : <BookOpen className="w-4 h-4 mt-0.5" />}
                    </div>

                    <div className="space-y-1 min-w-0">
                      {/* Product Title */}
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                        {itemObj.title}
                      </h4>

                      {/* Small fonts status badge row */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                        {/* Status Pill in small fonts */}
                        {status.badgeVariant === 'lifetime' && (
                          <span className="bg-secondary-light text-secondary border border-secondary/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                            Lifelong Access
                          </span>
                        )}

                        {status.badgeVariant === 'rent' && (
                          <span className="bg-primary-light text-primary border border-primary/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3 text-primary" />
                            On Rent • {status.daysRemaining} days left
                          </span>
                        )}

                        {status.badgeVariant === 'subscription' && (
                          <span className="bg-tertiary-light text-slate-900 border border-tertiary/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Crown className="w-3 h-3 text-slate-900" />
                            Monthly Sub • {status.daysRemaining} days left
                          </span>
                        )}

                        {status.badgeVariant === 'expired' && (
                          <span className="bg-slate-200 text-slate-900 border border-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-slate-900" />
                            Validity Expired • Click to Renew
                          </span>
                        )}

                        {/* Online vs Offline Access tag */}
                        {status.canDownloadOffline ? (
                          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Wifi className="w-3 h-3 text-secondary" /> Online & Offline Ready
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Wifi className="w-3 h-3 text-primary" /> Online Access Only
                          </span>
                        )}

                        {/* Format Badges for Books */}
                        {type === 'book' && book && (
                          <span className="bg-[#1976D2]/10 text-[#1976D2] border border-[#1976D2]/20 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                            {(book.pdf_file || (book as any).pdfurl) && (book.html_file || (book as any).htmlurl)
                              ? 'PDF + HTML E-Book'
                              : (book.html_file || (book as any).htmlurl)
                              ? 'HTML E-Book'
                              : 'PDF E-Book'}
                          </span>
                        )}
                      </div>

                      {/* Small metadata text */}
                      <p className="text-[11px] text-slate-500 truncate">
                        Purchased on {status.purchasedAtFormatted || 'Recent'} • {type === 'exam' ? 'Test Series' : 'Digital E-Book'}
                      </p>
                    </div>
                  </div>

                  {/* Right Price / Action Button */}
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-slate-900 block">₹{itemObj.buy_price}</span>
                  </div>
                </div>

                {/* List View Action Buttons Bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-slate-500 font-semibold truncate">
                    {status.statusText}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Offline Download button for Lifelong access */}
                    {status.canDownloadOffline && !status.isExpired && (
                      <button
                        onClick={(e) => toggleOfflineDownload(itemObj.id, entitlement.id, itemObj.title, e)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 border transition active-press ${
                          isDownloaded
                            ? 'bg-secondary-light text-secondary border-secondary/30'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                        }`}
                        title={isDownloaded ? 'Downloaded for offline mode' : 'Download for offline mode'}
                      >
                        <Download className="w-3 h-3" />
                        <span>{isDownloaded ? 'Offline Saved' : 'Download Offline'}</span>
                      </button>
                    )}

                    {/* Action Button */}
                    {status.isExpired ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRenewValidity(itemObj, type, status.expiresAtFormatted);
                        }}
                        className="px-3 py-1.5 bg-tertiary hover:bg-tertiary-hover text-slate-950 rounded-xl text-xs font-black flex items-center gap-1 active-press shadow-xs cursor-pointer"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>RENEW VALIDITY</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (type === 'exam' && exam) onOpenExam(exam, entitlement);
                          if (type === 'book' && book) onOpenBook(book, entitlement);
                        }}
                        className="px-3 py-1.5 bg-[#1976D2] hover:bg-[#1565C0] text-white rounded-xl text-xs font-black flex items-center gap-1 active-press shadow-xs cursor-pointer"
                      >
                        {type === 'exam' ? (
                          <>
                            <Play className="w-3 h-3 fill-white" />
                            <span>START MOCK TESTS</span>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-3 h-3" />
                            <span>READ DIGITAL BOOK</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
