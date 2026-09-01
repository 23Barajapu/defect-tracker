import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import { StatusBadge } from '@/components/StatusBadge';
import { SeverityBadge } from '@/components/SeverityBadge';
import { ReportFilterToolbar } from '@/components/ReportFilterToolbar';

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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Daily QA Defect Report (Cutoff 17:00)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Rekapitulasi status pengujian harian otomatis multi-bank PT Sarana Pactindo
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/reports/pdf?date=${date}${clientId ? `&client_id=${clientId}` : ''}`}
            target="_blank"
            className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-medium text-white transition"
          >
            Cetak PDF Resmi
          </Link>
          <a
            href={`/api/reports/export-csv${clientId ? `?client_id=${clientId}` : ''}`}
            className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Export CSV / Excel
          </a>
        </div>
      </div>

      {/* Client-side Filter Toolbar */}
      <ReportFilterToolbar initialDate={date} initialClientId={clientId} clients={clients} />

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-panel p-3.5">
          <div className="text-[11px] font-medium text-slate-500 uppercase">New Open ({date})</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{newOpenToday}</div>
        </div>
        <div className="glass-panel p-3.5">
          <div className="text-[11px] font-medium text-slate-500 uppercase">Ready For Retest</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{readyForRetest}</div>
        </div>
        <div className="glass-panel p-3.5">
          <div className="text-[11px] font-medium text-slate-500 uppercase">Re-opened ({date})</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{reopenedToday}</div>
        </div>
        <div className="glass-panel p-3.5">
          <div className="text-[11px] font-medium text-slate-500 uppercase">Closed ({date})</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{closedToday}</div>
        </div>
      </div>

      {/* Defects Table Report */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200">
            Aktivitas Defect ({defects.length} Tiket)
          </h3>
          <span className="text-[11px] text-slate-400">Cutoff Pukul 17:00 WIB</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold text-[11px]">
                <th className="pb-2.5">Tiket</th>
                <th className="pb-2.5">Bank Klien</th>
                <th className="pb-2.5">Proyek &amp; Modul</th>
                <th className="pb-2.5">Judul Masalah</th>
                <th className="pb-2.5">Severity</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">QC Reporter</th>
                <th className="pb-2.5">PIC Dev</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {defects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada aktivitas defect pada tanggal {date}.
                  </td>
                </tr>
              ) : (
                defects.map((d: any) => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="py-2.5 font-mono font-medium text-slate-700 dark:text-slate-300">{d.ticket_number}</td>
                    <td className="py-2.5 font-medium text-slate-900 dark:text-white">{d.client_name}</td>
                    <td className="py-2.5 text-slate-500">
                      {d.project_name} &bull; {d.module_name}
                    </td>
                    <td className="py-2.5 font-medium text-slate-900 dark:text-white max-w-xs truncate">{d.title}</td>
                    <td className="py-2.5"><SeverityBadge severity={d.severity} /></td>
                    <td className="py-2.5"><StatusBadge status={d.status} reopenCount={d.reopen_count} /></td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300">{d.qc_name}</td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300">{d.dev_name || '-'}</td>
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
