import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'ExamKart - Exam & Book Preparation Portal',
  description: 'Online Test Series, Books, and Combo Bundles for Competitive Exams',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
