'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PDFReader from '@/components/PDFReader';
import HTMLReader from '@/components/HTMLReader';
import { Loader2 } from 'lucide-react';

function ReaderContent() {
  const searchParams = useSearchParams();
  const format = searchParams?.get('format') || searchParams?.get('type');

  if (format === 'html') {
    return <HTMLReader />;
  }

  return <PDFReader />;
}

export default function DirectReaderPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-slate-900 text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1976D2]" />
        <p className="text-xs font-semibold">Loading ExamKart Reader...</p>
      </div>
    }>
      <ReaderContent />
    </Suspense>
  );
}
