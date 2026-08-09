import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MapPin, Globe } from 'lucide-react';

export const metadata = {
  title: 'Contact Us | Exam Kart',
  description: 'Get in touch with Exam Kart customer support and inquiries.',
};

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Exam Kart</span>
          </Link>
          <span className="text-xs font-semibold text-slate-500">Customer Support</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Contact Us</h1>
              <p className="text-xs text-slate-500">We are here to assist you with mock tests, subscriptions & e-books</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Official Contact Details</h2>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-slate-900">Email Address</span>
                    <a href="mailto:support@exam-kart.com" className="text-blue-600 hover:underline">support@exam-kart.com</a>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-slate-900">Registered Office Address</span>
                    <p className="text-slate-600">282, Sector 4, Hisar Haryana 125001, India</p>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Globe className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-slate-900">Official Portal</span>
                    <a href="https://exam-kart.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://exam-kart.com/</a>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Legal Entity & Publisher</h2>
              <div className="space-y-1.5 text-xs text-slate-700">
                <p><strong>Legal Name:</strong> Pardeep Kumar</p>
                <p><strong>Brand:</strong> Exam Kart</p>
                <p><strong>Support Hours:</strong> Monday – Saturday (9:00 AM – 6:00 PM IST)</p>
                <p className="text-slate-500 text-[11px] pt-2">For inquiries regarding book downloads, mock test access, or payment issues, please drop us an email with your transaction reference.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
