import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Exam Kart',
  description: 'Privacy Policy and data protection guidelines for Exam Kart.',
};

export default function PrivacyPolicyPage() {
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
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Privacy Policy</h1>
              <p className="text-xs text-slate-500">Data Protection Guidelines • Last updated: August 2026</p>
            </div>
          </div>

          <div className="prose prose-slate prose-sm max-w-none text-xs sm:text-sm leading-relaxed space-y-4 text-slate-700">
            <p>
              Welcome to <strong>Exam Kart</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), operated by <strong>Pardeep Kumar</strong>. We respect your privacy and are committed to protecting the personal data you share with us when accessing our website (<strong>https://exam-kart.com/</strong>), mobile-optimized platform, digital e-books, subscriptions, and mock test series.
            </p>

            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mt-4">1. Information We Collect</h2>
            <p>
              We collect information to provide better services to all our users. The types of information we collect include:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Personal Details:</strong> Name, email address, phone number, and billing information provided during signup or purchase.</li>
              <li><strong>Usage & Progress Data:</strong> Exam scores, mock test analytics, reading progress, and saved offline entitlements.</li>
              <li><strong>Technical Data:</strong> Device info, IP address, browser type, and operating system logs for security and analytical purposes.</li>
            </ul>

            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mt-4">2. How We Use Your Information</h2>
            <p>Your information is used strictly for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Fulfilling digital purchases, e-book reader access, and mock test access.</li>
              <li>Managing validity periods (Lifelong, 30-Day Rent, or Monthly Subscriptions).</li>
              <li>Sending transaction updates, renewal alerts, and account notifications.</li>
              <li>Improving platform performance and test series features.</li>
            </ul>

            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mt-4">3. Data Sharing & Security</h2>
            <p>
              We do NOT sell, rent, or trade your personal data to third parties. We employ SHA-256 encrypted endpoints, HTTPS protocols, and cloud security rules to keep your data safe.
            </p>

            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mt-4">4. Contact Information</h2>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1 mt-2">
              <p><strong>Legal Name:</strong> Pardeep Kumar</p>
              <p><strong>Brand:</strong> Exam Kart</p>
              <p><strong>Email:</strong> support@exam-kart.com</p>
              <p><strong>Address:</strong> 282, Sector 4, Hisar Haryana 125001</p>
              <p><strong>Web:</strong> https://exam-kart.com/</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
