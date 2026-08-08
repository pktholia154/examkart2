"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  X,
  AlertCircle,
  ShoppingCart,
  List,
  Bookmark,
  Sun,
  Moon,
  BookOpen,
  FileText,
  Search,
  ChevronRight,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { fetchFirestoreBookBySlugOrId } from "@/lib/books-store";

interface HTMLReaderProps {
  bookId?: string;
  initialUrl?: string;
  readType?: "sample" | "full" | "offline";
  title?: string;
  hasPdfVersion?: boolean;
  onClose?: () => void;
  onBuy?: () => void;
  onSwitchToPdf?: () => void;
}

interface TocItem {
  id: string;
  title: string;
}

type ReaderTheme = "light" | "sepia" | "dark";

export default function HTMLReader({
  bookId: propBookId,
  initialUrl: propInitialUrl,
  readType: propReadType,
  title: propTitle,
  hasPdfVersion = false,
  onClose,
  onBuy,
  onSwitchToPdf
}: HTMLReaderProps = {}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Resolve book ID
  const bookIdParam = propBookId || params?.bookId;
  const rawBookId = Array.isArray(bookIdParam) ? bookIdParam[0] : bookIdParam;
  const decodedBookId = rawBookId ? decodeURIComponent(rawBookId) : "";

  // Resolve read type
  const urlReadType = searchParams?.get("type") || searchParams?.get("mode");
  const readType = propReadType || urlReadType || "full";

  // State
  const [bookTitle, setBookTitle] = useState<string>(propTitle || "ExamKart Interactive E-Book");
  const [bookBuyPrice, setBookBuyPrice] = useState<number | null>(null);
  const [rawHtml, setRawHtml] = useState<string>("");
  const [tocList, setTocList] = useState<TocItem[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Controls
  const [fontSize, setFontSize] = useState<number>(16); // 12px to 28px
  const [theme, setTheme] = useState<ReaderTheme>("light");
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const scrollViewRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch HTML content
  useEffect(() => {
    let active = true;

    async function loadHtmlContent() {
      setIsLoading(true);
      setHasError(false);

      let firestoreTitle = "";
      let firestoreBuyPrice: number | null = null;
      let targetHtmlUrl = propInitialUrl || "";

      if (decodedBookId) {
        try {
          const bookData = await fetchFirestoreBookBySlugOrId(decodedBookId);
          if (active && bookData) {
            if (bookData.title) firestoreTitle = bookData.title;
            if (bookData.buy_price) firestoreBuyPrice = bookData.buy_price;
            if (!targetHtmlUrl) {
              targetHtmlUrl = (bookData as any).htmlurl || bookData.html_file || "";
            }
          }
        } catch (err) {
          console.warn("Error fetching book for HTML reader:", err);
        }
      }

      if (active) {
        if (firestoreTitle) setBookTitle(firestoreTitle);
        if (firestoreBuyPrice) setBookBuyPrice(firestoreBuyPrice);
      }

      const fetchEndpoint = `/app/api/html?bookId=${encodeURIComponent(decodedBookId)}&type=${readType}&url=${encodeURIComponent(targetHtmlUrl)}`;

      try {
        const response = await fetch(fetchEndpoint);
        if (!response.ok) throw new Error("Failed to fetch HTML e-book content");
        const htmlText = await response.text();

        if (!active) return;

        // Parse HTML string to inject generated IDs to <h1> tags if missing
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");

        // Extract body or entire container
        const bodyEl = doc.body || doc.documentElement;
        const h1Elements = Array.from(bodyEl.querySelectorAll("h1"));

        const extractedToc: TocItem[] = h1Elements.map((h1, index) => {
          let headingId = h1.getAttribute("id");
          if (!headingId) {
            headingId = `toc-heading-${index + 1}`;
            h1.setAttribute("id", headingId);
          }
          const cleanTitle = h1.textContent?.trim() || `Chapter ${index + 1}`;
          return { id: headingId, title: cleanTitle };
        });

        setTocList(extractedToc);
        if (extractedToc.length > 0) {
          setActiveChapterId(extractedToc[0].id);
        }

        setRawHtml(bodyEl.innerHTML);
        setIsLoading(false);
      } catch (err) {
        console.error("HTML Reader loading error:", err);
        if (active) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    }

    loadHtmlContent();

    return () => {
      active = false;
    };
  }, [decodedBookId, readType, propInitialUrl]);

  // 2. Track Scroll Progress and Active Chapter Heading
  const handleScroll = useCallback(() => {
    const el = scrollViewRef.current;
    if (!el) return;

    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight - el.clientHeight;
    if (scrollHeight > 0) {
      const pct = Math.min(Math.max((scrollTop / scrollHeight) * 100, 0), 100);
      setScrollProgress(Math.round(pct));
    }

    // Identify active h1 in view
    if (tocList.length > 0 && contentRef.current) {
      const containerTop = el.getBoundingClientRect().top;
      let currentActiveId = tocList[0].id;

      for (const item of tocList) {
        const targetEl = document.getElementById(item.id);
        if (targetEl) {
          const rect = targetEl.getBoundingClientRect();
          if (rect.top - containerTop <= 120) {
            currentActiveId = item.id;
          }
        }
      }
      setActiveChapterId(currentActiveId);
    }
  }, [tocList]);

  useEffect(() => {
    const el = scrollViewRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Jump to specific TOC h1 heading
  const scrollToHeading = (id: string) => {
    setActiveChapterId(id);
    setIsTocOpen(false);

    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Font size handlers A+ / A-
  const handleIncreaseFont = () => {
    setFontSize((prev) => Math.min(prev + 2, 28));
  };

  const handleDecreaseFont = () => {
    setFontSize((prev) => Math.max(prev - 2, 12));
  };

  const handleResetFont = () => {
    setFontSize(16);
  };

  // Close handler
  const handleCloseAction = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  // Theme styling configurations
  const themeClasses = {
    light: {
      bg: "bg-slate-100 text-slate-900",
      header: "bg-white border-slate-200 text-slate-900",
      card: "bg-white text-slate-900 shadow-md border border-slate-200/80",
      controls: "bg-white border-slate-200 text-slate-700",
      tocBg: "bg-white text-slate-900 border-slate-200",
      tocActive: "bg-blue-50 text-[#1976D2] font-bold border-l-4 border-[#1976D2]"
    },
    sepia: {
      bg: "bg-[#f4ecd8] text-[#3e2723]",
      header: "bg-[#ebdcb9] border-[#d7c49e] text-[#2c1b18]",
      card: "bg-[#fbf0d9] text-[#2c1b18] shadow-md border border-[#e5d3b3]",
      controls: "bg-[#ebdcb9] border-[#d7c49e] text-[#3e2723]",
      tocBg: "bg-[#fbf0d9] text-[#2c1b18] border-[#e5d3b3]",
      tocActive: "bg-[#eedaa2] text-[#3e2723] font-bold border-l-4 border-[#8d6e63]"
    },
    dark: {
      bg: "bg-slate-950 text-slate-100",
      header: "bg-slate-900 border-slate-800 text-slate-100",
      card: "bg-slate-900 text-slate-100 shadow-xl border border-slate-800",
      controls: "bg-slate-900 border-slate-800 text-slate-200",
      tocBg: "bg-slate-900 text-slate-100 border-slate-800",
      tocActive: "bg-slate-800 text-blue-400 font-bold border-l-4 border-blue-500"
    }
  }[theme];

  return (
    <div className={`fixed inset-0 z-[100] w-screen h-screen flex flex-col overflow-hidden select-none transition-colors duration-200 ${themeClasses.bg}`}>
      {/* Scroll Progress Bar at Top */}
      <div className="h-1 bg-slate-200/20 w-full shrink-0 z-[170]">
        <div
          className="h-full bg-[#1976D2] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Reader Navigation Header */}
      <div className={`h-14 border-b px-3 sm:px-5 flex items-center justify-between shrink-0 z-[160] shadow-sm transition-colors ${themeClasses.header}`}>
        {/* Left: Close & Book Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={handleCloseAction}
            className="p-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 transition active-press shrink-0"
            title="Close E-Book Reader"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold truncate max-w-[160px] sm:max-w-xs md:max-w-md">
              {bookTitle}
            </h3>
            <p className="text-[10px] text-[#1976D2] font-extrabold truncate flex items-center gap-1">
              <BookOpen className="w-3 h-3 shrink-0" />
              <span>{readType === "sample" ? "Free Sample E-Book" : "Reflowable HTML Edition"}</span>
            </p>
          </div>
        </div>

        {/* Center: Font Size Controls (A- / A+) & Theme Selector */}
        <div className="hidden md:flex items-center gap-2">
          {/* Table of Contents Toggle */}
          <button
            onClick={() => setIsTocOpen(!isTocOpen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition active-press ${
              isTocOpen ? "bg-[#1976D2] text-white border-[#1976D2]" : themeClasses.controls
            }`}
            title="Table of Contents (Parsed from H1)"
          >
            <List className="w-4 h-4" />
            <span>Table of Contents ({tocList.length})</span>
          </button>

          <div className="w-px h-5 bg-slate-400/30 mx-1" />

          {/* Font Controls (A- & A+) */}
          <div className={`flex items-center gap-1 border px-2 py-1 rounded-xl text-xs ${themeClasses.controls}`}>
            <span className="text-[10px] font-bold text-slate-400 mr-1 uppercase">Font Size</span>
            <button
              onClick={handleDecreaseFont}
              disabled={fontSize <= 12}
              className="px-2 py-0.5 rounded font-black hover:bg-slate-500/20 disabled:opacity-30"
              title="Decrease Font Size (A-)"
            >
              A-
            </button>

            <button
              onClick={handleResetFont}
              className="px-1.5 text-[11px] font-mono font-bold hover:underline"
              title="Reset Font Size"
            >
              {fontSize}px
            </button>

            <button
              onClick={handleIncreaseFont}
              disabled={fontSize >= 28}
              className="px-2 py-0.5 rounded font-black hover:bg-slate-500/20 disabled:opacity-30"
              title="Increase Font Size (A+)"
            >
              A+
            </button>
          </div>

          <div className="w-px h-5 bg-slate-400/30 mx-1" />

          {/* Theme Selector */}
          <div className={`flex items-center gap-1 border p-1 rounded-xl text-xs ${themeClasses.controls}`}>
            <button
              onClick={() => setTheme("light")}
              className={`p-1 rounded-lg transition ${theme === "light" ? "bg-white text-slate-900 shadow-xs font-bold" : "opacity-70 hover:opacity-100"}`}
              title="Light Theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme("sepia")}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition ${
                theme === "sepia" ? "bg-[#fbf0d9] text-[#3e2723] shadow-xs" : "opacity-70 hover:opacity-100"
              }`}
              title="Sepia Parchment Theme"
            >
              Sepia
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`p-1 rounded-lg transition ${theme === "dark" ? "bg-slate-800 text-white shadow-xs" : "opacity-70 hover:opacity-100"}`}
              title="Dark Theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Actions & Format Switcher */}
        <div className="flex items-center gap-2">
          {hasPdfVersion && onSwitchToPdf && (
            <button
              onClick={onSwitchToPdf}
              className="px-2.5 py-1.5 bg-[#1976D2]/10 hover:bg-[#1976D2]/20 text-[#1976D2] rounded-xl text-xs font-black flex items-center gap-1 border border-[#1976D2]/30 transition active-press"
              title="Switch to PDF Reader"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF Format</span>
            </button>
          )}

          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-xl transition active-press ${
              isBookmarked ? "bg-amber-500 text-slate-950" : "bg-slate-500/10 hover:bg-slate-500/20"
            }`}
            title="Bookmark Page"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <button
            onClick={handleCloseAction}
            className="p-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 transition active-press"
            title="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Free Sample Callout Banner */}
      {readType === "sample" && !isLoading && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs px-4 py-2 flex items-center justify-between gap-3 shrink-0 z-[150]">
          <div className="flex items-center gap-2 truncate font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="truncate">
              Free Sample Chapter Preview. Buy full e-book to unlock all chapters!
            </span>
          </div>

          {onBuy && (
            <button
              onClick={onBuy}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] rounded-lg shrink-0 flex items-center gap-1 transition shadow-xs active-press"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Unlock Book {bookBuyPrice ? `(₹${bookBuyPrice})` : ""}</span>
            </button>
          )}
        </div>
      )}

      {/* Main E-Book Scrollable View Area */}
      <div className="relative flex-1 overflow-hidden flex">
        {/* Table of Contents Side Drawer / Popover */}
        {isTocOpen && (
          <div className={`absolute top-0 bottom-0 left-0 w-80 max-w-[85vw] z-[180] border-r shadow-2xl flex flex-col transition-all animate-in slide-in-from-left duration-200 ${themeClasses.tocBg}`}>
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-xs uppercase tracking-wider text-[#1976D2]">
                <List className="w-4 h-4" />
                <span>Table of Contents</span>
              </div>
              <button
                onClick={() => setIsTocOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-500/20 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Parsed Headings ({tocList.length})
              </p>
              {tocList.length === 0 ? (
                <div className="p-4 text-xs text-slate-500 text-center">
                  No <code>&lt;h1&gt;</code> chapter headings found in this document.
                </div>
              ) : (
                tocList.map((item, idx) => {
                  const isActive = activeChapterId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToHeading(item.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between gap-2 active-press ${
                        isActive ? themeClasses.tocActive : "hover:bg-slate-500/10"
                      }`}
                    >
                      <span className="line-clamp-2">{item.title}</span>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#1976D2]" : "opacity-40"}`} />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Scroll Content View */}
        <div ref={scrollViewRef} className="flex-1 overflow-y-auto p-4 sm:p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400 py-20">
              <Loader2 className="w-9 h-9 animate-spin text-[#1976D2]" />
              <p className="text-xs font-semibold">Loading Reflowable HTML E-Book...</p>
              <p className="text-[11px] max-w-[260px] text-center opacity-70">
                Parsing chapter structure, headings, and formatting layout.
              </p>
            </div>
          ) : hasError ? (
            <div className="m-auto text-center p-6 mt-16 max-w-sm rounded-2xl border border-red-500/20 bg-red-500/10 space-y-3">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
              <h3 className="text-base font-bold text-red-600 dark:text-red-400">Failed to load HTML E-Book</h3>
              <p className="text-xs text-slate-500">
                The requested HTML file could not be parsed. Please verify your connection or try switching to the PDF version.
              </p>
              {hasPdfVersion && onSwitchToPdf && (
                <button
                  onClick={onSwitchToPdf}
                  className="px-4 py-2 bg-[#1976D2] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition"
                >
                  Switch to PDF Version
                </button>
              )}
            </div>
          ) : (
            <div className={`mx-auto rounded-3xl p-6 sm:p-10 transition-all ${themeClasses.card}`}>
              <div
                ref={contentRef}
                className="html-ebook-content"
                style={{ fontSize: `${fontSize}px` }}
                dangerouslySetInnerHTML={{ __html: rawHtml }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Floating Toolbar for Font Size (A- / A+) & TOC */}
      {!isLoading && !hasError && (
        <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-[170] flex items-center gap-2 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white px-3 py-2 rounded-2xl shadow-2xl text-xs">
          <button
            onClick={() => setIsTocOpen(!isTocOpen)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 active-press"
            title="Table of Contents"
          >
            <List className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-700 mx-0.5" />

          <button
            onClick={handleDecreaseFont}
            disabled={fontSize <= 12}
            className="px-2.5 py-1 rounded-lg bg-slate-800 font-extrabold text-xs active-press disabled:opacity-30"
            title="Font Size A-"
          >
            A-
          </button>

          <span className="font-mono text-[11px] font-bold text-slate-300">
            {fontSize}px
          </span>

          <button
            onClick={handleIncreaseFont}
            disabled={fontSize >= 28}
            className="px-2.5 py-1 rounded-lg bg-slate-800 font-extrabold text-xs active-press disabled:opacity-30"
            title="Font Size A+"
          >
            A+
          </button>

          <div className="w-px h-4 bg-slate-700 mx-0.5" />

          <button
            onClick={() => setTheme(theme === "light" ? "sepia" : theme === "sepia" ? "dark" : "light")}
            className="p-2 rounded-xl bg-slate-800 text-amber-400 active-press"
            title="Toggle Theme"
          >
            {theme === "light" ? <Sun className="w-4 h-4" /> : theme === "sepia" ? <Sparkles className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
