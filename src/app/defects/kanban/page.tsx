import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { KanbanBoard } from '@/components/KanbanBoard';

export const dynamic = 'force-dynamic';

export default async function KanbanPage({
  searchParams,
}: {
  searchParams: { client_id?: string };
}) {
  const currentUser = getSession();
  const clientId = searchParams.client_id;

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
  sql += ' ORDER BY d.id DESC';

  const defects: any = await query(sql, params);
  const clients: any = await query('SELECT id, client_name, client_code FROM clients ORDER BY client_name ASC');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Kanban Board
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manajemen alur kerja defect perbankan (Open &rarr; Retesting &rarr; Re-open &rarr; Closed)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/defects"
            className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Tampilan Tabel
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

      {/* Filter by Bank */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">Filter Bank:</span>
        <div className="flex flex-wrap gap-1">
          <Link
            href="/defects/kanban"
            className={`px-2.5 py-1 rounded text-xs font-medium transition ${
              !clientId
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Semua Bank
          </Link>
          {clients.map((c: any) => (
            <Link
              key={c.id}
              href={`/defects/kanban?client_id=${c.id}`}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                clientId === String(c.id)
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {c.client_name}
            </Link>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard initialDefects={defects} currentUser={currentUser} />
    </div>
  );
}
