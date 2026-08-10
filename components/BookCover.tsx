'use client';

import React from 'react';

interface BookCoverProps {
  title?: string;
  category?: string;
  code?: string;
  className?: string;
  showTitle?: boolean;
}

export function BookCover({
  title,
  category,
  code,
  className = 'w-12 sm:w-14',
  showTitle = false,
}: BookCoverProps) {
  // Derive 2-3 letter abbreviation if code is not provided
  const derivedCode = React.useMemo(() => {
    if (code) return code.toUpperCase();
    if (category) {
      const words = category.trim().split(/\s+/);
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return category.substring(0, 2).toUpperCase();
    }
    if (title) {
      const words = title.trim().split(/\s+/);
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return title.substring(0, 2).toUpperCase();
    }
    return 'CP';
  }, [code, category, title]);

  return (
    <div
      className={`relative shrink-0 overflow-hidden select-none rounded-[4px] shadow-sm transition-transform duration-200 ${className}`}
      style={{
        aspectRatio: '2 / 3.2',
        backgroundColor: '#2583ef',
      }}
    >
      {/* 1. Left Spine Binding Punch Holes */}
      <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-between py-1.5 z-20 pointer-events-none">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#121212] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] border border-black/30"
          />
        ))}
      </div>

      {/* 2. Top-Right Folded Corner (Dog-Ear Fold Effect) */}
      <div className="absolute top-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 z-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[14px] sm:border-t-[16px] border-t-black/30 border-l-[14px] sm:border-l-[16px] border-l-transparent" />
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[14px] sm:border-t-[16px] border-t-white border-l-[14px] sm:border-l-[16px] border-l-transparent filter drop-shadow(-1px 1px 1px rgba(0,0,0,0.25))" />
      </div>

      {/* 3. Abstract Flame / Dynamic Watermark Ribbon (SVG) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 100 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M 22 135 C 2 80 40 35 72 42 C 96 48 85 88 58 108 C 32 128 12 108 28 72 C 44 36 74 20 82 62 C 88 102 52 142 34 118"
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 32 142 C 18 112 48 52 72 56 C 88 60 78 92 52 112"
          stroke="rgba(255, 255, 255, 0.16)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* 4. Title Header Overlay (for detail/large views) */}
      {showTitle && title && (
        <div className="absolute top-2.5 left-3.5 right-4 z-10 text-white font-extrabold text-[9px] sm:text-[11px] leading-tight line-clamp-2 drop-shadow-xs">
          {title}
        </div>
      )}

      {/* 5. Bottom Right Abbreviation Box */}
      <div className="absolute bottom-1.5 right-1.5 z-10 px-1.5 py-0.5 border border-white/40 bg-white/10 backdrop-blur-[1px] rounded-sm flex items-center justify-center min-w-[24px] sm:min-w-[28px] shadow-2xs">
        <span className="text-white font-black text-[10px] sm:text-xs tracking-wider uppercase leading-none">
          {derivedCode}
        </span>
      </div>
    </div>
  );
}
