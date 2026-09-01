'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ReportFilterToolbar({
  initialDate,
  initialClientId,
  clients,
}: {
  initialDate: string;
  initialClientId?: string;
  clients: Array<{ id: number; client_name: string; client_code: string }>;
}) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [clientId, setClientId] = useState(initialClientId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (date) query.set('date', date);
    if (clientId) query.set('client_id', clientId);
    router.push(`/reports/daily?${query.toString()}`);
  };

  return (
    <div className="glass-panel p-3.5">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2.5 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Tanggal:</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Bank:</span>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium"
          >
            <option value="">Semua Bank Klien</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.client_name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="px-3.5 py-1 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-medium transition hover:opacity-90"
        >
          Tampilkan Laporan
        </button>
      </form>
    </div>
  );
}
