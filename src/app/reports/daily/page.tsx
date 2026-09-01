import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { StatusBadge } from '@/components/StatusBadge';
import { SeverityBadge } from '@/components/SeverityBadge';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  RotateCcw,
  AlertOctagon,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DailyReportPage({
  searchParams,
}: {
  searchParams: { date?: string; client_id?: string };
}) {
  const currentUser = getSession();
  const selectedDate = searchParams.date || new Date().toISOString().slice(0, 10);
  const clientId = searchParams.client_id;

  const clients: any = await query('SELECT id, client_name, client_code FROM clients ORDER BY client_name ASC');

  // Ringkasan Hari Ini
  const [newOpenRes]: any = await query('SELECT COUNT(*) as total FROM defects WHERE DATE(created_at) = ?', [selectedDate]);
  const [readyRetestRes]: any = await query('SELECT COUNT(*) as total FROM defects WHERE status = "Retesting"');
  const [reopenRes]: any = await query('SELECT COUNT(*) as total FROM defect_activities WHERE to_status = "Re-open" AND DATE(created_at) = ?', [selectedDate]);
  const [closedRes]: any = await query('SELECT COUNT(*) as total FROM defect_activities WHERE to_status = "Close" AND DATE(created_at) = ?', [selectedDate]);
  const [totalOutRes]: any = await query('SELECT COUNT(*) as total FROM defects WHERE status IN ("Open", "Retesting", "Re-open")');

  let reportSql = `
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
  const reportParams: any[] = [selectedDate, selectedDate];

  if (clientId) {
    reportSql += ' AND c.id = ?';
    reportParams.push(clientId);
  }
  reportSql += ' ORDER BY c.client_name ASC, d.id DESC';

  const defects: any = await query(reportSql, reportParams);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-400" /> Rekapitulasi Laporan Harian QA (FR-09)
          </h1>
          <p className="text-xs text-slate-400 light:text-slate-500 mt-1">
            Otomasi ringkasan progres pengujian cut-off 17:00 WIB untuk Project Manager & Manajemen
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/api/reports/export-csv${clientId ? `?client_id=${clientId}` : ''}`}
            download
            className="px-4 py-2 rounded-xl border border-white/10 light:border-slate-200 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 light:text-slate-800 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-blue-400" /> Export CSV / Excel
          </a>

          <Link
            href={`/reports/pdf?date=${selectedDate}${clientId ? `&client_id=${clientId}` : ''}`}
            target="_blank"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Cetak PDF Formal (Kop Surat)
          </Link>
        </div>
      </div>

      {/* Date & Bank Filter */}
      <div className="glass-panel p-4">
        <form method="GET" action="/reports/daily" className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              name="date"
              defaultValue={selectedDate}
              className="bg-slate-950 border border-white/15 rounded-xl py-1.5 px-3 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              name="client_id"
              defaultValue={clientId || ''}
              className="bg-slate-950 border border-white/15 rounded-xl py-1.5 px-3 text-xs text-white outline-none focus:border-emerald-500"
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
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
          >
            Tampilkan Laporan
          </button>
        </form>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="glass-panel p-4 border-l-4 border-l-blue-500">
          <div className="text-[11px] text-slate-400 font-bold uppercase">New Open</div>
          <div className="text-2xl font-black text-white light:text-slate-900 mt-1">{newOpenRes?.total || 0}</div>
        </div>
        <div className="glass-panel p-4 border-l-4 border-l-purple-500">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Ready for Retest</div>
          <div className="text-2xl font-black text-white light:text-slate-900 mt-1">{readyRetestRes?.total || 0}</div>
        </div>
        <div className="glass-panel p-4 border-l-4 border-l-red-500">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Re-opened</div>
          <div className="text-2xl font-black text-white light:text-slate-900 mt-1">{reopenRes?.total || 0}</div>
        </div>
        <div className="glass-panel p-4 border-l-4 border-l-emerald-500">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Closed Today</div>
          <div className="text-2xl font-black text-white light:text-slate-900 mt-1">{closedRes?.total || 0}</div>
        </div>
        <div className="glass-panel p-4 border-l-4 border-l-amber-500 col-span-2 sm:col-span-1">
          <div className="text-[11px] text-amber-400 font-bold uppercase">Outstanding Active</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{totalOutRes?.total || 0}</div>
        </div>
      </div>

      {/* Daily Cutoff Table */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <h3 className="font-extrabold text-sm text-white light:text-slate-900">
            Daftar Aktivitas Defect Tanggal {new Date(selectedDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}
          </h3>
          <span className="text-xs text-slate-400 font-mono">{defects.length} Tiket</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase font-bold text-[10px]">
                <th className="pb-3">Tiket</th>
                <th className="pb-3">Bank Klien</th>
                <th className="pb-3">Judul Permasalahan</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">PIC Dev</th>
                <th className="pb-3">QC Reporter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {defects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Tidak ada pergerakan defect pada tanggal ini.
                  </td>
                </tr>
              ) : (
                defects.map((d: any) => (
                  <tr key={d.id} className="hover:bg-white/5 transition">
                    <td className="py-3 font-mono font-bold text-blue-400">{d.ticket_number}</td>
                    <td className="py-3 font-semibold text-slate-300">{d.client_name}</td>
                    <td className="py-3 max-w-sm">
                      <div className="font-bold text-white light:text-slate-900">{d.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{d.project_name} &rsaquo; {d.module_name}</div>
                    </td>
                    <td className="py-3"><SeverityBadge severity={d.severity} /></td>
                    <td className="py-3"><StatusBadge status={d.status} reopenCount={d.reopen_count} /></td>
                    <td className="py-3 text-slate-300">{d.dev_name || '-'}</td>
                    <td className="py-3 text-slate-300">{d.qc_name}</td>
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
