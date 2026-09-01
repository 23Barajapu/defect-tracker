'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Send,
  CheckCircle2,
  RotateCcw,
  UserCheck,
  AlertCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export function DefectDetailActions({
  defect,
  currentUser,
  developers,
}: {
  defect: any;
  currentUser: any;
  developers: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [notes, setNotes] = useState('');
  const [buildNumber, setBuildNumber] = useState('');
  const [commitHash, setCommitHash] = useState('');
  const [reassignDevId, setReassignDevId] = useState('');

  const role = currentUser?.role || 'QC';
  const status = defect.status;

  const handleAction = async (toStatus: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/defects/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defect_id: defect.id,
          to_status: toStatus,
          notes,
          build_number: buildNumber,
          commit_hash: commitHash,
          reassign_dev_id: reassignDevId ? Number(reassignDevId) : undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess(json.message);
        setNotes('');
        router.refresh();
      } else {
        setError(json.message);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <h3 className="font-extrabold text-sm text-white light:text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" /> Kontrol Status (State Machine)
        </h3>
        <span className="text-[10px] font-bold uppercase text-slate-400">Role: {role}</span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      <div className="space-y-3">
        {/* State Machine Transition Actions */}
        {/* 1. Developer Action: Open/Re-open -> Retesting */}
        {['Open', 'Re-open'].includes(status) && ['DEVELOPER', 'LEAD', 'PM'].includes(role) && (
          <div className="space-y-3 p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <span className="text-xs font-bold text-purple-300 block">🚀 Form Submit Perbaikan (Retesting)</span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan perbaikan teknis (wajib)..."
              className="w-full bg-slate-950 border border-white/15 rounded-lg p-2 text-xs text-white outline-none focus:border-purple-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={buildNumber}
                onChange={(e) => setBuildNumber(e.target.value)}
                placeholder="Build No (e.g. v1.2)"
                className="bg-slate-950 border border-white/15 rounded-lg p-2 text-xs text-white outline-none"
              />
              <input
                type="text"
                value={commitHash}
                onChange={(e) => setCommitHash(e.target.value)}
                placeholder="Commit (e.g. 7f9a1c)"
                className="bg-slate-950 border border-white/15 rounded-lg p-2 text-xs text-white outline-none"
              />
            </div>
            <button
              onClick={() => handleAction('Retesting')}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition"
            >
              Ubah ke Retesting (Siap Uji)
            </button>
          </div>
        )}

        {/* 2. QC Action: Retesting -> Close or Re-open */}
        {status === 'Retesting' && ['QC', 'LEAD', 'PM'].includes(role) && (
          <div className="space-y-3 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <span className="text-xs font-bold text-blue-300 block">Verifikasi Hasil Pengujian QC</span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan verifikasi atau alasan kegagalan jika re-open..."
              className="w-full bg-slate-950 border border-white/15 rounded-lg p-2 text-xs text-white outline-none focus:border-blue-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAction('Close')}
                disabled={loading}
                className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Lolos & Tutup (Close)
              </button>
              <button
                onClick={() => handleAction('Re-open')}
                disabled={loading}
                className="py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Gagal (Re-open)
              </button>
            </div>
          </div>
        )}

        {/* 3. Lead / PM Override & Reassign */}
        {['LEAD', 'PM'].includes(role) && (
          <div className="space-y-2.5 pt-3 border-t border-white/10">
            <span className="text-[11px] font-bold text-amber-400 block">Management Reassign PIC</span>
            <select
              value={reassignDevId}
              onChange={(e) => setReassignDevId(e.target.value)}
              className="w-full bg-slate-950 border border-white/15 rounded-lg p-2 text-xs text-white outline-none"
            >
              <option value="">-- Alihkan PIC Developer --</option>
              {developers.map((dev) => (
                <option key={dev.id} value={dev.id}>
                  {dev.name} ({dev.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Informative Status Badge if No Action is Allowed for Current Role */}
        {status === 'Close' && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-center text-emerald-400 font-bold">
            Tiket ini telah diverifikasi dan ditutup (Closed).
          </div>
        )}
      </div>
    </div>
  );
}
