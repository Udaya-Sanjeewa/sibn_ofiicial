import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SIBN Ecommerce - Sri Lanka\'s Largest Online Marketplace',
  description: 'Buy and sell everything from cars to electronics, property to fashion. Join millions of users on Sri Lanka\'s most trusted marketplace.',
  keywords: 'Sri Lanka marketplace, buy sell, cars, electronics, property, fashion, jobs, classified ads',
  authors: [{ name: 'SIBN Ecommerce' }],
  creator: 'SIBN Ecommerce',
  publisher: 'SIBN Ecommerce',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sibn-ecommerce.lk'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SIBN Ecommerce - Sri Lanka\'s Largest Online Marketplace',
    description: 'Buy and sell everything from cars to electronics, property to fashion. Join millions of users on Sri Lanka\'s most trusted marketplace.',
    url: 'https://sibn-ecommerce.lk',
    siteName: 'SIBN Ecommerce',
    locale: 'en_LK',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SIBN Ecommerce - Sri Lanka\'s Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SIBN Ecommerce - Sri Lanka\'s Largest Online Marketplace',
    description: 'Buy and sell everything from cars to electronics, property to fashion.',
    images: ['/og-image.jpg'],
    creator: '@sibnecommerce',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#1e40af" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <Toaster position="top-right" />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}