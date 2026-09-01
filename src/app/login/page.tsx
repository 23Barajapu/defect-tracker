'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('qc@pactindo.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.message || 'Login gagal');
      }
    } catch (err: any) {
      setError(err.message || 'Koneksi error');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-navy-950">
      {/* Ambient background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-panel p-8 relative z-10 border border-white/15 shadow-2xl shadow-black/50"
      >
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30 border border-white/20">
            SP
          </div>
          <div>
            <h1 className="font-black text-lg text-white tracking-tight">PT Sarana Pactindo</h1>
            <p className="text-xs text-slate-400 font-medium">Defect Tracking & QA Reporting Engine</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 mb-5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Pengguna</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950/80 border border-white/15 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white outline-none focus:border-blue-500 transition"
                placeholder="nama@pactindo.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950/80 border border-white/15 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white outline-none focus:border-blue-500 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            {loading ? 'Memproses Masuk...' : 'Masuk ke Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Quick-Fill Roles */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Pilih Akun Demo (Sesuai RBAC PRD):</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDemoAccount('qc@pactindo.com')}
              className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-left transition text-blue-300"
            >
              <div className="text-[11px] font-bold">QC Tester</div>
              <div className="text-[9px] text-slate-400">Rina Marlina</div>
            </button>

            <button
              type="button"
              onClick={() => setDemoAccount('dev@pactindo.com')}
              className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-left transition text-purple-300"
            >
              <div className="text-[11px] font-bold">Developer</div>
              <div className="text-[9px] text-slate-400">Budi Santoso</div>
            </button>

            <button
              type="button"
              onClick={() => setDemoAccount('lead@pactindo.com')}
              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-left transition text-amber-300"
            >
              <div className="text-[11px] font-bold">Tech Lead</div>
              <div className="text-[9px] text-slate-400">Agus Pratama</div>
            </button>

            <button
              type="button"
              onClick={() => setDemoAccount('pm@pactindo.com')}
              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-left transition text-emerald-300"
            >
              <div className="text-[11px] font-bold">Project Manager</div>
              <div className="text-[9px] text-slate-400">Siti Nurhaliza</div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
