'use client';

import React from 'react';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';

interface PromoBannerProps {
  onEnrollClick?: () => void;
}

export function PromoBanner({ onEnrollClick }: PromoBannerProps) {
  return (
    <div className="px-4 py-2">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1976D2] via-[#1976D2]/95 to-[#1565C0] text-white p-4 sm:p-5 shadow-md">
        {/* Decorative background vectors */}
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-tertiary/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute right-12 top-0 w-24 h-24 bg-white/10 rounded-full blur-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-tertiary text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-xs">
              <Zap className="w-3 h-3 fill-slate-950" />
              MEGA OFFER
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
              SSC CGL 2024 Target Batch
            </h2>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-tertiary font-extrabold text-lg sm:text-xl">75% OFF</span>
              <span className="text-xs text-blue-100/80 line-through">₹3,999</span>
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-blue-100">Limited Seats</span>
            </div>
          </div>

          <button
            onClick={onEnrollClick}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-tertiary hover:bg-tertiary-hover text-slate-950 font-extrabold text-xs sm:text-sm tracking-wide transition shadow-sm active-press flex items-center justify-center gap-1.5"
          >
            <span>ENROLL NOW</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
