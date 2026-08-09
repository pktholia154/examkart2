'use client';

import React from 'react';
import { BundleItem } from '@/lib/types';
import { Layers, CheckCircle2 } from 'lucide-react';

interface BundlesListProps {
  bundles: BundleItem[];
  unlockedBundleIds: Set<string>;
  onBundleClick: (bundle: BundleItem) => void;
  onEnrollClick: (bundle: BundleItem, e: React.MouseEvent) => void;
  onViewAllClick?: () => void;
}

export function BundlesList({
  bundles,
  unlockedBundleIds,
  onBundleClick,
  onEnrollClick,
  onViewAllClick
}: BundlesListProps) {
  if (!bundles || bundles.length === 0) {
    return null;
  }

  return (
    <div className="px-2 sm:px-4 py-3 space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-950 tracking-tight">
            Combo Bundles
          </h2>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">
            Maximum savings — unlock all exams & theory books together
          </p>
        </div>
        <button
          onClick={onViewAllClick}
          className="text-xs sm:text-sm font-extrabold text-[#1976D2] hover:underline px-2 py-1 bg-blue-50/80 rounded-lg border border-blue-200"
        >
          View All
        </button>
      </div>

      {/* Bundle Cards Stack */}
      <div className="space-y-3">
        {bundles.map((bundle) => {
          const isUnlocked = unlockedBundleIds.has(bundle.id);

          return (
            <div
              key={bundle.id}
              onClick={() => onBundleClick(bundle)}
              className="group bg-white rounded-2xl border-2 border-slate-300 hover:border-[#1976D2] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                {/* Logo Badge Icon Box */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center shrink-0 shadow-xs">
                  {bundle.logoText ? (
                    <span className="font-black text-sm text-[#1976D2] tracking-tighter">
                      {bundle.logoText}
                    </span>
                  ) : (
                    <Layers className="w-6 h-6 text-[#1976D2]" />
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-slate-950 group-hover:text-[#1976D2] transition-colors">
                      {bundle.title}
                    </h3>
                    {bundle.badge && (
                      <span className="text-[10px] font-black bg-amber-100 text-amber-950 px-2 py-0.5 rounded-md border border-amber-300 uppercase tracking-wider">
                        {bundle.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-700 line-clamp-2 leading-relaxed">
                    {bundle.full_description || bundle.seo_description}
                  </p>
                  <p className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                    Unlocks {bundle.included_items?.length || 4} Courses & E-Books
                  </p>
                </div>
              </div>

              {/* Price & Enroll CTA */}
              <div className="flex items-center sm:flex-col items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200 shrink-0">
                <div className="text-left sm:text-right">
                  <div className="text-base sm:text-lg font-black text-slate-950">
                    ₹{bundle.buy_price.toLocaleString()}
                  </div>
                  {bundle.list_price > bundle.buy_price && (
                    <div className="text-xs font-bold text-slate-400 line-through">
                      ₹{bundle.list_price.toLocaleString()}
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => onEnrollClick(bundle, e)}
                  className={`px-5 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition active-press shadow-xs flex items-center gap-1 border-2 ${
                    isUnlocked
                      ? 'bg-emerald-700 text-white border-emerald-800'
                      : 'bg-amber-400 hover:bg-amber-500 text-slate-950 border-amber-500'
                  }`}
                >
                  {isUnlocked ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>UNLOCKED</span>
                    </>
                  ) : (
                    <span>ENROLL</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

