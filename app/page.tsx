'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, signInWithGoogle, signOutUser } from '@/lib/firebase';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { CategoryChips } from '@/components/CategoryChips';
import { PromoBanner } from '@/components/PromoBanner';
import { ExamsGrid } from '@/components/ExamsGrid';
import { BooksGrid } from '@/components/BooksGrid';
import { BundlesList } from '@/components/BundlesList';
import { ExamDetailModal } from '@/components/ExamDetailModal';
import { ExamDetailsPage } from '@/components/ExamDetailsPage';
import { BookDetailsPage } from '@/components/BookDetailsPage';
import { BookReaderModal } from '@/components/BookReaderModal';
import { TestRunnerModal } from '@/components/TestRunnerModal';
import { LibraryView } from '@/components/LibraryView';
import { CheckoutModal } from '@/components/CheckoutModal';
import { RenewValidityModal } from '@/components/RenewValidityModal';
import { SeedDataDialog } from '@/components/SeedDataDialog';
import { BottomNav } from '@/components/BottomNav';

import { 
  ExamCategory, 
  ExamItem, 
  BookItem, 
  BundleItem, 
  UserEntitlement,
  UserSubscription,
  AccessType,
  TestLink 
} from '@/lib/types';

import { 
  fetchCategories, 
  fetchExams, 
  fetchBooks, 
  fetchBundles, 
  getUserEntitlements,
  getUserSubscription,
  processPurchase 
} from '@/lib/examkart-engine';

export default function HomePage() {
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'library' | 'courses' | 'help'>('home');
  const [activeCategory, setActiveCategory] = useState<string>('SSC');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Auth state
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  // Data states
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [books, setBooks] = useState<BookItem[]>([]);
  const [bundles, setBundles] = useState<BundleItem[]>([]);
  const [entitlements, setEntitlements] = useState<UserEntitlement[]>([]);
  const [userSubscription, setUserSubscriptionState] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Active Modals & Purchase Triggers
  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [selectedTestToRun, setSelectedTestToRun] = useState<{ test: TestLink; examTitle: string } | null>(null);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Checkout and Renewal Modals State
  const [checkoutModalData, setCheckoutModalData] = useState<{
    item: ExamItem | BookItem | BundleItem | null;
    itemType: 'exam' | 'book' | 'bundle' | 'subscription';
    initialAccessType?: AccessType;
  } | null>(null);

  const [renewModalData, setRenewModalData] = useState<{
    item: ExamItem | BookItem | BundleItem | null;
    itemType: 'exam' | 'book' | 'bundle';
    expiredAtDate?: string;
  } | null>(null);

  // Fallback demo user ID if not logged in
  const DEMO_USER_ID = "user_demo_101";
  const activeUserId = authUser?.uid || DEMO_USER_ID;

  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [catList, examList, bookList, bundleList, entList, subState] = await Promise.all([
          fetchCategories(),
          fetchExams(activeCategory),
          fetchBooks(activeCategory),
          fetchBundles(activeCategory),
          getUserEntitlements(activeUserId),
          getUserSubscription(activeUserId)
        ]);

        if (isMounted) {
          setCategories(catList);
          setExams(examList);
          setBooks(bookList);
          setBundles(bundleList);
          setEntitlements(entList);
          setUserSubscriptionState(subState);
        }
      } catch (err) {
        console.warn("Failed to load data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [activeCategory, activeUserId, reloadTrigger]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        showToast(`🎉 Signed in with Google as ${user.displayName || user.email}!`);
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        showToast("Sign-in cancelled.");
      } else {
        showToast("Google sign-in failed. Please try again.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      showToast("Signed out successfully.");
    } catch (err) {
      showToast("Sign-out failed.");
    }
  };

  // Create unlocked ID sets for O(1) checks
  const unlockedExamIds = new Set(
    entitlements
      .filter(e => e.collection === 'exams')
      .map(e => e.item_id)
  );

  const unlockedBookIds = new Set(
    entitlements
      .filter(e => e.collection === 'books')
      .map(e => e.item_id)
  );

  const unlockedBundleIds = new Set<string>();
  // Check if a bundle's items are unlocked
  bundles.forEach(bundle => {
    const allIncludedUnlocked = bundle.included_items.every(inc => {
      if (inc.collection === 'exams') return unlockedExamIds.has(inc.id);
      if (inc.collection === 'books') return unlockedBookIds.has(inc.id);
      return false;
    });
    if (allIncludedUnlocked && bundle.included_items.length > 0) {
      unlockedBundleIds.add(bundle.id);
    }
  });

  // Filter items by Search query if present
  const filterBySearch = <T extends { title: string; tags?: string[]; category: string }>(items: T[]) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.tags?.some(t => t.toLowerCase().includes(q))
    );
  };

  const filteredExams = filterBySearch(exams);
  const filteredBooks = filterBySearch(books);
  const filteredBundles = filterBySearch(bundles);

  // Handle Purchase modal openers
  const handleBuyExam = (exam: ExamItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (unlockedExamIds.has(exam.id)) {
      setSelectedExam(exam);
      return;
    }
    setCheckoutModalData({ item: exam, itemType: 'exam', initialAccessType: 'lifetime' });
  };

  const handleAddBook = (book: BookItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (unlockedBookIds.has(book.id)) {
      setSelectedBook(book);
      return;
    }
    setCheckoutModalData({ item: book, itemType: 'book', initialAccessType: 'lifetime' });
  };

  const handleEnrollBundle = (bundle: BundleItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (unlockedBundleIds.has(bundle.id)) {
      showToast(`You already own all items in ${bundle.title}!`);
      setActiveNavTab('library');
      return;
    }
    setCheckoutModalData({ item: bundle, itemType: 'bundle', initialAccessType: 'lifetime' });
  };

  const handleOpenSubscriptionCheckout = () => {
    setCheckoutModalData({ item: null, itemType: 'subscription', initialAccessType: 'subscription' });
  };

  const handleConfirmPurchase = async (
    item: ExamItem | BookItem | BundleItem | null,
    itemType: 'exam' | 'book' | 'bundle' | 'subscription',
    accessType: AccessType
  ) => {
    setCheckoutModalData(null);
    setRenewModalData(null);

    const res = await processPurchase(activeUserId, item, itemType, accessType);
    if (res.success) {
      showToast(res.message);
      const [updatedEnt, updatedSub] = await Promise.all([
        getUserEntitlements(activeUserId),
        getUserSubscription(activeUserId)
      ]);
      setEntitlements(updatedEnt);
      setUserSubscriptionState(updatedSub);
      setActiveNavTab('library'); // Redirect to Purchased Page to see new item
    }
  };

  const handleOpenRenewModal = (
    item: ExamItem | BookItem | BundleItem,
    itemType: 'exam' | 'book' | 'bundle',
    expiredAtDate?: string
  ) => {
    setRenewModalData({ item, itemType, expiredAtDate });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        userName={authUser?.displayName || (authUser?.isAnonymous ? "Guest User" : null)}
        userEmail={authUser?.email || null}
        userPhoto={authUser?.photoURL || null}
        isGoogleUser={!!authUser && !authUser.isAnonymous}
        isSigningIn={isSigningIn}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        onOpenSeedModal={() => setIsSeedModalOpen(true)}
        unlockedCount={entitlements.length}
      />

      {/* Render Exam Details Page or Book Details Page if selected */}
      {selectedExam ? (
        <ExamDetailsPage
          exam={selectedExam}
          isUnlocked={unlockedExamIds.has(selectedExam.id)}
          onBack={() => setSelectedExam(null)}
          onUnlockExam={(exam) => handleBuyExam(exam, { stopPropagation: () => {} } as any)}
          onStartTest={(test, examTitle) => {
            setSelectedTestToRun({ test, examTitle });
          }}
        />
      ) : selectedBook ? (
        <BookDetailsPage
          book={selectedBook}
          isUnlocked={unlockedBookIds.has(selectedBook.id)}
          onBack={() => setSelectedBook(null)}
          onBuyBook={(book) => handleAddBook(book, { stopPropagation: () => {} } as any)}
          onRentBook={(book) => handleAddBook(book, { stopPropagation: () => {} } as any)}
        />
      ) : (
        <>
          {/* Main Single Scroll Surface Flow */}
          {activeNavTab === 'home' && (
            <main className="max-w-7xl mx-auto space-y-2">
              {/* Search Bar */}
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeCategory={activeCategory}
              />

              {/* Category Chips */}
              <CategoryChips
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
              />

              {/* Promo Offer Banner */}
              <PromoBanner
                onEnrollClick={() => {
                  const cgl = exams.find(e => e.id === 'exam_ssc_cgl_2024') || exams[0];
                  if (cgl) setSelectedExam(cgl);
                }}
              />

              {/* Trending Exams Grid (2x3 mobile, 2x4 tablet, 2x3/2x7 desktop) */}
              <ExamsGrid
                exams={filteredExams}
                unlockedExamIds={unlockedExamIds}
                onExamClick={(exam) => setSelectedExam(exam)}
                onBuyClick={handleBuyExam}
                onViewAllClick={() => setActiveNavTab('courses')}
              />

              {/* Bestselling Books Grid */}
              <BooksGrid
                books={filteredBooks}
                unlockedBookIds={unlockedBookIds}
                onBookClick={(book) => setSelectedBook(book)}
                onAddClick={handleAddBook}
                onViewAllClick={() => setActiveNavTab('courses')}
              />

              {/* Combo Bundles Section */}
              <BundlesList
                bundles={filteredBundles}
                unlockedBundleIds={unlockedBundleIds}
                onBundleClick={(bundle) => {
                  // Open first included exam
                  const firstInc = bundle.included_items?.[0];
                  if (firstInc) {
                    const matchExam = exams.find(e => e.id === firstInc.id);
                    if (matchExam) setSelectedExam(matchExam);
                  }
                }}
                onEnrollClick={handleEnrollBundle}
                onViewAllClick={() => setActiveNavTab('courses')}
              />

              {/* Seed Data Button at the bottom */}
              <div className="px-4 py-8 flex justify-center">
                <button
                  onClick={() => setIsSeedModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors border border-slate-300"
                >
                  Seed Firebase Database
                </button>
              </div>
            </main>
          )}

          {/* Purchased Page / Library View */}
          {activeNavTab === 'library' && (
            <main className="max-w-7xl mx-auto py-2">
              <LibraryView
                entitlements={entitlements}
                userSubscription={userSubscription}
                allExams={exams}
                allBooks={books}
                allBundles={bundles}
                onOpenExam={(exam) => setSelectedExam(exam)}
                onOpenBook={(book) => setSelectedBook(book)}
                onRenewValidity={handleOpenRenewModal}
                onGetSubscription={handleOpenSubscriptionCheckout}
                onExploreMore={() => setActiveNavTab('home')}
              />
            </main>
          )}

          {/* Courses / Catalog View */}
          {activeNavTab === 'courses' && (
            <main className="max-w-7xl mx-auto py-3 space-y-4">
              <div className="px-4">
                <h2 className="text-lg font-bold text-[#1a237e]">Complete Exam & Book Catalog</h2>
                <p className="text-xs text-slate-500">Filter by category chips or search items</p>
              </div>
              <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} activeCategory={activeCategory} />
              <CategoryChips categories={categories} activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
              <ExamsGrid exams={filteredExams} unlockedExamIds={unlockedExamIds} onExamClick={setSelectedExam} onBuyClick={handleBuyExam} />
              <BooksGrid books={filteredBooks} unlockedBookIds={unlockedBookIds} onBookClick={setSelectedBook} onAddClick={handleAddBook} />
            </main>
          )}

          {/* Help / Support View */}
          {activeNavTab === 'help' && (
            <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 bg-[#1a237e] text-white rounded-xl flex items-center justify-center mx-auto text-xl font-bold">
                  ?
                </div>
                <h2 className="text-lg font-bold text-slate-900">ExamKart Help & Support</h2>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Need assistance with your test series, e-book reader, or bundle purchases? Our support team is available 24/7.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <a href="mailto:support@examkart.app" className="w-full sm:w-auto px-4 py-2 bg-[#1a237e] text-white rounded-xl font-bold text-xs">
                    Email Support
                  </a>
                  <button onClick={() => setIsSeedModalOpen(true)} className="w-full sm:w-auto px-4 py-2 bg-amber-100 text-amber-900 rounded-xl font-bold text-xs border border-amber-300">
                    Seed Firebase Firestore
                  </button>
                </div>
              </div>
            </main>
          )}
        </>
      )}

      {/* Modals */}
      {checkoutModalData && (
        <CheckoutModal
          item={checkoutModalData.item}
          itemType={checkoutModalData.itemType}
          initialAccessType={checkoutModalData.initialAccessType}
          onClose={() => setCheckoutModalData(null)}
          onConfirmPurchase={handleConfirmPurchase}
        />
      )}

      {renewModalData && (
        <RenewValidityModal
          item={renewModalData.item}
          itemType={renewModalData.itemType}
          expiredAtDate={renewModalData.expiredAtDate}
          onClose={() => setRenewModalData(null)}
          onRenewConfirm={handleConfirmPurchase}
        />
      )}

      {selectedTestToRun && (
        <TestRunnerModal
          test={selectedTestToRun.test}
          examTitle={selectedTestToRun.examTitle}
          onClose={() => setSelectedTestToRun(null)}
        />
      )}

      <SeedDataDialog
        isOpen={isSeedModalOpen}
        onClose={() => setIsSeedModalOpen(false)}
        onRefreshData={() => setReloadTrigger(prev => prev + 1)}
      />

      {/* Bottom Fixed Navigation Bar */}
      <BottomNav
        activeTab={activeNavTab}
        onSelectTab={(tab) => {
          setSelectedExam(null);
          setSelectedBook(null);
          setActiveNavTab(tab);
        }}
        unlockedCount={entitlements.length}
      />
    </div>
  );
}
