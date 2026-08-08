"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, ZoomIn, ZoomOut, Bookmark, ChevronLeft, ChevronRight, X, AlertCircle, ShoppingCart } from "lucide-react";
import { fetchFirestoreBookBySlugOrId } from "@/lib/books-store";
import { getPdfOffline } from "@/lib/offline-storage";

interface PDFReaderProps {
  bookId?: string;
  initialUrl?: string;
  readType?: "sample" | "full" | "offline";
  title?: string;
  onClose?: () => void;
  onBuy?: () => void;
}

export default function PDFReader({
  bookId: propBookId,
  initialUrl: propInitialUrl,
  readType: propReadType,
  title: propTitle,
  onClose,
  onBuy
}: PDFReaderProps = {}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Resolve book ID from props or URL route params
  const bookIdParam = propBookId || params?.bookId;
  const rawBookId = Array.isArray(bookIdParam) ? bookIdParam[0] : bookIdParam;
  const decodedBookId = rawBookId ? decodeURIComponent(rawBookId) : "";

  // Resolve read type ("sample", "full", "offline")
  const urlReadType = searchParams?.get("type") || searchParams?.get("mode");
  const readType = propReadType || urlReadType || "full";

  // Resolve explicit file URL
  const explicitUrl = propInitialUrl || searchParams?.get("file") || searchParams?.get("url");

  const [bookTitle, setBookTitle] = useState<string>(propTitle || "ExamKart Digital Reader");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [isUrlResolved, setIsUrlResolved] = useState(false);
  const [bookBuyPrice, setBookBuyPrice] = useState<number | null>(null);

  const [isPdfLoaded, setIsPdfLoaded] = useState<boolean>(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [fitToWidth, setFitToWidth] = useState<boolean>(true);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(true);
  const [noUrlError, setNoUrlError] = useState(false);

  const scrollViewRef = useRef<HTMLDivElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const pageWrappersRef = useRef<HTMLDivElement[]>([]);
  const pageCanvasesRef = useRef<HTMLCanvasElement[]>([]);
  const pageRenderStatesRef = useRef<boolean[]>([]);
  const renderObserverRef = useRef<IntersectionObserver | null>(null);
  const activePageObserverRef = useRef<IntersectionObserver | null>(null);

  const pdfDocRef = useRef<any>(null);
  const pdfjsLibRef = useRef<any>(null);

  const scaleRef = useRef<number>(1.0);
  const fitToWidthRef = useRef<boolean>(true);

  // Sync refs
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    fitToWidthRef.current = fitToWidth;
  }, [fitToWidth]);

  // 1. Resolve Target PDF URL from Search Params or Firestore / Local fallback
  useEffect(() => {
    let active = true;

    async function resolveUrl() {
      if (readType === "offline") {
        if (active) {
          setIsUrlResolved(true);
          setFileUrl("offline");
        }
        return;
      }

      let firestoreUrl = "";

      if (decodedBookId) {
        try {
          const bookData = await fetchFirestoreBookBySlugOrId(decodedBookId);
          if (active && bookData) {
            if (bookData.title) setBookTitle(bookData.title);
            if (bookData.buy_price) setBookBuyPrice(bookData.buy_price);

            if (readType === "sample") {
              firestoreUrl = bookData.sampleurl || bookData.sample_file || bookData.pdfurl || bookData.pdf_file || "";
            } else {
              firestoreUrl = bookData.pdfurl || bookData.pdf_file || bookData.sampleurl || bookData.sample_file || "";
            }
          }
        } catch (e) {
          console.warn("Error fetching book details for reader:", e);
        }
      }

      const explicitDecoded = explicitUrl ? decodeURIComponent(explicitUrl) : "";
      const targetUrl = firestoreUrl || explicitDecoded || (decodedBookId ? `/api/pdf?bookId=${encodeURIComponent(decodedBookId)}&type=${readType}` : "");

      if (active) {
        if (targetUrl) {
          setFileUrl(targetUrl);
          setIsUrlResolved(true);
        } else {
          setNoUrlError(true);
          setIsLoading(false);
          setIsUrlResolved(true);
        }
      }
    }

    resolveUrl();

    return () => {
      active = false;
    };
  }, [explicitUrl, decodedBookId, readType]);

  // Render a single page canvas with exact proportional scaling and high-DPI sharpness
  const renderPage = useCallback(async (num: number, canvas: HTMLCanvasElement, wrapper: HTMLDivElement) => {
    const doc = pdfDocRef.current;
    if (!doc) return;

    try {
      const page = await doc.getPage(num);
      const unscaledViewport = page.getViewport({ scale: 1.0 });

      // Determine correct zoom scale based on fitToWidth mode or user zoom
      let renderScale = scaleRef.current;
      const container = scrollViewRef.current;
      const availableWidth = container ? Math.max(container.clientWidth - 24, 280) : window.innerWidth - 24;

      if (fitToWidthRef.current && availableWidth > 0) {
        renderScale = availableWidth / unscaledViewport.width;
      }

      // High-DPI (Retina/Mobile) super-sampling for crystal clear text
      const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
      let targetScale = renderScale * dpr;
      if (targetScale > 4.0) targetScale = 4.0;

      const viewport = page.getViewport({ scale: targetScale });

      // Pre-calculate aspects for instant CSS updates to prevent layout shifts
      const aspectWidth = Math.floor(unscaledViewport.width * renderScale);
      const aspectHeight = Math.floor(unscaledViewport.height * renderScale);

      // Instant CSS update for this specific page
      canvas.style.width = `${aspectWidth}px`;
      canvas.style.maxWidth = "none";
      canvas.style.height = "auto";
      canvas.style.aspectRatio = `${aspectWidth} / ${aspectHeight}`;

      if (wrapper) {
        wrapper.style.maxWidth = `${aspectWidth}px`;
        wrapper.style.aspectRatio = `${aspectWidth} / ${aspectHeight}`;
      }

      const scaleKey = `${renderScale.toFixed(4)}_${dpr}`;
      if (canvas.getAttribute("data-render-key") === scaleKey) {
        return; // Already rendered at this exact resolution
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        await page.render({ canvasContext: ctx, viewport }).promise;
      }
      canvas.setAttribute("data-render-key", scaleKey);
    } catch (err: any) {
      console.warn(`Render error on page ${num}:`, err);
      pageRenderStatesRef.current[num] = false;
    }
  }, []);

  // Setup Pages and Intersection Observers
  const setupPages = useCallback(async () => {
    const doc = pdfDocRef.current;
    const canvasContainer = canvasContainerRef.current;
    const scrollView = scrollViewRef.current;
    if (!doc || !canvasContainer || !scrollView) return;

    // Disconnect old observers
    if (renderObserverRef.current) renderObserverRef.current.disconnect();
    if (activePageObserverRef.current) activePageObserverRef.current.disconnect();

    canvasContainer.replaceChildren();
    pageWrappersRef.current = [];
    pageCanvasesRef.current = [];
    pageRenderStatesRef.current = new Array(doc.numPages + 1).fill(false);

    let sampleAspect = "1 / 1.414"; // Standard A4 default
    let initialAspectWidth = 0;
    try {
      const page1 = await doc.getPage(1);
      const vp1 = page1.getViewport({ scale: 1.0 });
      let initialScale = scaleRef.current;
      if (fitToWidthRef.current && scrollView) {
        const availableWidth = Math.max(scrollView.clientWidth - 24, 280);
        initialScale = availableWidth / vp1.width;
      }
      sampleAspect = `${vp1.width} / ${vp1.height}`;
      initialAspectWidth = Math.floor(vp1.width * initialScale);
    } catch (e) {
      console.warn("Could not inspect page 1 viewport:", e);
    }

    // IntersectionObserver for Rendering on Scroll
    renderObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = parseInt(entry.target.getAttribute("data-page-num") || "1", 10);
            if (!pageRenderStatesRef.current[pageNum]) {
              pageRenderStatesRef.current[pageNum] = true;
              const canvasEl = entry.target.querySelector("canvas");
              if (canvasEl) {
                renderPage(pageNum, canvasEl as HTMLCanvasElement, entry.target as HTMLDivElement);
              }
            }
          }
        });
      },
      { root: scrollView, rootMargin: "600px 0px" }
    );

    // IntersectionObserver for Active Page Tracking
    activePageObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = parseInt(entry.target.getAttribute("data-page-num") || "1", 10);
            setCurrentPage(pageNum);
          }
        });
      },
      { root: scrollView, threshold: 0.25 }
    );

    for (let i = 1; i <= doc.numPages; i++) {
      const wrapper = document.createElement("div");
      wrapper.className = "pdf-page-wrapper bg-white shadow-md my-3 rounded-md overflow-hidden transition-all border border-slate-200/80";
      wrapper.setAttribute("data-page-num", i.toString());
      wrapper.style.aspectRatio = sampleAspect;
      if (initialAspectWidth > 0) {
        wrapper.style.maxWidth = `${initialAspectWidth}px`;
      }

      const canvas = document.createElement("canvas");
      canvas.className = "pdf-page-canvas block w-full h-auto";
      canvas.setAttribute("data-page-num", i.toString());
      if (initialAspectWidth > 0) {
        canvas.style.width = `${initialAspectWidth}px`;
        canvas.style.aspectRatio = sampleAspect;
      }

      wrapper.appendChild(canvas);
      canvasContainer.appendChild(wrapper);

      pageWrappersRef.current.push(wrapper);
      pageCanvasesRef.current.push(canvas);

      renderObserverRef.current.observe(wrapper);
      activePageObserverRef.current.observe(wrapper);
    }
  }, [renderPage]);

  // Update zoom CSS and re-trigger renders
  const applyZoom = useCallback(async () => {
    const doc = pdfDocRef.current;
    if (!doc) return;

    try {
      const page1 = await doc.getPage(1);
      const vp1 = page1.getViewport({ scale: 1.0 });

      let renderScale = scaleRef.current;
      const container = scrollViewRef.current;
      const availableWidth = container ? Math.max(container.clientWidth - 24, 280) : window.innerWidth - 24;

      if (fitToWidthRef.current && availableWidth > 0) {
        renderScale = availableWidth / vp1.width;
      }

      const aspectWidth = Math.floor(vp1.width * renderScale);
      const aspectHeight = Math.floor(vp1.height * renderScale);
      const sampleAspect = `${aspectWidth} / ${aspectHeight}`;

      // 1. Update CSS on wrappers & canvases
      pageWrappersRef.current.forEach((wrapper) => {
        if (wrapper) {
          wrapper.style.maxWidth = `${aspectWidth}px`;
          wrapper.style.aspectRatio = sampleAspect;
        }
      });

      pageCanvasesRef.current.forEach((canvas) => {
        if (canvas) {
          canvas.style.width = `${aspectWidth}px`;
          canvas.style.aspectRatio = sampleAspect;
        }
      });

      // 2. Reset render states
      pageRenderStatesRef.current.fill(false);

      // 3. Immediately re-render visible pages
      pageWrappersRef.current.forEach((wrapper, index) => {
        if (wrapper) {
          const rect = wrapper.getBoundingClientRect();
          if (rect.top < window.innerHeight + 200 && rect.bottom > -200) {
            const pageNum = index + 1;
            const canvasEl = pageCanvasesRef.current[index];
            if (canvasEl) {
              pageRenderStatesRef.current[pageNum] = true;
              renderPage(pageNum, canvasEl, wrapper);
            }
          }
        }
      });

      // 4. Re-observe
      if (renderObserverRef.current) {
        renderObserverRef.current.disconnect();
        requestAnimationFrame(() => {
          if (renderObserverRef.current) {
            pageWrappersRef.current.forEach((wrapper) => {
              if (wrapper) renderObserverRef.current!.observe(wrapper);
            });
          }
        });
      }
    } catch (e) {
      console.warn("Error applying zoom:", e);
    }
  }, [renderPage]);

  const reRenderAll = useCallback(() => {
    applyZoom();
  }, [applyZoom]);

  // Touch & Pinch-to-Zoom Gesture Handler
  useEffect(() => {
    const container = scrollViewRef.current;
    if (!container) return;

    let isPinching = false;
    let initialDist = 0;
    let startScale = scaleRef.current;
    let currentScale = scaleRef.current;
    let rafId: number | null = null;

    let viewportPinchX = 0;
    let viewportPinchY = 0;
    let originX = 0;
    let originY = 0;
    let initialScrollTop = 0;
    let initialScrollLeft = 0;

    const getDistance = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    };

    const getCenter = (touches: TouchList) => {
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2,
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        isPinching = true;
        initialDist = getDistance(e.touches);
        startScale = scaleRef.current;
        currentScale = startScale;

        const center = getCenter(e.touches);
        const scrollRect = container.getBoundingClientRect();
        
        viewportPinchX = center.x - scrollRect.left;
        viewportPinchY = center.y - scrollRect.top;

        initialScrollTop = container.scrollTop;
        initialScrollLeft = container.scrollLeft;

        if (canvasContainerRef.current) {
          const containerRect = canvasContainerRef.current.getBoundingClientRect();
          originX = center.x - containerRect.left;
          originY = center.y - containerRect.top;
        }

        setFitToWidth(false);
        fitToWidthRef.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isPinching && e.touches.length === 2) {
        e.preventDefault();
        const dist = getDistance(e.touches);
        if (initialDist < 10) return;

        const scaleRatio = dist / initialDist;
        const targetScale = Math.min(Math.max(startScale * scaleRatio, 0.5), 4.0);
        currentScale = targetScale;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          if (canvasContainerRef.current) {
            const relativeFactor = currentScale / scaleRef.current;
            canvasContainerRef.current.style.transformOrigin = `${originX}px ${originY}px`;
            canvasContainerRef.current.style.transform = `scale(${relativeFactor})`;
            canvasContainerRef.current.style.transition = "none";
            canvasContainerRef.current.style.willChange = "transform";
          }
        });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isPinching && e.touches.length < 2) {
        isPinching = false;
        if (rafId) cancelAnimationFrame(rafId);

        if (canvasContainerRef.current) {
          canvasContainerRef.current.style.transform = "";
          canvasContainerRef.current.style.transformOrigin = "";
          canvasContainerRef.current.style.transition = "";
          canvasContainerRef.current.style.willChange = "";
        }

        const rawFinalScale = Math.min(Math.max(currentScale, 0.5), 4.0);
        const roundedScale = +(rawFinalScale).toFixed(2);
        const scaleChangeRatio = roundedScale / scaleRef.current;

        if (Math.abs(scaleChangeRatio - 1) > 0.01) {
          const newScrollTop = (initialScrollTop + viewportPinchY) * scaleChangeRatio - viewportPinchY;
          const newScrollLeft = (initialScrollLeft + viewportPinchX) * scaleChangeRatio - viewportPinchX;

          setScale(roundedScale);
          scaleRef.current = roundedScale;

          reRenderAll();

          container.scrollTop = Math.max(0, newScrollTop);
          container.scrollLeft = Math.max(0, newScrollLeft);
        }
      }
    };

    let wheelTimer: NodeJS.Timeout | null = null;
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setFitToWidth(false);
        fitToWidthRef.current = false;

        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        const next = Math.min(Math.max(+(scaleRef.current + delta).toFixed(2), 0.5), 4.0);

        if (next !== scaleRef.current) {
          setScale(next);
          scaleRef.current = next;
          if (wheelTimer) clearTimeout(wheelTimer);
          wheelTimer = setTimeout(() => {
            reRenderAll();
          }, 60);
        }
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("touchcancel", handleTouchEnd);
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (wheelTimer) clearTimeout(wheelTimer);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
      container.removeEventListener("wheel", handleWheel);
    };
  }, [reRenderAll]);

  // Window resize handler
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (fitToWidthRef.current && pdfDocRef.current) {
          reRenderAll();
        }
      }, 250);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, [reRenderAll]);

  // Main PDF loading runner using dynamic import of pdfjs-dist
  useEffect(() => {
    if (!isUrlResolved || !fileUrl || noUrlError) return;

    let active = true;

    async function initPdfEngine() {
      try {
        if (!pdfjsLibRef.current) {
          const pdfjs = await import("pdfjs-dist");
          pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
          pdfjsLibRef.current = pdfjs;
        }

        const pdfjsLib = pdfjsLibRef.current;
        let arrayBuffer: ArrayBuffer;

        if (readType === "offline") {
          const data = await getPdfOffline(decodedBookId);
          if (!data) throw new Error("Offline PDF not found");
          arrayBuffer = data;
        } else {
          // Attempt direct or API route fetch
          const fetchTarget = fileUrl.startsWith("http://") || fileUrl.startsWith("https://") 
            ? fileUrl 
            : `/api/pdf?url=${encodeURIComponent(fileUrl)}&bookId=${encodeURIComponent(decodedBookId)}&type=${readType}`;

          const response = await fetch(fetchTarget, { mode: "cors" });
          if (!response.ok) throw new Error("Network response not OK");
          arrayBuffer = await response.arrayBuffer();
        }

        if (!active) return;
        
        if (pdfDocRef.current) {
          pdfDocRef.current.destroy();
        }

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const doc = await loadingTask.promise;
        
        if (!active) {
          doc.destroy();
          return;
        }

        pdfDocRef.current = doc;
        setIsPdfLoaded(true);
        setNumPages(doc.numPages);
        setIsLoading(false);

        setupPages();
      } catch (fetchErr) {
        if (readType === "offline") {
          console.error("Failed to load offline PDF", fetchErr);
          if (active) {
             setNoUrlError(true);
             setIsLoading(false);
          }
          return;
        }

        console.warn("Direct fetch ArrayBuffer failed. Trying fallback proxy load...", fetchErr);
        if (!active) return;
        tryProxyLoad();
      }
    }

    async function tryProxyLoad() {
      const proxyUrl = `/api/pdf?bookId=${encodeURIComponent(decodedBookId)}&type=${readType}`;

      try {
        if (!pdfjsLibRef.current) {
          const pdfjs = await import("pdfjs-dist");
          pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
          pdfjsLibRef.current = pdfjs;
        }
        const pdfjsLib = pdfjsLibRef.current;

        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("Proxy response not OK");
        const arrayBuffer = await response.arrayBuffer();
        
        if (!active) return;

        if (pdfDocRef.current) {
          pdfDocRef.current.destroy();
        }

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const doc = await loadingTask.promise;
        
        if (!active) {
          doc.destroy();
          return;
        }

        pdfDocRef.current = doc;
        setIsPdfLoaded(true);
        setNumPages(doc.numPages);
        setIsLoading(false);

        setupPages();
      } catch (error) {
        console.error("PDF.js failed to load document.", error);
        if (!active) return;
        setNoUrlError(true);
        setIsLoading(false);
      }
    }

    initPdfEngine();

    return () => {
      active = false;
      if (renderObserverRef.current) renderObserverRef.current.disconnect();
      if (activePageObserverRef.current) activePageObserverRef.current.disconnect();
      
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
      }
    };
  }, [fileUrl, isUrlResolved, noUrlError, decodedBookId, readType, setupPages]);

  // Page navigation helpers
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setCurrentPage(val || 1);
    if (val >= 1 && pdfDocRef.current && val <= pdfDocRef.current.numPages) {
      const targetWrapper = pageWrappersRef.current[val - 1];
      if (targetWrapper) {
        targetWrapper.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const targetWrapper = pageWrappersRef.current[currentPage - 2];
      if (targetWrapper) targetWrapper.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      const targetWrapper = pageWrappersRef.current[currentPage];
      if (targetWrapper) targetWrapper.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleZoomIn = () => {
    setFitToWidth(false);
    fitToWidthRef.current = false;
    setScale((prev) => {
      const next = +(prev + 0.25).toFixed(2);
      scaleRef.current = next;
      setTimeout(reRenderAll, 0);
      return next;
    });
  };

  const handleZoomOut = () => {
    setFitToWidth(false);
    fitToWidthRef.current = false;
    setScale((prev) => {
      if (prev <= 0.5) return prev;
      const next = +(prev - 0.25).toFixed(2);
      scaleRef.current = next;
      setTimeout(reRenderAll, 0);
      return next;
    });
  };

  const handleToggleFitWidth = () => {
    setFitToWidth((prev) => {
      const next = !prev;
      fitToWidthRef.current = next;
      if (next) {
        setScale(1.0);
        scaleRef.current = 1.0;
      }
      setTimeout(reRenderAll, 0);
      return next;
    });
  };

  const handleCloseAction = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen bg-slate-900 text-slate-100 flex flex-col overflow-hidden select-none">
      {/* Reader Top Navigation Bar */}
      <div className="h-14 bg-slate-950 border-b border-slate-800 px-3 sm:px-5 flex items-center justify-between shrink-0 z-[160] shadow-md">
        {/* Left Title & Back */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleCloseAction}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition active-press shrink-0"
            title="Close PDF Reader"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {bookTitle}
            </h3>
            <p className="text-[10px] text-amber-400 font-semibold truncate">
              {readType === "sample" ? "Free Sample Preview" : readType === "offline" ? "Offline PDF View" : "Full E-Book Edition"}
            </p>
          </div>
        </div>

        {/* Center Toolbar Controls */}
        {!noUrlError && !isLoading && isPdfLoaded && (
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl text-xs">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-slate-800 disabled:opacity-30"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 font-mono text-slate-300">
              <input
                type="number"
                min={1}
                max={numPages}
                value={currentPage}
                onChange={handlePageInputChange}
                className="w-10 text-center bg-slate-800 border border-slate-700 rounded py-0.5 text-xs text-white focus:outline-none"
              />
              <span>/ {numPages}</span>
            </div>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="p-1 rounded hover:bg-slate-800 disabled:opacity-30"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-slate-800 mx-1" />

            <button
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-slate-800 text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleFitWidth}
              className={`px-2 py-0.5 text-[11px] font-bold rounded transition ${
                fitToWidth ? "bg-[#1976D2] text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
              title="Toggle Fit to Width"
            >
              Fit Width
            </button>

            <button
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-slate-800 text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-xl transition active-press ${
              isBookmarked ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
            title="Bookmark Page"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <button
            onClick={handleCloseAction}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition active-press"
            title="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Free Sample Notice Banner */}
      {readType === "sample" && !isLoading && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-200 text-xs px-4 py-2 flex items-center justify-between gap-3 shrink-0 z-[150]">
          <div className="flex items-center gap-2 truncate">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">
              Viewing Free Sample Preview. Unlock full book access to read all chapters!
            </span>
          </div>

          {onBuy && (
            <button
              onClick={onBuy}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] rounded-lg shrink-0 flex items-center gap-1 transition shadow-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Unlock Full Book {bookBuyPrice ? `(₹${bookBuyPrice})` : ""}</span>
            </button>
          )}
        </div>
      )}

      {/* Reader Main Content Canvas View */}
      <div id="viewer-container" className="relative w-full flex-1 overflow-hidden bg-slate-950">
        {noUrlError && (
          <div className="m-auto text-center text-red-400 p-6 mt-20 max-w-sm bg-slate-900 rounded-2xl border border-slate-800 shadow-xl space-y-3">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Failed to load PDF</h3>
            <p className="text-xs text-slate-400">
              The requested PDF file or book sample could not be loaded. Please check your internet connection or try reloading.
            </p>
            <button
              onClick={handleCloseAction}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
            >
              Go Back
            </button>
          </div>
        )}

        {!noUrlError && (
          <div id="pdf-scroll-view" ref={scrollViewRef} className="h-full w-full overflow-y-auto p-2 sm:p-4">
            {isLoading && (
              <div id="loading-spinner" className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                <Loader2 className="w-9 h-9 animate-spin text-[#1976D2]" />
                <p className="text-xs font-semibold text-slate-200">Initializing High-Resolution PDF Reader...</p>
                <p className="text-[11px] max-w-[280px] text-center text-slate-400">
                  Preparing document pages and vector rendering engine.
                </p>
              </div>
            )}
            <div ref={canvasContainerRef} className="w-max min-w-full mx-auto flex flex-col items-center origin-top transition-transform duration-75" />
          </div>
        )}

        {/* Floating Controls for Mobile */}
        {!noUrlError && !isLoading && isPdfLoaded && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-2xl shadow-2xl z-[150] text-xs">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-200 disabled:opacity-30"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-bold text-slate-200 px-1">
              Page {currentPage} of {numPages || "-"}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-200 disabled:opacity-30"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-slate-700 mx-1" />

            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-200"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
