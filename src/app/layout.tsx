import React from 'react';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { NotificationToast } from '@/components/NotificationToast';
import { getSession } from '@/lib/auth';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Universal Multi-Bank Defect Tracking & Daily Reporting Engine - PT Sarana Pactindo',
  description: 'Sistem pelacakan bug perbankan multi-klien dan otomasi pelaporan harian QA.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = getSession();

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased flex flex-col min-h-screen">
        <ThemeProvider>
          <Navbar currentUser={currentUser} />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-white/10 light:border-slate-200 py-6 px-4 text-center text-xs text-slate-500 light:text-slate-400">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                <strong>PT Sarana Pactindo</strong> &bull; Universal Multi-Bank Defect Tracking & Daily Reporting Engine
              </div>
              <div>
                PCI-DSS Masking Active &bull; Real-time SSE Channel &bull; SLA &lt; 2s
              </div>
            </div>
          </footer>
          <NotificationToast />
        </ThemeProvider>
      </body>
    </html>
  );
}
