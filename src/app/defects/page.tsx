import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { StatusBadge } from '@/components/StatusBadge';
import { SeverityBadge } from '@/components/SeverityBadge';

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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Daftar Defect Multi-Bank
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pelacakan dan audit tiket cacat perangkat lunak perbankan PT Sarana Pactindo
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/defects/kanban"
            className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Tampilan Kanban
          </Link>

          {['QC', 'LEAD', 'PM'].includes(currentUser?.role || '') && (
            <Link
              href="/defects/create"
              className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-medium text-white transition"
            >
              + Defect Baru
            </Link>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-3.5">
        <form method="GET" action="/defects" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <div className="lg:col-span-2">
            <input
              type="text"
              name="search"
              defaultValue={search || ''}
              placeholder="Cari tiket, judul, deskripsi..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <select
              name="client_id"
              defaultValue={clientId || ''}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
            >
              <option value="">Semua Bank</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.client_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              name="status"
              defaultValue={status || ''}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
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
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
            >
              <option value="">Semua Severity</option>
              <option value="Blocker">Blocker</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-medium transition"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="glass-panel p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                <th className="pb-2.5">Tiket</th>
                <th className="pb-2.5">Bank</th>
                <th className="pb-2.5">Judul &amp; Modul</th>
                <th className="pb-2.5">Severity</th>
                <th className="pb-2.5">Env</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">PIC Dev</th>
                <th className="pb-2.5">QC Reporter</th>
                <th className="pb-2.5">Tanggal</th>
                <th className="pb-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {defects.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Tidak ada defect ditemukan.
                  </td>
                </tr>
              ) : (
                defects.map((d: any) => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="py-2.5 font-mono text-slate-700 dark:text-slate-300 font-semibold">{d.ticket_number}</td>
                    <td className="py-2.5 font-medium text-slate-900 dark:text-white">{d.client_name}</td>
                    <td className="py-2.5 max-w-xs">
                      <Link href={`/defects/${d.id}`} className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition line-clamp-1">
                        {d.title}
                      </Link>
                      <div className="text-[11px] text-slate-400 truncate">
                        {d.project_name} &bull; {d.module_name}
                      </div>
                    </td>
                    <td className="py-2.5">
                      <SeverityBadge severity={d.severity} />
                    </td>
                    <td className="py-2.5">
                      <span className="text-[11px] text-slate-500 font-mono">
                        {d.environment}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={d.status} reopenCount={d.reopen_count} />
                    </td>
                    <td className="py-2.5 text-slate-700 dark:text-slate-300">
                      {d.dev_name || <span className="text-slate-400">Unassigned</span>}
                    </td>
                    <td className="py-2.5 text-slate-700 dark:text-slate-300">{d.qc_name}</td>
                    <td className="py-2.5 text-[11px] text-slate-400">
                      {new Date(d.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-2.5 text-right">
                      <Link
                        href={`/defects/${d.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Detail &rarr;
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
