'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SeverityBadge } from './SeverityBadge';
import {
  Layers,
  Building2,
  ExternalLink,
  User,
  X,
  AlertCircle,
  GripVertical,
} from 'lucide-react';

interface DefectItem {
  id: number;
  ticket_number: string;
  title: string;
  client_name: string;
  client_code: string;
  project_name: string;
  module_name: string;
  severity: string;
  status: string;
  reopen_count: number;
  dev_name?: string;
  qc_name?: string;
  created_at: string;
}

const COLUMNS = [
  { id: 'Open', title: 'Open', color: 'bg-blue-500', text: 'text-blue-400', countBg: 'bg-blue-500/20 text-blue-300' },
  { id: 'Retesting', title: 'Ready for Retest', color: 'bg-purple-500', text: 'text-purple-400', countBg: 'bg-purple-500/20 text-purple-300' },
  { id: 'Re-open', title: 'Re-opened', color: 'bg-red-500', text: 'text-red-400', countBg: 'bg-red-500/20 text-red-300' },
  { id: 'Close', title: 'Verified & Closed', color: 'bg-emerald-500', text: 'text-emerald-400', countBg: 'bg-emerald-500/20 text-emerald-300' },
];

export function KanbanBoard({
  initialDefects,
  currentUser,
}: {
  initialDefects: DefectItem[];
  currentUser: any;
}) {
  const [defects, setDefects] = useState<DefectItem[]>(initialDefects);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<{
    type: 'retest' | 'close' | 'reopen';
    defect: DefectItem;
  } | null>(null);

  const [modalForm, setModalForm] = useState({
    notes: '',
    build_number: '',
    commit_hash: '',
  });

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData('text/plain', String(id));
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const defectIdStr = e.dataTransfer.getData('text/plain');
    const defectId = Number(defectIdStr);
    const defect = defects.find((d) => d.id === defectId);

    setDraggedId(null);
    if (!defect || defect.status === targetStatus) return;

    // RBAC & State Machine Check
    const role = currentUser?.role || 'QC';

    if (targetStatus === 'Retesting') {
      if (['Open', 'Re-open'].includes(defect.status) && ['DEVELOPER', 'LEAD', 'PM'].includes(role)) {
        setActiveModal({ type: 'retest', defect });
      } else {
        showFeedback('error', 'Hanya Developer/Lead yang dapat memindahkan tiket ke status Retesting');
      }
      return;
    }

    if (targetStatus === 'Close') {
      if (defect.status === 'Retesting' && ['QC', 'LEAD', 'PM'].includes(role)) {
        setActiveModal({ type: 'close', defect });
      } else {
        showFeedback('error', 'Hanya QC yang dapat memverifikasi & menutup tiket dari status Retesting');
      }
      return;
    }

    if (targetStatus === 'Re-open') {
      if (defect.status === 'Retesting' && ['QC', 'LEAD', 'PM'].includes(role)) {
        setActiveModal({ type: 'reopen', defect });
      } else {
        showFeedback('error', 'Hanya QC yang dapat me-reopen tiket dari status Retesting');
      }
      return;
    }

    if (['LEAD', 'PM'].includes(role)) {
      await submitStatusChange(defect.id, targetStatus, 'Override by management');
    } else {
      showFeedback('error', `Transisi status ${defect.status} ke ${targetStatus} tidak diperbolehkan`);
    }
  };

  const showFeedback = (type: 'error' | 'success', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const submitStatusChange = async (
    defectId: number,
    toStatus: string,
    notes: string,
    build?: string,
    commit?: string
  ) => {
    try {
      const res = await fetch('/api/defects/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defect_id: defectId,
          to_status: toStatus,
          notes,
          build_number: build,
          commit_hash: commit,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setDefects((prev) =>
          prev.map((d) =>
            d.id === defectId
              ? {
                  ...d,
                  status: toStatus,
                  reopen_count: toStatus === 'Re-open' ? d.reopen_count + 1 : d.reopen_count,
                }
              : d
          )
        );
        showFeedback('success', json.message);
        setActiveModal(null);
        setModalForm({ notes: '', build_number: '', commit_hash: '' });
      } else {
        showFeedback('error', json.message);
      }
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  return (
    <div className="space-y-4">
      {feedbackMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-xl text-xs font-bold border flex items-center gap-2 ${
            feedbackMsg.type === 'error'
              ? 'bg-red-500/15 border-red-500/30 text-red-400'
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {feedbackMsg.text}
        </motion.div>
      )}

      {/* 4 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colDefects = defects.filter((d) => d.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex flex-col rounded-2xl glass-panel p-3.5 border border-white/10 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.color}`} />
                  <span className="font-extrabold text-xs tracking-tight text-white light:text-slate-900">
                    {col.title}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-black ${col.countBg}`}>
                  {colDefects.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-2.5 overflow-y-auto">
                {colDefects.map((d) => (
                  <div
                    key={d.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, d.id)}
                    className="kanban-card p-3.5 cursor-grab active:cursor-grabbing group"
                  >
                    {/* Header Card */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <GripVertical className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition" />
                        <span className="font-mono text-[11px] font-bold text-blue-400">
                          {d.ticket_number}
                        </span>
                      </div>
                      <SeverityBadge severity={d.severity} />
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-xs text-white light:text-slate-900 line-clamp-2 leading-snug mb-2.5">
                      {d.title}
                    </h4>

                    {/* Metadata List */}
                    <div className="text-[11px] text-slate-400 light:text-slate-500 space-y-1 mb-2.5 bg-black/20 light:bg-slate-50 p-2 rounded-lg border border-white/5 light:border-slate-100">
                      <div className="flex items-center gap-1.5 truncate">
                        <Building2 className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="truncate">{d.client_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Layers className="w-3 h-3 text-purple-400 shrink-0" />
                        <span className="truncate">{d.module_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">Dev: {d.dev_name || 'Belum ada'}</span>
                      </div>
                    </div>

                    {/* Footer Card */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 light:border-slate-100 text-[10px] text-slate-500">
                      <span>{new Date(d.created_at).toLocaleDateString('id-ID')}</span>
                      <Link
                        href={`/defects/${d.id}`}
                        className="text-blue-400 group-hover:text-blue-300 font-bold flex items-center gap-1 hover:underline"
                      >
                        Detail <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}

                {colDefects.length === 0 && (
                  <div className="h-32 border border-dashed border-white/10 light:border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-500">
                    Tidak ada tiket
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* State Machine Transition Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel bg-slate-900 border border-white/20 p-6 rounded-2xl max-w-lg w-full shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                {activeModal.type === 'retest' && '🚀 Submit Perbaikan (Retesting)'}
                {activeModal.type === 'close' && '✅ Verifikasi Lolos & Tutup Tiket'}
                {activeModal.type === 'reopen' && '❌ Retest Gagal (Re-open Tiket)'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-white/5 text-xs text-slate-300">
                Tiket: <strong className="text-blue-400 font-mono">{activeModal.defect.ticket_number}</strong> &bull; {activeModal.defect.title}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {activeModal.type === 'retest' ? 'Catatan Perbaikan (Fixing Note) *' : 'Catatan Verifikasi / Alasan *'}
                </label>
                <textarea
                  rows={3}
                  value={modalForm.notes}
                  onChange={(e) => setModalForm({ ...modalForm, notes: e.target.value })}
                  placeholder="Tuliskan catatan teknis..."
                  className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              {activeModal.type === 'retest' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Nomor Build</label>
                    <input
                      type="text"
                      placeholder="e.g. v2.4.1-rc3"
                      value={modalForm.build_number}
                      onChange={(e) => setModalForm({ ...modalForm, build_number: e.target.value })}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Commit Hash</label>
                    <input
                      type="text"
                      placeholder="e.g. 7f9a1c"
                      value={modalForm.commit_hash}
                      onChange={(e) => setModalForm({ ...modalForm, commit_hash: e.target.value })}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = activeModal.type === 'retest' ? 'Retesting' : activeModal.type === 'close' ? 'Close' : 'Re-open';
                    submitStatusChange(activeModal.defect.id, target, modalForm.notes, modalForm.build_number, modalForm.commit_hash);
                  }}
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition ${
                    activeModal.type === 'retest'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : activeModal.type === 'close'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
