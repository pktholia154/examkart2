'use client';

import React, { useState } from 'react';
import { BookItem } from '@/lib/types';
import PDFReader from '@/components/PDFReader';
import HTMLReader from '@/components/HTMLReader';

interface BookReaderModalProps {
  book: BookItem | null;
  isUnlocked: boolean;
  initialFormat?: 'pdf' | 'html';
  onClose: () => void;
  onBuy: () => void;
}

export function BookReaderModal({
  book,
  isUnlocked,
  initialFormat,
  onClose,
  onBuy
}: BookReaderModalProps) {
  const [activeFormat, setActiveFormat] = useState<'pdf' | 'html'>(() => {
    if (initialFormat) return initialFormat;
    // Auto-detect format preference: if book has html_file and no pdf_file, default to html
    const hasHtml = Boolean(book?.html_file || (book as any)?.htmlurl);
    const hasPdf = Boolean(book?.pdf_file || (book as any)?.pdfurl || book?.sample_file || (book as any)?.sampleurl);
    if (hasHtml && !hasPdf) return 'html';
    return 'pdf';
  });

  if (!book) return null;

  const hasHtmlVersion = Boolean(book.html_file || (book as any).htmlurl);
  const hasPdfVersion = Boolean(book.pdf_file || (book as any).pdfurl || book.sample_file || (book as any).sampleurl);

  if (activeFormat === 'html') {
    return (
      <HTMLReader
        bookId={book.id}
        initialUrl={isUnlocked ? (book.html_file || (book as any).htmlurl) : (book.sample_file || (book as any).sampleurl)}
        readType={isUnlocked ? "full" : "sample"}
        title={book.title}
        hasPdfVersion={hasPdfVersion}
        onClose={onClose}
        onBuy={onBuy}
        onSwitchToPdf={() => setActiveFormat('pdf')}
      />
    );
  }

  return (
    <PDFReader
      bookId={book.id}
      initialUrl={isUnlocked ? (book.pdf_file || (book as any).pdfurl) : (book.sample_file || (book as any).sampleurl)}
      readType={isUnlocked ? "full" : "sample"}
      title={book.title}
      onClose={onClose}
      onBuy={onBuy}
    />
  );
}
