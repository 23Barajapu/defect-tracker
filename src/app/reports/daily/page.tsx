import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import {
  FileText,
  Printer,
  Download,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { SeverityBadge } from '@/components/SeverityBadge';

export const dynamic = 'force-dynamic';

export default async function DailyReportPage({
  searchParams,
}: {
  searchParams: { date?: string; client_id?: string };
}) {
  const date = searchParams.date || new Date().toISOString().slice(0, 10);
  const clientId = searchParams.client_id;

  // 1. Ringkasan Metrik
  const [newOpenRes]: any = await query('SELECT COUNT(*) as total FROM defects WHERE DATE(created_at) = ?', [date]);
  const [readyRetestRes]: any = await query('SELECT COUNT(*) as total FROM defects WHERE status = "Retesting"');
  const [reopenRes]: any = await query('SELECT COUNT(*) as total FROM defect_activities WHERE to_status = "Re-open" AND DATE(created_at) = ?', [date]);
  const [closedRes]: any = await query('SELECT COUNT(*) as total FROM defect_activities WHERE to_status = "Close" AND DATE(created_at) = ?', [date]);

  const newOpenToday = Number(newOpenRes?.total || 0);
  const readyForRetest = Number(readyRetestRes?.total || 0);
  const reopenedToday = Number(reopenRes?.total || 0);
  const closedToday = Number(closedRes?.total || 0);

  // 2. Daftar Defect pada tanggal cutoff
  let sql = `
    SELECT d.*, m.module_name, p.name as project_name, p.platform, c.client_name, c.client_code,
           u_qc.name as qc_name, u_dev.name as dev_name
    FROM defects d
    JOIN modules m ON d.module_id = m.id
    JOIN projects p ON m.project_id = p.id
    JOIN clients c ON p.client_id = c.id
    JOIN users u_qc ON d.qc_id = u_qc.id
    LEFT JOIN users u_dev ON d.dev_id = u_dev.id
    WHERE (DATE(d.created_at) = ? OR DATE(d.updated_at) = ?)
  `;
  const params: any[] = [date, date];
  if (clientId) {
    sql += ' AND c.id = ?';
    params.push(clientId);
  }
  sql += ' ORDER BY c.client_name ASC, d.id DESC';

  const defects: any = await query(sql, params);
  const clients: any = await query('SELECT id, client_name, client_code FROM clients ORDER BY client_name ASC');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Daily QA Defect Report (Cutoff 17:00)
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Rekapitulasi progres pengujian harian multi-bank otomatis PT Sarana Pactindo (FR-08, FR-09)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/reports/pdf?date=${date}${clientId ? `&client_id=${clientId}` : ''}`}
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Cetak PDF Resmi (Kop Surat)
          </Link>
          <a
            href={`/api/reports/export-csv${clientId ? `?client_id=${clientId}` : ''}`}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-xs font-bold text-slate-800 dark:text-white transition flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Export CSV / Excel
          </a>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4">
        <form method="GET" action="/reports/daily" className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              name="date"
              defaultValue={date}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 font-bold"
            />
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              name="client_id"
              defaultValue={clientId || ''}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
            >
              <option value="">Semua Bank Klien</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.client_name} ({c.client_code})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold transition"
          >
            Tampilkan Laporan
          </button>
        </form>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 border-l-4 border-l-blue-500">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">New Open ({date})</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{newOpenToday}</div>
        </div>
        <div className="glass-panel p-4 border-l-4 border-l-purple-500">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Ready For Retest</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{readyForRetest}</div>
        </div>
        <div className="glass-panel p-4 border-l-4 border-l-red-500">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Re-opened ({date})</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{reopenedToday}</div>
        </div>
        <div className="glass-panel p-4 border-l-4 border-l-emerald-500">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Closed ({date})</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{closedToday}</div>
        </div>
      </div>

      {/* Defects Table Report */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-white/10">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Tabel Aktivitas Defect ({defects.length} Tiket)
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cutoff Pukul 17:00 WIB</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                <th className="pb-3">Tiket</th>
                <th className="pb-3">Bank Klien</th>
                <th className="pb-3">Proyek &amp; Modul</th>
                <th className="pb-3">Judul Masalah</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">QC Reporter</th>
                <th className="pb-3">PIC Dev</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {defects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                    Tidak ada aktivitas defect pada tanggal {date}.
                  </td>
                </tr>
              ) : (
                defects.map((d: any) => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                    <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">{d.ticket_number}</td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{d.client_name}</td>
                    <td className="py-3 text-slate-700 dark:text-slate-300 font-medium">
                      <div className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-purple-500" /> {d.project_name} &rsaquo; {d.module_name}
                      </div>
                    </td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white max-w-xs truncate">{d.title}</td>
                    <td className="py-3"><SeverityBadge severity={d.severity} /></td>
                    <td className="py-3"><StatusBadge status={d.status} reopenCount={d.reopen_count} /></td>
                    <td className="py-3 text-slate-700 dark:text-slate-300 font-medium">{d.qc_name}</td>
                    <td className="py-3 text-slate-700 dark:text-slate-300 font-medium">{d.dev_name || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
