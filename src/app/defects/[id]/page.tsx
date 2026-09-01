import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { StatusBadge } from '@/components/StatusBadge';
import { SeverityBadge } from '@/components/SeverityBadge';
import { IsoInspector } from '@/components/IsoInspector';
import { DefectDetailActions } from '@/components/DefectDetailActions';
import {
  ArrowLeft,
  Bug,
  Building2,
  Layers,
  User,
  Clock,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  History,
  Terminal,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DefectDetailPage({ params }: { params: { id: string } }) {
  const currentUser = getSession();
  const defectId = params.id;

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
  if (!defect) notFound();

  // Audit activities
  const activities: any = await query(
    `SELECT a.*, u.name as user_name, u.role as user_role 
     FROM defect_activities a
     JOIN users u ON a.user_id = u.id
     WHERE a.defect_id = ?
     ORDER BY a.id ASC`,
    [defectId]
  );

  // Developers for reassign
  const developers: any = await query('SELECT id, name, email FROM users WHERE role = "DEVELOPER" ORDER BY name ASC');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/defects"
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Defect
        </Link>
        <div className="flex items-center gap-3">
          <StatusBadge status={defect.status} reopenCount={defect.reopen_count} />
          <SeverityBadge severity={defect.severity} />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Payloads (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Info Utama */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-blue-400">
              <Bug className="w-4 h-4" /> {defect.ticket_number}
            </div>
            <h1 className="text-xl font-black text-white light:text-slate-900 leading-tight">
              {defect.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-xs text-slate-400 py-3 border-y border-white/10">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>{defect.client_name} ({defect.client_code})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>{defect.project_name} &rsaquo; {defect.module_name}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-slate-300">
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">{defect.environment}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Deskripsi Permasalahan</h4>
              <p className="text-xs text-slate-200 light:text-slate-700 leading-relaxed whitespace-pre-line">
                {defect.description}
              </p>
            </div>

            {/* Steps to Reproduce */}
            {defect.steps_to_reproduce && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Steps to Reproduce</h4>
                <div className="code-box p-3 text-xs whitespace-pre-line text-slate-300">
                  {defect.steps_to_reproduce}
                </div>
              </div>
            )}

            {/* Expected vs Actual */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {defect.expected_result && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <span className="font-extrabold text-emerald-400 block mb-1">Expected Result:</span>
                  <p className="text-slate-300 light:text-slate-700">{defect.expected_result}</p>
                </div>
              )}
              {defect.actual_result && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
                  <span className="font-extrabold text-red-400 block mb-1">Actual Result:</span>
                  <p className="text-slate-300 light:text-slate-700">{defect.actual_result}</p>
                </div>
              )}
            </div>
          </div>

          {/* Visual ISO 8583 / Payload Inspector */}
          {defect.payload_log && (
            <IsoInspector initialRaw={defect.payload_log} />
          )}

          {/* Audit Trail Timeline (FR-05) */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-extrabold text-sm text-white light:text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" /> Riwayat Audit Siklus Hidup (FR-05)
              </h3>
              <span className="text-xs text-slate-400 font-mono">{activities.length} Aktivitas</span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
              {activities.map((act: any) => (
                <div key={act.id} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-slate-900" />
                  
                  <div className="text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white light:text-slate-900">
                        {act.user_name} <span className="text-[10px] text-slate-400 font-normal">({act.user_role})</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(act.created_at).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="mt-1 font-semibold text-purple-300">
                      {act.from_status ? `${act.from_status} → ${act.to_status}` : `Inisialisasi: ${act.to_status}`}
                    </div>

                    {act.notes && (
                      <p className="text-slate-300 light:text-slate-600 mt-1 italic bg-white/5 p-2 rounded-lg">
                        "{act.notes}"
                      </p>
                    )}

                    {(act.build_number || act.commit_hash) && (
                      <div className="flex gap-3 text-[11px] font-mono text-slate-400 mt-1.5">
                        {act.build_number && <span>Build: <strong className="text-blue-400">{act.build_number}</strong></span>}
                        {act.commit_hash && <span>Commit: <strong className="text-emerald-400">{act.commit_hash}</strong></span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: People & State Machine Controls */}
        <div className="space-y-6">
          {/* People Box */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-white light:text-slate-900 pb-3 border-b border-white/10">
              Pelapor & Penanggung Jawab
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">QC Reporter:</span>
                <div className="font-bold text-white light:text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  {defect.qc_name} ({defect.qc_email})
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">PIC Developer:</span>
                <div className="font-bold text-white light:text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  {defect.dev_name ? `${defect.dev_name} (${defect.dev_email})` : 'Belum Ditugaskan'}
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">Tanggal Dibuat:</span>
                <div className="font-mono text-slate-300 mt-0.5">
                  {new Date(defect.created_at).toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive State Machine Action Controls */}
          <DefectDetailActions
            defect={defect}
            currentUser={currentUser}
            developers={developers}
          />
        </div>
      </div>
    </div>
  );
}
