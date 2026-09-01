'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition flex items-center gap-1.5 cursor-pointer"
    >
      <Printer className="w-4 h-4" /> Cetak Sekarang / Simpan PDF
    </button>
  );
}
