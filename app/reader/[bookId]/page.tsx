'use client';

import React, { Suspense } from 'react';
import PDFReader from '@/components/PDFReader';
import { Loader2 } from 'lucide-react';

function ReaderContent() {
  return <PDFReader />;
}

export default function ReaderPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-slate-900 text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1976D2]" />
        <p className="text-xs font-semibold">Loading ExamKart PDF Reader...</p>
      </div>
    }>
      <ReaderContent />
    </Suspense>
  );
}
