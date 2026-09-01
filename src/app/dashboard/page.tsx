import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { StatusDoughnutChart, SeverityBarChart } from '@/components/Charts';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const currentUser = getSession();
  const today = new Date().toISOString().slice(0, 10);

  // FR-08: Metrics
  const [newOpenRes]: any = await query('SELECT COUNT(*) as total FROM defects WHERE DATE(created_at) = ?', [today]);
  const [readyRetestRes]: any = await query('SELECT COUNT(*) as total FROM defects WHERE status = "Retesting"');
  const [reopenRes]: any = await query('SELECT COUNT(*) as total FROM defect_activities WHERE to_status = "Re-open" AND DATE(created_at) = ?', [today]);
  const [closedRes]: any = await query('SELECT COUNT(*) as total FROM defect_activities WHERE to_status = "Close" AND DATE(created_at) = ?', [today]);
  const [totalOutRes]: any = await query('SELECT COUNT(*) as total FROM defects WHERE status IN ("Open", "Retesting", "Re-open")');

  const newOpenToday = Number(newOpenRes?.total || 0);
  const readyForRetest = Number(readyRetestRes?.total || 0);
  const reopenedToday = Number(reopenRes?.total || 0);
  const closedToday = Number(closedRes?.total || 0);
  const totalOutstanding = Number(totalOutRes?.total || 0);

  // Status breakdown
  const statusRows: any = await query('SELECT status, COUNT(*) as total FROM defects GROUP BY status');
  const statusCounts: Record<string, number> = { Open: 0, Retesting: 0, 'Re-open': 0, Close: 0 };
  statusRows.forEach((r: any) => {
    statusCounts[r.status] = Number(r.total);
  });

  // Severity breakdown
  const severityRows: any = await query('SELECT severity, COUNT(*) as total FROM defects WHERE status != "Close" GROUP BY severity');
  const severityCounts: Record<string, number> = { Blocker: 0, High: 0, Medium: 0, Low: 0 };
  severityRows.forEach((r: any) => {
    severityCounts[r.severity] = Number(r.total);
  });

  // Multi-Bank Stats
  const clientStats: any = await query(`
    SELECT c.id, c.client_name, c.client_code,
           SUM(CASE WHEN d.status = 'Open' THEN 1 ELSE 0 END) as count_open,
           SUM(CASE WHEN d.status = 'Retesting' THEN 1 ELSE 0 END) as count_retesting,
           SUM(CASE WHEN d.status = 'Re-open' THEN 1 ELSE 0 END) as count_reopen,
           SUM(CASE WHEN d.status = 'Close' THEN 1 ELSE 0 END) as count_close,
           COUNT(d.id) as total_defects
    FROM clients c
    LEFT JOIN projects p ON c.id = p.client_id
    LEFT JOIN modules m ON p.id = m.project_id
    LEFT JOIN defects d ON m.id = d.module_id
    GROUP BY c.id, c.client_name, c.client_code
    ORDER BY total_defects DESC
  `);

  // Recent Activities
  const recentActivities: any = await query(`
    SELECT a.*, d.ticket_number, d.title as defect_title, u.name as user_name, u.role as user_role
    FROM defect_activities a
    JOIN defects d ON a.defect_id = d.id
    JOIN users u ON a.user_id = u.id
    ORDER BY a.id DESC LIMIT 6
  `);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Dashboard Kualitas Sistem
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoring defect perbankan real-time lintas klien PT Sarana Pactindo
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/defects/kanban"
            className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Kanban Board
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

      {/* FR-08: Metrik Harian */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="glass-panel p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">New Open Today</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{newOpenToday}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Defect baru hari ini</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Ready for Retest</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{readyForRetest}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Menunggu verifikasi</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Re-opened Today</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{reopenedToday}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Gagal retest / regresi</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Closed Today</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{closedToday}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Selesai verifikasi</div>
        </div>

        <div className="glass-panel p-4 col-span-2 lg:col-span-1">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Total Outstanding</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalOutstanding}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Akumulasi tiket aktif</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200">Distribusi Status Defect</h3>
            <span className="text-[11px] text-slate-400">Semua Bank</span>
          </div>
          <div className="h-60 relative">
            <StatusDoughnutChart statusCounts={statusCounts} />
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200">Defect Aktif per Severity</h3>
            <span className="text-[11px] text-slate-400">Severity Breakdown</span>
          </div>
          <div className="h-60 relative">
            <SeverityBarChart severityCounts={severityCounts} />
          </div>
        </div>
      </div>

      {/* Bank Table & Audit Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Table Bank */}
        <div className="lg:col-span-2 glass-panel p-5">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200">
              Rekapitulasi Kualitas per Bank Klien
            </h3>
            <Link href="/defects" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Semua Defect &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium text-[11px]">
                  <th className="pb-2">Bank Klien</th>
                  <th className="pb-2 text-center">Open</th>
                  <th className="pb-2 text-center">Retest</th>
                  <th className="pb-2 text-center">Re-open</th>
                  <th className="pb-2 text-center">Closed</th>
                  <th className="pb-2 text-center">Total</th>
                  <th className="pb-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {clientStats.map((cs: any) => (
                  <tr key={cs.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="py-2.5">
                      <div className="font-medium text-slate-900 dark:text-white">{cs.client_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{cs.client_code}</div>
                    </td>
                    <td className="py-2.5 text-center font-medium text-blue-600 dark:text-blue-400">{cs.count_open}</td>
                    <td className="py-2.5 text-center font-medium text-purple-600 dark:text-purple-400">{cs.count_retesting}</td>
                    <td className="py-2.5 text-center font-medium text-rose-600 dark:text-rose-400">{cs.count_reopen}</td>
                    <td className="py-2.5 text-center font-medium text-emerald-600 dark:text-emerald-400">{cs.count_close}</td>
                    <td className="py-2.5 text-center font-semibold text-slate-900 dark:text-white">{cs.total_defects}</td>
                    <td className="py-2.5 text-right">
                      <Link
                        href={`/defects?client_id=${cs.id}`}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Filter
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200">
              Audit Aktivitas Terkini
            </h3>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              Live
            </span>
          </div>

          <div className="space-y-2.5">
            {recentActivities.map((act: any) => (
              <div key={act.id} className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400 mb-0.5">
                  <span className="font-mono font-medium text-slate-600 dark:text-slate-300">{act.ticket_number}</span>
                  <span>{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  <span className="font-medium text-slate-900 dark:text-white">{act.user_name}</span> &rarr; <span className="font-medium text-blue-600 dark:text-blue-400">{act.to_status}</span>
                </div>
                {act.notes && (
                  <p className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1">
                    "{act.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
