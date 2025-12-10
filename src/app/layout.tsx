import './globals.css';
import type { Metadata } from 'next';
import { Anek_Latin, DM_Sans } from 'next/font/google';

const anekLatin = Anek_Latin({
  subsets: ['latin'],
  variable: '--font-anek',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Altim Video Academy',
  description: 'Formación de consultores SAP',
};

import { NextAuthProvider } from '@/components/Providers';
import { Footer } from '@/components/Footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${anekLatin.variable} ${dmSans.variable}`}>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NextAuthProvider>
          {children}
          <Footer />
        </NextAuthProvider>
      </body>
    </html>
  );
}
