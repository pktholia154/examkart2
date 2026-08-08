'use client';

import React, { useState } from 'react';
import { ExamItem, BookItem, BundleItem, AccessType } from '@/lib/types';
import {
  X,
  Check,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  Download,
  Wifi,
  CreditCard,
  Crown
} from 'lucide-react';

interface CheckoutModalProps {
  item: ExamItem | BookItem | BundleItem | null;
  itemType: 'exam' | 'book' | 'bundle' | 'subscription';
  initialAccessType?: AccessType;
  onClose: () => void;
  onConfirmPurchase: (
    item: ExamItem | BookItem | BundleItem | null,
    itemType: 'exam' | 'book' | 'bundle' | 'subscription',
    accessType: AccessType
  ) => void;
}

export function CheckoutModal({
  item,
  itemType,
  initialAccessType = 'lifetime',
  onClose,
  onConfirmPurchase
}: CheckoutModalProps) {
  const [selectedAccess, setSelectedAccess] = useState<AccessType>(
    itemType === 'subscription' ? 'subscription' : initialAccessType
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const buyPrice = item ? item.buy_price : 199;
  const listPrice = item ? item.list_price : 499;
  const rentPrice = item && 'rent_price' in item && item.rent_price
    ? item.rent_price
    : Math.round(buyPrice * 0.25);
  const subPrice = 199;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmPurchase(item, itemType, selectedAccess);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1976D2] via-[#1565C0] to-[#0D47A1] text-white p-4 sm:p-5 relative flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-tertiary text-[11px] font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ExamKart Quick Checkout (Demo Mode)</span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight line-clamp-1">
              {itemType === 'subscription' ? 'Monthly Subscription Pass' : item?.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-800">

          {/* Product Banner info */}
          {item && itemType !== 'subscription' && (
            <div className="bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 flex items-center gap-3">
              <div className="w-12 h-14 bg-[#1976D2] text-white font-bold rounded-xl flex items-center justify-center shrink-0 shadow-xs text-xs">
                {item.category}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <span className="text-[10px] font-extrabold uppercase bg-tertiary text-slate-950 px-2 py-0.5 rounded-md">
                  {item.category} • {itemType.toUpperCase()}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-1">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  {item.seo_description}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
              Choose Access Plan
            </label>
            <p className="text-[11px] text-slate-500">Select how you want to unlock this item</p>
          </div>

          {/* Plan Option 1: Buy Lifetime */}
          {itemType !== 'subscription' && (
            <div
              onClick={() => setSelectedAccess('lifetime')}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                selectedAccess === 'lifetime'
                  ? 'border-secondary bg-secondary-light/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedAccess === 'lifetime' ? 'border-secondary bg-secondary text-white' : 'border-slate-300'
                  }`}>
                    {selectedAccess === 'lifetime' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-slate-900">Buy a Product (Lifelong)</span>
                      <span className="text-[9px] font-extrabold bg-secondary text-white px-1.5 py-0.5 rounded">
                        LIFELONG
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                      Lifelong access • Added to Purchased page forever
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm sm:text-base font-black text-slate-900">₹{buyPrice}</span>
                  {listPrice > buyPrice && (
                    <span className="block text-[10px] text-slate-400 line-through">₹{listPrice}</span>
                  )}
                </div>
              </div>

              {/* Status badges for option 1 */}
              <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap gap-2 text-[10px] font-bold text-slate-700">
                <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 text-secondary">
                  <Download className="w-3 h-3 text-secondary" /> Offline Download Ready
                </span>
                <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                  <Wifi className="w-3 h-3 text-slate-500" /> Online Access
                </span>
              </div>
            </div>
          )}

          {/* Plan Option 2: Rent 30 Days */}
          {itemType !== 'subscription' && (
            <div
              onClick={() => setSelectedAccess('rent')}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                selectedAccess === 'rent'
                  ? 'border-primary bg-primary-light/30 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedAccess === 'rent' ? 'border-primary bg-primary text-white' : 'border-slate-300'
                  }`}>
                    {selectedAccess === 'rent' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-slate-900">Rent a Product (30 Days)</span>
                      <span className="text-[9px] font-extrabold bg-primary text-white px-1.5 py-0.5 rounded">
                        30 DAYS
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                      30 days online validity • Auto prompt renewal after expiry
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm sm:text-base font-black text-slate-900">₹{rentPrice}</span>
                </div>
              </div>

              {/* Status badges for option 2 */}
              <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap gap-2 text-[10px] font-bold">
                <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 text-primary">
                  <Wifi className="w-3 h-3 text-primary" /> Online Only
                </span>
                <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                  <Clock className="w-3 h-3 text-slate-500" /> No Offline Download
                </span>
              </div>
            </div>
          )}

          {/* Plan Option 3: Monthly Subscription */}
          <div
            onClick={() => setSelectedAccess('subscription')}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
              selectedAccess === 'subscription'
                ? 'border-tertiary bg-tertiary-light/40 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedAccess === 'subscription' ? 'border-slate-900 bg-tertiary text-slate-950' : 'border-slate-300'
                }`}>
                  {selectedAccess === 'subscription' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-900">Monthly Subscription Pass</span>
                    <span className="text-[9px] font-black bg-tertiary text-slate-950 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5" /> ALL ACCESS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    Access ALL products online for 1 month
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm sm:text-base font-black text-slate-900">₹{subPrice}/mo</span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-900">
                <Zap className="w-3 h-3 text-secondary" /> All Courses & Books Included
              </span>
              <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 text-primary">
                <Wifi className="w-3 h-3 text-primary" /> Online Only
              </span>
            </div>
          </div>

          {/* Guarantee Footer */}
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1">
            <div className="flex items-center gap-1 text-secondary">
              <ShieldCheck className="w-4 h-4" />
              <span>Instant Unlocking • Demo Payment</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <CreditCard className="w-4 h-4" />
              <span>Test Checkout</span>
            </div>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="flex-2 py-3 px-5 rounded-xl bg-[#1976D2] hover:bg-[#1565C0] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active-press cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-tertiary fill-tertiary" />
            <span>
              {isProcessing
                ? 'Processing Demo Pay...'
                : `Pay ${selectedAccess === 'lifetime' ? `₹${buyPrice}` : selectedAccess === 'rent' ? `₹${rentPrice}` : `₹${subPrice}`} & Unlock`}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
