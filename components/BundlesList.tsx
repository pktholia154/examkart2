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
    <div className="px-2 sm:px-4 py-1.5 sm:py-3 space-y-2 sm:space-y-2.5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Combo Bundles
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">
            Maximum savings — unlock all exams & theory books together
          </p>
        </div>
        <button
          onClick={onViewAllClick}
          className="text-xs font-semibold text-[#28811f] hover:underline cursor-pointer"
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
              className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                {/* Logo Badge Icon Box */}
                <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                  {bundle.logoText ? (
                    <span className="font-bold text-xs text-[#28811f] tracking-tighter">
                      {bundle.logoText}
                    </span>
                  ) : (
                    <Layers className="w-5 h-5 text-[#28811f]" />
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#28811f] transition-colors">
                      {bundle.title}
                    </h3>
                    {bundle.badge && (
                      <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                        {bundle.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {bundle.full_description || bundle.seo_description}
                  </p>
                </div>
              </div>

              {/* Price & Enroll CTA */}
              <div className="flex items-center sm:flex-col items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 shrink-0">
                <div className="text-left sm:text-right">
                  <div className="text-sm sm:text-base font-bold text-slate-900">
                    ₹{bundle.buy_price.toLocaleString()}
                  </div>
                  {bundle.list_price > bundle.buy_price && (
                    <div className="text-[11px] text-slate-400 line-through">
                      ₹{bundle.list_price.toLocaleString()}
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => onEnrollClick(bundle, e)}
                  className={`px-4 py-1.5 rounded-lg font-semibold text-xs uppercase tracking-wide transition active-press shadow-2xs flex items-center gap-1 cursor-pointer ${
                    isUnlocked
                      ? 'bg-secondary text-white'
                      : 'bg-[#28811f] hover:bg-[#1f6818] text-white'
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

