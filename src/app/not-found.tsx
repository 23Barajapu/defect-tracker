import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Bug } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
        <Bug className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black text-white light:text-slate-900 tracking-tight">404 - Halaman Tidak Ditemukan</h1>
      <p className="text-xs text-slate-400 max-w-sm">
        Halaman atau tiket defect yang Anda tuju tidak ditemukan pada sistem.
      </p>
      <Link
        href="/dashboard"
        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg transition flex items-center gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
      </Link>
    </div>
  );
}
