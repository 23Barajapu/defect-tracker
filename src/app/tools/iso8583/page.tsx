import React from 'react';
import { IsoInspector } from '@/components/IsoInspector';
import { Binary, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function IsoToolsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2.5">
            <Binary className="w-6 h-6 text-blue-400" /> ISO 8583 Visual Inspector &amp; Sanitizer
          </h1>
          <p className="text-xs text-slate-400 light:text-slate-500 mt-1">
            Alat bantu pengujian transaksi perbankan nasional (BI-FAST, QRIS, ATM/POS Switching, ISO 8583 standard)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> PCI-DSS Level 1 Ready
          </span>
        </div>
      </div>

      <IsoInspector />
    </div>
  );
}
