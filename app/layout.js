import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { cairo } from '@/lib/font';
import Header from '@/components/Header';
import Providers from './providers';
import Head from 'next/head';

export const metadata = {
  title: 'ATHAR-أثر',
  description: 'منصة لإدارة مكتبتك الشخصية من الكتب الإسلامية والتاريخية',
  keywords: 'مكتبة رقمية, كتب إسلامية, كتب تاريخية, إدارة القراءة, اكتشاف الكتب',
  authors: [{ name: 'Beshir_Swed', url: 'https://github.com/beshirswed1' }],
  openGraph: {
    title: 'ATHAR-أثر',
    description: 'منصة لإدارة مكتبتك الشخصية من الكتب الإسلامية والتاريخية',
    url: 'https://athar-one.vercel.app/',
    siteName: 'ATHAR-أثر',
    images: [
      {
        url: '/favicon.ico',
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
      <Head>
        <meta name="google-site-verification" content="dqhN748HP8GBqqvVMC9Y_npHTidyMjhjWbdVhZwQUZA" />
      </Head>
      <body className={`${cairo.className} bg-amber-50 text-amber-900 min-h-screen`}>
        <Providers>
          <Header />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
