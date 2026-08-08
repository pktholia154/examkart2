'use client';

import React, { useState } from 'react';
import { ExamItem, BookItem, BundleItem, AccessType } from '@/lib/types';
import {
  X,
  RotateCw,
  Clock,
  Sparkles,
  Zap,
  Check,
  ShieldAlert,
  Crown
} from 'lucide-react';

interface RenewValidityModalProps {
  item: ExamItem | BookItem | BundleItem | null;
  itemType: 'exam' | 'book' | 'bundle';
  expiredAtDate?: string;
  onClose: () => void;
  onRenewConfirm: (
    item: ExamItem | BookItem | BundleItem | null,
    itemType: 'exam' | 'book' | 'bundle' | 'subscription',
    accessType: AccessType
  ) => void;
}

export function RenewValidityModal({
  item,
  itemType,
  expiredAtDate = 'recently',
  onClose,
  onRenewConfirm
}: RenewValidityModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<AccessType>('rent');
  const [isProcessing, setIsProcessing] = useState(false);

  const buyPrice = item ? item.buy_price : 299;
  const rentPrice = item && 'rent_price' in item && item.rent_price
    ? item.rent_price
    : Math.round(buyPrice * 0.25);
  const subPrice = 199;

  const handleRenew = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onRenewConfirm(item, itemType, selectedPlan);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Warning Banner Header */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-amber-900 text-white p-4 sm:p-5 relative flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-rose-200 text-[11px] font-black uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              <span>Validity Expired • Action Required</span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight line-clamp-1">
              Renew Access for {item?.title || 'Selected Product'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-800">
          
          {/* Expiry Alert Card */}
          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 font-bold">
              <Clock className="w-5 h-5 text-rose-600" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-rose-950">
                Your online validity for this product expired ({expiredAtDate})
              </h4>
              <p className="text-[11px] text-rose-800 font-medium">
                To continue reading or taking mock tests, please select a validity option below to extend access instantly.
              </p>
            </div>
          </div>

          {/* Item details */}
          {item && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-extrabold text-[#1976D2] uppercase bg-primary-light px-1.5 py-0.5 rounded">
                  {item.category}
                </span>
                <p className="font-bold text-slate-900 line-clamp-1 mt-0.5">{item.title}</p>
              </div>
              <span className="text-slate-500 font-medium text-[11px] shrink-0 ml-2">
                Buy Price: ₹{item.buy_price}
              </span>
            </div>
          )}

          <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
            Select Validity Renewal Option
          </label>

          {/* Option 1: Renew Rent (30 Days) */}
          <div
            onClick={() => setSelectedPlan('rent')}
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
              selectedPlan === 'rent'
                ? 'border-primary bg-primary-light/30 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'rent' ? 'border-primary bg-primary text-white' : 'border-slate-300'
                }`}>
                  {selectedPlan === 'rent' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-900">Renew 30 Days Rent</span>
                    <span className="text-[9px] font-black bg-primary text-white px-1.5 py-0.5 rounded">
                      +30 DAYS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    Extend online reading & tests for 30 days
                  </p>
                </div>
              </div>
              <span className="text-sm font-black text-slate-900">₹{rentPrice}</span>
            </div>
          </div>

          {/* Option 2: Upgrade to Lifetime Ownership */}
          <div
            onClick={() => setSelectedPlan('lifetime')}
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
              selectedPlan === 'lifetime'
                ? 'border-secondary bg-secondary-light/40 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'lifetime' ? 'border-secondary bg-secondary text-white' : 'border-slate-300'
                }`}>
                  {selectedPlan === 'lifetime' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-900">Upgrade to Lifelong Buy</span>
                    <span className="text-[9px] font-black bg-secondary text-white px-1.5 py-0.5 rounded">
                      PERMANENT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    Never expires • Unlocks offline download mode
                  </p>
                </div>
              </div>
              <span className="text-sm font-black text-slate-900">₹{buyPrice}</span>
            </div>
          </div>

          {/* Option 3: Get Monthly All-Access Subscription */}
          <div
            onClick={() => setSelectedPlan('subscription')}
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
              selectedPlan === 'subscription'
                ? 'border-tertiary bg-tertiary-light/40 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'subscription' ? 'border-slate-900 bg-tertiary text-slate-950' : 'border-slate-300'
                }`}>
                  {selectedPlan === 'subscription' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-900">Switch to Monthly All-Access Pass</span>
                    <span className="text-[9px] font-black bg-tertiary text-slate-950 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5" /> ALL PRODUCTS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    Unlock ALL books & exams on ExamKart for 1 month
                  </p>
                </div>
              </div>
              <span className="text-sm font-black text-slate-900">₹{subPrice}/mo</span>
            </div>
          </div>

        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs transition cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handleRenew}
            disabled={isProcessing}
            className="flex-2 py-3 px-5 rounded-xl bg-[#1976D2] hover:bg-[#1565C0] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active-press cursor-pointer disabled:opacity-50"
          >
            <RotateCw className="w-4 h-4" />
            <span>
              {isProcessing
                ? 'Processing Renewal...'
                : `Renew Now • ${selectedPlan === 'lifetime' ? `₹${buyPrice}` : selectedPlan === 'rent' ? `₹${rentPrice}` : `₹${subPrice}`}`}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
