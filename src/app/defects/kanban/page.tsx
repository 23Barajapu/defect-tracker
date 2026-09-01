import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { KanbanBoard } from '@/components/KanbanBoard';
import { Kanban, Plus, Building2, Table, Sparkles } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Kanban className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-extrabold text-white light:text-slate-900 tracking-tight">
              Interactive Kanban Board
            </h1>
          </div>
          <p className="text-xs text-slate-400 light:text-slate-500">
            Tarik kartu defect antar kolom untuk mengubah status alur kerja (State Machine Controlled)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/defects"
            className="px-3.5 py-2 rounded-xl border border-white/10 light:border-slate-200 bg-white/5 light:bg-slate-100 hover:bg-white/10 text-xs font-bold text-slate-200 light:text-slate-800 transition flex items-center gap-1.5"
          >
            <Table className="w-3.5 h-3.5 text-blue-400" /> Mode Tabel
          </Link>

          {['QC', 'LEAD', 'PM'].includes(currentUser?.role || '') && (
            <Link
              href="/defects/create"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Defect Baru
            </Link>
          )}
        </div>
      </div>

      {/* Filter by Bank Pills */}
      <div className="glass-panel p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold pl-1">
          <Building2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Filter Bank:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Link
            href="/defects/kanban"
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              !clientId
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            Semua Bank
          </Link>
          {clients.map((c: any) => (
            <Link
              key={c.id}
              href={`/defects/kanban?client_id=${c.id}`}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                clientId === String(c.id)
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
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
