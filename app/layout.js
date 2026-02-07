import './globals.css';
import { cairo } from '@/lib/font';
import Header from '@/components/Header';
import Providers from './providers';
import { icons } from 'lucide-react';

export const metadata = {
  title: 'ATHAR-أثر',
  description: 'منصة لإدارة مكتبتك الشخصية من الكتب الإسلامية والتاريخية',
  keywords: 'مكتبة رقمية, كتب إسلامية, كتب تاريخية, إدارة القراءة, اكتشاف الكتب',
  authors: [{ name: 'Beshir_Swed', url: 'https://github.com/beshirswed1' }],
  opensGraph: {
    title: 'ATHAR-أثر',
    description: 'منصة لإدارة مكتبتك الشخصية من الكتب الإسلامية والتاريخية',
    url: 'https://athar-one.vercel.app/',
    siteName: 'ATHAR-أثر',
    images: [
      {
        url: '/app/favicon.ico',
        width: 1200,
        height: 630,
        alt: 'ATHAR-أثر - منصة لإدارة مكتبتك الشخصية'
      }
    ],
    locale: 'ar_AR',
    type: 'website'


  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'icon',
      url: '/favicon.ico',
    },
  },







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
