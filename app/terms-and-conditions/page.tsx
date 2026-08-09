import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | Exam Kart',
  description: 'Terms of service and user license agreement for Exam Kart.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Exam Kart</span>
          </Link>
          <span className="text-xs font-semibold text-slate-500">Legal & Governance</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Terms & Conditions</h1>
              <p className="text-xs text-slate-500">User License Agreement • Last updated: August 2026</p>
            </div>
          </div>

          <div className="prose prose-slate prose-sm max-w-none text-xs sm:text-sm leading-relaxed space-y-4 text-slate-700">
            <p>
              By accessing or using <strong>Exam Kart</strong> (operated by <strong>Pardeep Kumar</strong> at <strong>https://exam-kart.com/</strong>), you agree to comply with and be bound by the following Terms & Conditions.
            </p>

            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mt-4">1. Digital Content & Access Modes</h2>
            <p>
              Exam Kart offers digital study materials including mock tests, e-books (PDF and HTML/EPUB formats), and bundles under specified access models:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Lifelong Access (Buy):</strong> Unlimited online reading and offline PDF/content download for personal study.</li>
              <li><strong>Rent (30 Days):</strong> Access granted for 30 consecutive calendar days from the date of purchase (Online only).</li>
              <li><strong>Monthly All-Access Subscription:</strong> Unlocks all books and exam series as long as the subscription remains active.</li>
            </ul>

            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mt-4">2. Intellectual Property & Fair Use</h2>
            <p>
              All test questions, e-books, solutions, design layouts, and software engines are the exclusive property of <strong>Pardeep Kumar / Exam Kart</strong>. Sharing account credentials, unauthorized resale, or public distribution of PDF files is strictly prohibited.
            </p>

            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mt-4">3. Account Integrity & Modifications</h2>
            <p>
              Exam Kart reserves the right to terminate accounts found engaging in fraudulent payment activities or unauthorized scraping. Content updates and test series modifications may occur periodically to match updated exam patterns.
            </p>

            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mt-4">4. Legal Contact & Publisher Details</h2>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1 mt-2">
              <p><strong>Legal Name:</strong> Pardeep Kumar</p>
              <p><strong>Brand Name:</strong> Exam Kart</p>
              <p><strong>Support Email:</strong> support@exam-kart.com</p>
              <p><strong>Registered Address:</strong> 282, Sector 4, Hisar Haryana 125001</p>
              <p><strong>Official Website:</strong> https://exam-kart.com/</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
