'use client';

import React, { useState } from 'react';
import { Security, IsoParseResult } from '@/lib/security';
import { Binary, ShieldCheck, Eye, EyeOff, Sparkles, Copy, Check } from 'lucide-react';

const SAMPLE_PAYLOADS = [
  {
    name: 'BI-FAST MTI 0200 Financial Request',
    raw: 'MTI: 0200 | BIT2: 4111112233441111 | BIT3: 000000 | BIT4: 000005000000 | BIT11: 009821 | BIT48: BI-FAST SWITCH PACTINDO | BIT52: 1A2B3C4D5E6F7A8B',
  },
  {
    name: 'QRIS MPM Settlement (JSON Payload)',
    raw: JSON.stringify(
      {
        action: 'qris_mpm_settle',
        merchant_id: 'MID-BJB-99881',
        pan: '5211119988771234',
        amount: 150000,
        pin_block: 'AABBCCDDEEFF0011',
        cvv: '987',
        status: 'SUCCESS_REVERSIBLE',
      },
      null,
      2
    ),
  },
  {
    name: 'Host Switching Error 0500 Reversal',
    raw: 'MTI: 0400 | BIT2: 6019998877665544 | BIT3: 200000 | BIT4: 000000100000 | BIT39: 68 | BIT48: TIMEOUT_AUTO_REVERSAL_TRIGGERED',
  },
];

export function IsoInspector({ initialRaw = '' }: { initialRaw?: string }) {
  const [inputRaw, setInputRaw] = useState(initialRaw || SAMPLE_PAYLOADS[0].raw);
  const [showMasked, setShowMasked] = useState(true);
  const [copied, setCopied] = useState(false);

  const parsed: IsoParseResult = Security.parseIso8583(inputRaw);
  const jsonMasked = Security.maskSensitiveData(inputRaw);

  const handleCopy = () => {
    navigator.clipboard.writeText(showMasked ? parsed.maskedRaw : inputRaw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <Binary className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              Visual ISO 8583 &amp; Banking Payload Inspector
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                PCI-DSS Shield
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Analisis struktur bit transaksi perbankan dan validasi sanitasi data rahasia
            </p>
          </div>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">Sampel:</span>
          <div className="flex gap-1.5">
            {SAMPLE_PAYLOADS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setInputRaw(sample.raw)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition"
              >
                {sample.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
          <label className="font-bold text-slate-800 dark:text-slate-200">Raw Input (ISO 8583 Bit String / JSON Log)</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMasked(!showMasked)}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline transition"
            >
              {showMasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showMasked ? 'Mode Ter-Masking (Aman)' : 'Mode Raw (Unmasked)'}
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Tersalin' : 'Salin'}
            </button>
          </div>
        </div>
        <textarea
          rows={4}
          value={inputRaw}
          onChange={(e) => setInputRaw(e.target.value)}
          placeholder="Masukkan payload perbankan..."
          className="w-full code-box p-3 text-xs outline-none focus:border-blue-500 resize-y"
        />
      </div>

      {/* Visual Parsed Bit Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Hasil Dekomposisi Bit ISO 8583 (MTI: <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">{parsed.mti}</span>)
        </h4>

        {parsed.fields.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {parsed.fields.map((field) => (
              <div
                key={field.bit}
                className={`p-3 rounded-xl border transition ${
                  field.isSensitive
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400">BIT {field.bit}</span>
                  {field.isSensitive && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5" /> SENSITIVE
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{field.name}</div>
                <div className="font-mono text-xs text-slate-900 dark:text-white mt-1 break-all bg-white dark:bg-black/40 border border-slate-200 dark:border-transparent p-1.5 rounded">
                  {showMasked ? field.maskedValue : field.value}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="code-box p-4 text-xs">
            <pre className="whitespace-pre-wrap">{showMasked ? jsonMasked : inputRaw}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
