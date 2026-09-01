import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { StatusBadge } from '@/components/StatusBadge';
import { SeverityBadge } from '@/components/SeverityBadge';
import {
  Bug,
  Plus,
  Kanban,
  Search,
  Building2,
  ExternalLink,
  Layers,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DefectsPage({
  searchParams,
}: {
  searchParams: { client_id?: string; status?: string; severity?: string; search?: string };
}) {
  const currentUser = getSession();
  const clientId = searchParams.client_id;
  const status = searchParams.status;
  const severity = searchParams.severity;
  const search = searchParams.search;

  let sql = `
    SELECT d.*, 
           m.module_name, 
           p.name as project_name, p.platform, 
           c.id as client_id, c.client_name, c.client_code,
           u_qc.name as qc_name,
           u_dev.name as dev_name
    FROM defects d
    JOIN modules m ON d.module_id = m.id
    JOIN projects p ON m.project_id = p.id
    JOIN clients c ON p.client_id = c.id
    JOIN users u_qc ON d.qc_id = u_qc.id
    LEFT JOIN users u_dev ON d.dev_id = u_dev.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (clientId) {
    sql += ' AND c.id = ?';
    params.push(clientId);
  }
  if (status) {
    sql += ' AND d.status = ?';
    params.push(status);
  }
  if (severity) {
    sql += ' AND d.severity = ?';
    params.push(severity);
  }
  if (search) {
    sql += ' AND (d.ticket_number LIKE ? OR d.title LIKE ? OR d.description LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  sql += ' ORDER BY d.id DESC';

  const defects: any = await query(sql, params);
  const clients: any = await query('SELECT id, client_name, client_code FROM clients ORDER BY client_name ASC');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Bug className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Daftar Defect Multi-Bank
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Manajemen tiket defect lintas platform perbankan PT Sarana Pactindo
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/defects/kanban"
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-xs font-bold text-slate-800 dark:text-white transition flex items-center gap-2 shadow-sm"
          >
            <Kanban className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Mode Kanban
          </Link>

          {['QC', 'LEAD', 'PM'].includes(currentUser?.role || '') && (
            <Link
              href="/defects/create"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Defect Baru
            </Link>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4">
        <form method="GET" action="/defects" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="search"
              defaultValue={search || ''}
              placeholder="Cari nomor tiket, judul, deskripsi..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <select
              name="client_id"
              defaultValue={clientId || ''}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
            >
              <option value="">Semua Bank Klien</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.client_name} ({c.client_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              name="status"
              defaultValue={status || ''}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="Open">Open</option>
              <option value="Retesting">Retesting</option>
              <option value="Re-open">Re-open</option>
              <option value="Close">Close</option>
            </select>
          </div>

          <div className="flex gap-2">
            <select
              name="severity"
              defaultValue={severity || ''}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 font-bold"
            >
              <option value="">Semua Severity</option>
              <option value="Blocker">Blocker</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Defects Table */}
      <div className="glass-panel p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                <th className="pb-3">Tiket &amp; Bank</th>
                <th className="pb-3">Judul &amp; Modul</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Env</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">PIC Dev</th>
                <th className="pb-3">QC Reporter</th>
                <th className="pb-3">Tgl Lapor</th>
                <th className="pb-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {defects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                    Tidak ada defect ditemukan untuk filter saat ini.
                  </td>
                </tr>
              ) : (
                defects.map((d: any) => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                    <td className="py-3">
                      <div className="font-mono font-bold text-blue-600 dark:text-blue-400">{d.ticket_number}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                        <Building2 className="w-3 h-3 text-slate-400" /> {d.client_name}
                      </div>
                    </td>
                    <td className="py-3 max-w-xs">
                      <Link href={`/defects/${d.id}`} className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition line-clamp-1">
                        {d.title}
                      </Link>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate font-medium">
                        <Layers className="w-3 h-3 text-purple-500" /> {d.project_name} &rsaquo; {d.module_name}
                      </div>
                    </td>
                    <td className="py-3">
                      <SeverityBadge severity={d.severity} />
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-700 dark:text-slate-300 font-bold">
                        {d.environment}
                      </span>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={d.status} reopenCount={d.reopen_count} />
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300 font-medium">
                      {d.dev_name || <span className="text-slate-400 italic">Belum ditugaskan</span>}
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300 font-medium">{d.qc_name}</td>
                    <td className="py-3 text-[11px] text-slate-500 dark:text-slate-400">
                      {new Date(d.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/defects/${d.id}`}
                        className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-[11px] font-bold inline-flex items-center gap-1 transition"
                      >
                        Detail <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
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
