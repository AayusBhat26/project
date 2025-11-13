import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { OnlineStatusProvider } from '@/components/OnlineStatusProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Productivity Hub - All-in-One PWA',
  description: 'Task manager, notes, expenses, habits, and weather in one powerful PWA',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Productivity Hub',
  },
  icons: {
    icon: '/icon-192x192.svg',
    apple: '/icon-192x192.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <Providers>
          <OnlineStatusProvider>
            {children}
          </OnlineStatusProvider>
        </Providers>
      </body>
    </html>
  );
}
