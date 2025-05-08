import type { Metadata } from 'next';
import { inter, montserrat } from './fonts';
import ThemeProvider from '@/components/providers/ThemeProvider';
import './styles.css';


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
    <html lang="pt-BR" className={`${inter.variable} ${montserrat.variable}`} >
      <body className="min-h-screen font-sans flex items-center justify-center">
        <ThemeProvider>
            {children}
        </ThemeProvider>
      </body>
    </html>
  );
}