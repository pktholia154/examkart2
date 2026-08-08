'use client';

import React, { useState } from 'react';
import { X, Database, CheckCircle2, AlertCircle, RefreshCw, Server, Layers } from 'lucide-react';
import { seedExamKartDatabase } from '@/lib/examkart-engine';

interface SeedDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export function SeedDataDialog({
  isOpen,
  onClose,
  onRefreshData
}: SeedDataDialogProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; count: number } | null>(null);

  if (!isOpen) return null;

  const handleSeed = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await seedExamKartDatabase();
      setResult(res);
      onRefreshData();
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Seeding failed',
        count: 0
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-[#1a237e] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#ff8f00]" />
            <h3 className="font-bold text-base">Seed Firebase Database</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
            <p>
              This action will seed the sample collections into your Firebase Firestore database ID <strong className="text-slate-900 font-mono">examkart</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-700 font-medium">
              <li><code className="text-[#1a237e] font-mono">/exam_categories</code> (SSC, Banking, Teaching...)</li>
              <li><code className="text-[#1a237e] font-mono">/exams</code> (Online mock test series & video classes)</li>
              <li><code className="text-[#1a237e] font-mono">/books</code> (E-Books, theory handbooks & PDF files)</li>
              <li><code className="text-[#1a237e] font-mono">/bundles</code> (Combo packs & Mahapacks)</li>
            </ul>
          </div>

          {/* Status Message Box */}
          {result && (
            <div
              className={`p-3.5 rounded-xl border text-xs leading-normal flex items-start gap-2.5 ${
                result.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">{result.success ? 'Success!' : 'Notice'}</p>
                <p>{result.message}</p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Close
            </button>

            <button
              onClick={handleSeed}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#ff8f00] hover:bg-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition active-press shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Seeding Firestore...</span>
                </>
              ) : (
                <>
                  <Server className="w-4 h-4" />
                  <span>Seed Firebase &apos;examkart&apos; DB</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
