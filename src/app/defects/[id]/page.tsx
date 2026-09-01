import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { StatusBadge } from '@/components/StatusBadge';
import { SeverityBadge } from '@/components/SeverityBadge';
import { DefectDetailActions } from '@/components/DefectDetailActions';
import {
  ArrowLeft,
  Building2,
  Layers,
  History,
  Binary,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DefectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const defectId = params.id;
  const currentUser = getSession();

  const defects: any = await query(
    `SELECT d.*, 
            m.module_name, 
            p.name as project_name, p.platform, 
            c.id as client_id, c.client_name, c.client_code,
            u_qc.name as qc_name, u_qc.email as qc_email,
            u_dev.name as dev_name, u_dev.email as dev_email
     FROM defects d
     JOIN modules m ON d.module_id = m.id
     JOIN projects p ON m.project_id = p.id
     JOIN clients c ON p.client_id = c.id
     JOIN users u_qc ON d.qc_id = u_qc.id
     LEFT JOIN users u_dev ON d.dev_id = u_dev.id
     WHERE d.id = ?`,
    [defectId]
  );

  const defect = defects[0];
  if (!defect) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tiket Defect Tidak Ditemukan</h2>
        <Link href="/defects" className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline">
          &larr; Kembali ke Daftar Defect
        </Link>
      </div>
    );
  }

  // Audit activities
  const activities: any = await query(
    `SELECT a.*, u.name as user_name, u.role as user_role 
     FROM defect_activities a
     JOIN users u ON a.user_id = u.id
     WHERE a.defect_id = ?
     ORDER BY a.id ASC`,
    [defectId]
  );

  // Developer list for reassign
  const developers: any = await query('SELECT id, name, email FROM users WHERE role = "DEVELOPER" ORDER BY name ASC');

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/defects"
          className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Defect
        </Link>

        {/* Modal Action Controller */}
        <DefectDetailActions defect={defect} currentUser={currentUser} developers={developers} />
      </div>

      {/* Main Ticket Card */}
      <div className="glass-panel p-6 sm:p-8 space-y-6">
        {/* Header Information */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/25">
                {defect.ticket_number}
              </span>
              <StatusBadge status={defect.status} reopenCount={defect.reopen_count} />
              <SeverityBadge severity={defect.severity} />
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-700 dark:text-slate-300 font-bold">
                ENV: {defect.environment}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {defect.title}
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-right">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">QC Reporter</div>
              <div className="font-bold text-slate-900 dark:text-white">{defect.qc_name}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-right">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">PIC Developer</div>
              <div className="font-bold text-purple-600 dark:text-purple-400">{defect.dev_name || 'Belum Ditugaskan'}</div>
            </div>
          </div>
        </div>

        {/* Hierarchy Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Bank: <strong className="text-slate-900 dark:text-white">{defect.client_name}</strong> ({defect.client_code})</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>Proyek: <strong className="text-slate-900 dark:text-white">{defect.project_name}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Modul: <strong className="text-slate-900 dark:text-white">{defect.module_name}</strong></span>
          </div>
        </div>

        {/* Description & Reproduction Steps */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Deskripsi Masalah
            </h3>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5 font-medium">
              {defect.description}
            </p>
          </div>

          {defect.steps_to_reproduce && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Steps to Reproduce
              </h3>
              <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                {defect.steps_to_reproduce}
              </pre>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {defect.expected_result && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  <CheckCircle className="w-4 h-4" /> Expected Result
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-medium">{defect.expected_result}</p>
              </div>
            )}

            {defect.actual_result && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 mb-1">
                  <XCircle className="w-4 h-4" /> Actual Result
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-medium">{defect.actual_result}</p>
              </div>
            )}
          </div>

          {/* Payload Log */}
          {defect.payload_log && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Binary className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Log Payload (Masked / Sanitized)
                </h3>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                  PCI-DSS Compliant
                </span>
              </div>
              <div className="code-box p-4 text-xs whitespace-pre-wrap">
                {defect.payload_log}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit Trail Timeline */}
      <div className="glass-panel p-6 sm:p-8">
        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-6 pb-3 border-b border-slate-200 dark:border-white/10">
          <History className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Audit Trail &amp; Riwayat Aktivitas (FR-05)
        </h2>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-white/10">
          {activities.map((act: any) => (
            <div key={act.id} className="relative group">
              <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900" />
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 dark:text-white font-bold">{act.user_name}</strong>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400">
                      {act.user_role}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {new Date(act.created_at).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {act.from_status ? (
                    <>
                      Status diubah: <span className="font-bold text-slate-600 dark:text-slate-400">{act.from_status}</span> &rarr; <span className="font-bold text-blue-600 dark:text-blue-400">{act.to_status}</span>
                    </>
                  ) : (
                    <>
                      Tiket dibuat dengan status <span className="font-bold text-blue-600 dark:text-blue-400">Open</span>
                    </>
                  )}
                </div>

                {act.notes && (
                  <div className="text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-black/30 p-2.5 rounded-lg border border-slate-200 dark:border-white/5 mt-2 font-medium">
                    "{act.notes}"
                  </div>
                )}

                {(act.build_number || act.commit_hash) && (
                  <div className="flex gap-4 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
                    {act.build_number && <span>Build: <strong className="text-slate-800 dark:text-slate-200">{act.build_number}</strong></span>}
                    {act.commit_hash && <span>Commit: <strong className="text-slate-800 dark:text-slate-200">{act.commit_hash}</strong></span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
