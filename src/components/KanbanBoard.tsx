'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SeverityBadge } from './SeverityBadge';

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
  { id: 'Open', title: 'Open', dot: 'bg-blue-500' },
  { id: 'Retesting', title: 'In Retest', dot: 'bg-purple-500' },
  { id: 'Re-open', title: 'Re-opened', dot: 'bg-rose-500' },
  { id: 'Close', title: 'Closed', dot: 'bg-emerald-500' },
];

export function KanbanBoard({
  initialDefects,
  currentUser,
}: {
  initialDefects: DefectItem[];
  currentUser: any;
}) {
  const [defects, setDefects] = useState<DefectItem[]>(initialDefects);
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
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const defectIdStr = e.dataTransfer.getData('text/plain');
    const defectId = Number(defectIdStr);
    const defect = defects.find((d) => d.id === defectId);

    if (!defect || defect.status === targetStatus) return;

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
      showFeedback('error', `Transisi status ${defect.status} ke ${targetStatus} tidak diizinkan`);
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
        <div
          className={`p-3 rounded text-xs font-medium ${
            feedbackMsg.type === 'error'
              ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
              : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
          }`}
        >
          {feedbackMsg.text}
        </div>
      )}

      {/* 4 Clean Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colDefects = defects.filter((d) => d.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex flex-col bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-md p-3 min-h-[550px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                    {col.title}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
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
                    className="kanban-card p-3 cursor-grab active:cursor-grabbing hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {d.ticket_number}
                      </span>
                      <SeverityBadge severity={d.severity} />
                    </div>

                    <h4 className="font-medium text-xs text-slate-900 dark:text-white leading-snug line-clamp-2 mb-2">
                      {d.title}
                    </h4>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 mb-2.5 border-t border-slate-100 dark:border-slate-800/60 pt-1.5">
                      <div className="truncate">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{d.client_name}</span> &bull; {d.module_name}
                      </div>
                      <div className="truncate">
                        PIC: <span className="font-medium text-slate-700 dark:text-slate-300">{d.dev_name || 'Unassigned'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                      <span>{new Date(d.created_at).toLocaleDateString('id-ID')}</span>
                      <Link
                        href={`/defects/${d.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Detail &rarr;
                      </Link>
                    </div>
                  </div>
                ))}

                {colDefects.length === 0 && (
                  <div className="h-28 border border-dashed border-slate-200 dark:border-slate-800 rounded flex items-center justify-center text-[11px] text-slate-400">
                    Tarik tiket ke sini
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Transition Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-lg max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                {activeModal.type === 'retest' && 'Submit Perbaikan (Retesting)'}
                {activeModal.type === 'close' && 'Verifikasi Lolos (Close Defect)'}
                {activeModal.type === 'reopen' && 'Verifikasi Gagal (Re-open Defect)'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Tiket: <span className="font-mono font-semibold text-slate-900 dark:text-white">{activeModal.defect.ticket_number}</span> &bull; {activeModal.defect.title}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {activeModal.type === 'retest' ? 'Catatan Perbaikan *' : 'Catatan Verifikasi *'}
                </label>
                <textarea
                  rows={3}
                  value={modalForm.notes}
                  onChange={(e) => setModalForm({ ...modalForm, notes: e.target.value })}
                  placeholder="Tuliskan catatan teknis..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              {activeModal.type === 'retest' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nomor Build</label>
                    <input
                      type="text"
                      placeholder="e.g. v2.4.1"
                      value={modalForm.build_number}
                      onChange={(e) => setModalForm({ ...modalForm, build_number: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Commit Hash</label>
                    <input
                      type="text"
                      placeholder="e.g. 7f9a1c"
                      value={modalForm.commit_hash}
                      onChange={(e) => setModalForm({ ...modalForm, commit_hash: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3 py-1.5 rounded text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = activeModal.type === 'retest' ? 'Retesting' : activeModal.type === 'close' ? 'Close' : 'Re-open';
                    submitStatusChange(activeModal.defect.id, target, modalForm.notes, modalForm.build_number, modalForm.commit_hash);
                  }}
                  className={`px-3.5 py-1.5 rounded text-xs font-medium text-white ${
                    activeModal.type === 'retest'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : activeModal.type === 'close'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
