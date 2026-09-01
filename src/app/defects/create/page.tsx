'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Security } from '@/lib/security';
import {
  ArrowLeft,
  ShieldCheck,
  Building2,
  Layers,
  Bug,
  AlertCircle,
} from 'lucide-react';

export default function CreateDefectPage() {
  const router = useRouter();

  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [developers, setDevelopers] = useState<any[]>([]);

  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedModule, setSelectedModule] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'High',
    environment: 'SIT',
    steps_to_reproduce: '',
    expected_result: '',
    actual_result: '',
    payload_log: '',
    dev_id: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/clients')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setClients(res.data);
      });

    fetch('/api/defects/1')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data.developers) {
          setDevelopers(res.data.developers);
        }
      });
  }, []);

  const handleClientChange = async (clientId: string) => {
    setSelectedClient(clientId);
    setSelectedProject('');
    setSelectedModule('');
    setProjects([]);
    setModules([]);

    if (!clientId) return;
    const res = await fetch(`/api/projects?client_id=${clientId}`);
    const json = await res.json();
    if (json.success) setProjects(json.data);
  };

  const handleProjectChange = async (projectId: string) => {
    setSelectedProject(projectId);
    setSelectedModule('');
    setModules([]);

    if (!projectId) return;
    const res = await fetch(`/api/modules?project_id=${projectId}`);
    const json = await res.json();
    if (json.success) setModules(json.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) {
      setError('Pilih modul fungsional terlebih dahulu');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/defects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          module_id: Number(selectedModule),
          dev_id: form.dev_id ? Number(form.dev_id) : null,
        }),
      });
      const data = await res.json();

      if (data.success) {
        router.push(`/defects/${data.defectId}`);
      } else {
        setError(data.message || 'Gagal menyimpan defect');
      }
    } catch (err: any) {
      setError(err.message || 'Koneksi error');
    } finally {
      setLoading(false);
    }
  };

  const maskedPreview = Security.maskSensitiveData(form.payload_log);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/defects"
          className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Defect
        </Link>
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          Formulir Standar FR-03
        </span>
      </div>

      <div className="glass-panel p-8">
        <div className="pb-4 mb-6 border-b border-slate-200 dark:border-white/10">
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bug className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Input Tiket Defect Baru
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Standarisasi pelaporan cacat perangkat lunak perbankan PT Sarana Pactindo
          </p>
        </div>

        {error && (
          <div className="p-3.5 mb-6 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Multi-Bank Hierarchy */}
          <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-white/10">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
              1. Hierarki Bank Klien &amp; Modul (FR-01)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Bank Klien *</label>
                <select
                  value={selectedClient}
                  onChange={(e) => handleClientChange(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                >
                  <option value="">-- Pilih Bank Klien --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.client_name} ({c.client_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Proyek / Platform *</label>
                <select
                  value={selectedProject}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  disabled={!selectedClient}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="">-- Pilih Proyek --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.platform})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Modul Fungsional *</label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  disabled={!selectedProject}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="">-- Pilih Modul --</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.module_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Defect Details */}
          <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-white/10">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
              2. Rincian Kesalahan &amp; Lingkungan Pengujian
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Judul Defect *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="e.g. Timeout Transaksi BI-FAST saat nominal di atas Rp 50 Juta"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Severity *</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 font-bold"
                >
                  <option value="Blocker" className="text-red-500">Blocker (Fatal / Down)</option>
                  <option value="High" className="text-orange-500">High (Fitur Utama Gagal)</option>
                  <option value="Medium" className="text-amber-500">Medium (Fitur Sekunder)</option>
                  <option value="Low" className="text-slate-500">Low (Minor / UI / Typo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Testing Environment *</label>
                <select
                  value={form.environment}
                  onChange={(e) => setForm({ ...form, environment: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                >
                  <option value="DEV">DEV (Internal Development)</option>
                  <option value="SIT">SIT (System Integration Test)</option>
                  <option value="UAT">UAT (User Acceptance Test Bank)</option>
                  <option value="Pre-Prod">Pre-Prod (Staging Partner)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Penugasan PIC Developer</label>
                <select
                  value={form.dev_id}
                  onChange={(e) => setForm({ ...form, dev_id: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                >
                  <option value="">-- Pilih PIC Developer --</option>
                  {developers.map((dev) => (
                    <option key={dev.id} value={dev.id}>
                      {dev.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Deskripsi Singkat Permasalahan *</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                placeholder="Jelaskan kondisi kegagalan sistem dan dampaknya..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Langkah-langkah Mereproduksi (Steps to Reproduce)</label>
              <textarea
                rows={3}
                value={form.steps_to_reproduce}
                onChange={(e) => setForm({ ...form, steps_to_reproduce: e.target.value })}
                placeholder="1. Login ke aplikasi&#10;2. Masuk menu transfer...&#10;3. Submit..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 font-mono text-[11px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1.5">Expected Result</label>
                <textarea
                  rows={2}
                  value={form.expected_result}
                  onChange={(e) => setForm({ ...form, expected_result: e.target.value })}
                  placeholder="Transaksi berhasil dan status sukses tercatat..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-red-600 dark:text-red-400 mb-1.5">Actual Result</label>
                <textarea
                  rows={2}
                  value={form.actual_result}
                  onChange={(e) => setForm({ ...form, actual_result: e.target.value })}
                  placeholder="Aplikasi timeout HTTP 504..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: ISO 8583 / JSON Payload & Live Masking */}
          <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                3. Log ISO 8583 / JSON Payload &amp; Masking (PCI-DSS)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Auto-Masking PAN &amp; PIN Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Input Raw Payload</label>
                <textarea
                  rows={5}
                  value={form.payload_log}
                  onChange={(e) => setForm({ ...form, payload_log: e.target.value })}
                  placeholder='{"pan": "4111112233441111", "pin": "123456", "cvv": "987", "amount": 500000}'
                  className="w-full code-box p-3 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Live Sanitized Preview (Tersimpan Aman)</label>
                <div className="code-box p-3 text-xs h-[105px] overflow-y-auto whitespace-pre-wrap">
                  {maskedPreview || '// Preview data tersanitasi akan muncul di sini...'}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/defects"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Menyimpan Tiket...' : 'Submit Defect Baru (Open)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
