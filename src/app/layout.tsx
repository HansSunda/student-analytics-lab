import type { Metadata } from 'next';
import './globals.css';
import { TeachMeProvider } from '@/components/workspace/TeachMeContext';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'Student Analytics Lab | Workspace Analisis Data & Bisnis',
  description:
    'SaaS Workspace Analisis Data untuk Mahasiswa Bisnis, Manajemen, Akuntansi, dan Riset Akademis.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <TeachMeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </TeachMeProvider>
      </body>
    </html>
  );
}

