import './globals.css';
import { cairo } from '@/lib/font';
import Header from '@/components/Header';
import Providers from './providers';

export const metadata = {
  title: 'ATHAR-أثر',
  description: 'منصة لإدارة مكتبتك الشخصية من الكتب الإسلامية والتاريخية',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} bg-amber-50 text-amber-900 min-h-screen`}>
        <Providers>
          <Header />
          <main className="container mx-auto px-4 py-8 max-w-6xl">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
