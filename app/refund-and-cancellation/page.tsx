import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export const metadata = {
  title: 'Refund & Cancellation Policy | Exam Kart',
  description: 'Refund, return, and cancellation terms for Exam Kart purchases.',
};

export default function RefundAndCancellationPage() {
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
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Refund & Cancellation Policy</h1>
              <p className="text-xs text-slate-500">Returns, Refunds & Renewal Guidelines • Last updated: August 2026</p>
            </div>
          </div>

          <div className="prose prose-slate prose-sm max-w-none text-xs sm:text-sm leading-relaxed space-y-4 text-slate-700">
            <p>
              At <strong>Exam Kart</strong> (operated by <strong>Pardeep Kumar</strong>), we strive to deliver high-quality digital mock tests and study materials. Please review our policies regarding digital purchases, rentals, and monthly subscriptions.
            </p>

            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mt-4">1. Digital Goods Non-Refundability</h2>
            <p>
              Due to the immediate access nature of digital books, e-book readers, sample preview options, and online test series, purchases are generally non-refundable once unlocked or downloaded.
            </p>

            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mt-4">2. Eligible Refund Exceptions</h2>
            <p>Refunds may be processed under the following specific circumstances:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Duplicate Transaction:</strong> You were charged twice for the exact same product within 24 hours.</li>
              <li><strong>Technical Access Failure:</strong> Verified server failure preventing access to paid digital materials for over 48 hours without resolution.</li>
            </ul>

            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mt-4">3. Subscriptions & Renewal Cancellation</h2>
            <p>
              Monthly all-access pass subscriptions can be cancelled anytime before the next billing cycle. Upon cancellation, your access remains active until the current 30-day validity window expires.
            </p>

            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mt-4">4. Refund Request Process</h2>
            <p>
              To request a refund for a duplicate payment or technical defect, please email <strong>support@exam-kart.com</strong> with your transaction ID and account details within 7 days of purchase.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1 mt-2">
              <p><strong>Legal Entity:</strong> Pardeep Kumar (Exam Kart)</p>
              <p><strong>Email Support:</strong> support@exam-kart.com</p>
              <p><strong>Address:</strong> 282, Sector 4, Hisar Haryana 125001</p>
              <p><strong>Website:</strong> https://exam-kart.com/</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
