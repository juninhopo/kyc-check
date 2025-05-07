import type { Metadata } from 'next';
import { inter, montserrat } from './fonts';
import ThemeProvider from '@/components/providers/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Validador Facial KYC',
  description: 'Sistema de validação facial para processos KYC',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/css/tailwind.css" />
      </head>
      <body className="min-h-screen font-sans">
        <ThemeProvider>
          <main className="w-full flex items-center justify-center">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}