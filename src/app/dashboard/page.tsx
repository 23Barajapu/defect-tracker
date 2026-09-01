import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { StatusDoughnutChart, SeverityBarChart } from '@/components/Charts';
import {
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  Building2,
  Activity,
} from 'lucide-react';

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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white light:text-slate-900 tracking-tight">
            Dashboard Kualitas Multi-Bank
          </h1>
          <p className="text-xs text-slate-400 light:text-slate-500 mt-1">
            Monitoring kesehatan transaksi & pelacakan defect perbankan real-time PT Sarana Pactindo
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/defects/kanban"
            className="px-4 py-2.5 rounded-xl border border-white/10 light:border-slate-200 bg-white/5 light:bg-slate-100 hover:bg-white/10 text-xs font-bold text-white light:text-slate-900 transition flex items-center gap-2"
          >
            Kanban Board
          </Link>
          {['QC', 'LEAD', 'PM'].includes(currentUser?.role || '') && (
            <Link
              href="/defects/create"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Input Defect Baru
            </Link>
          )}
        </div>
      </div>

      {/* FR-08: Ringkasan Metrik Harian */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* New Open Today */}
        <div className="glass-panel p-5 glow-card border-t-2 border-t-blue-500">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>NEW OPEN TODAY</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white light:text-slate-900 tracking-tight">
            {newOpenToday}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Defect dilaporkan hari ini</div>
        </div>

        {/* Ready for Retest */}
        <div className="glass-panel p-5 glow-card border-t-2 border-t-purple-500">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>READY FOR RETEST</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white light:text-slate-900 tracking-tight">
            {readyForRetest}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Menunggu verifikasi QC</div>
        </div>

        {/* Re-opened Today */}
        <div className="glass-panel p-5 glow-card border-t-2 border-t-red-500">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>RE-OPENED TODAY</span>
            <RotateCcw className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-black text-white light:text-slate-900 tracking-tight">
            {reopenedToday}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Gagal verifikasi / regresi</div>
        </div>

        {/* Closed Today */}
        <div className="glass-panel p-5 glow-card border-t-2 border-t-emerald-500">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>CLOSED TODAY</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white light:text-slate-900 tracking-tight">
            {closedToday}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Selesai diperbaiki & lolos uji</div>
        </div>

        {/* Total Outstanding */}
        <div className="glass-panel p-5 glow-card border-t-2 border-t-amber-500">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>TOTAL OUTSTANDING</span>
            <AlertOctagon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 tracking-tight">
            {totalOutstanding}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Akumulasi tiket aktif</div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
            <h3 className="font-extrabold text-sm text-white light:text-slate-900">Distribusi Status Tiket</h3>
            <span className="text-[11px] text-slate-400">Semua Bank</span>
          </div>
          <div className="h-64 relative">
            <StatusDoughnutChart statusCounts={statusCounts} />
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
            <h3 className="font-extrabold text-sm text-white light:text-slate-900">Tingkat Keparahan (Active Defects)</h3>
            <span className="text-[11px] text-slate-400">Severity Breakdown</span>
          </div>
          <div className="h-64 relative">
            <SeverityBarChart severityCounts={severityCounts} />
          </div>
        </div>
      </div>

      {/* Multi-Bank Matrix Table & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Bank */}
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
            <h3 className="font-extrabold text-sm text-white light:text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" /> Kualitas Defect per Bank Klien
            </h3>
            <Link href="/defects" className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="pb-3">Bank Klien</th>
                  <th className="pb-3 text-center">Open</th>
                  <th className="pb-3 text-center">Retesting</th>
                  <th className="pb-3 text-center">Re-open</th>
                  <th className="pb-3 text-center">Closed</th>
                  <th className="pb-3 text-center">Total</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clientStats.map((cs: any) => (
                  <tr key={cs.id} className="hover:bg-white/5 transition">
                    <td className="py-3">
                      <div className="font-bold text-white light:text-slate-900">{cs.client_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{cs.client_code}</div>
                    </td>
                    <td className="py-3 text-center font-bold text-blue-400">{cs.count_open}</td>
                    <td className="py-3 text-center font-bold text-purple-400">{cs.count_retesting}</td>
                    <td className="py-3 text-center font-bold text-red-400">{cs.count_reopen}</td>
                    <td className="py-3 text-center font-bold text-emerald-400">{cs.count_close}</td>
                    <td className="py-3 text-center font-black text-white light:text-slate-900">{cs.total_defects}</td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/defects?client_id=${cs.id}`}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-slate-300 transition"
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

        {/* Recent Audit Activities */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
            <h3 className="font-extrabold text-sm text-white light:text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Audit Aktivitas
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Live
            </span>
          </div>

          <div className="space-y-3.5">
            {recentActivities.map((act: any) => (
              <div key={act.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono font-bold text-blue-400 text-[11px]">{act.ticket_number}</span>
                  <span className="text-[10px] text-slate-500">{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="text-slate-200 light:text-slate-700">
                  <strong className="text-white light:text-slate-900">{act.user_name}</strong> &rarr; <span className="font-bold text-purple-300">{act.to_status}</span>
                </div>
                {act.notes && (
                  <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-2">
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
