'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, AlertTriangle, ArrowRight, X } from 'lucide-react';

interface ToastItem {
  id: string;
  title: string;
  message: string;
  type?: string;
  ticket_number?: string;
}

export function NotificationToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Synthesize soft pleasant banking notification audio chime
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.2); // D6

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.5);
      osc2.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio context error ignored
    }
  };

  useEffect(() => {
    let evtSource: EventSource | null = null;

    try {
      evtSource = new EventSource('/api/notifications/stream');

      evtSource.addEventListener('notification', (e) => {
        const data = JSON.parse(e.data);
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            const id = Math.random().toString(36).substring(2, 9);
            setToasts((prev) => [
              ...prev,
              {
                id,
                title: item.title,
                message: item.message,
                type: item.type,
                ticket_number: item.ticket_number,
              },
            ]);
            playChime();

            // Auto dismiss after 6 seconds
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 6000);
          });
        }
      });
    } catch {
      // SSE connection error
    }

    return () => {
      if (evtSource) evtSource.close();
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-slate-900/95 dark:bg-slate-900/95 light:bg-white/95 backdrop-blur-xl border border-blue-500/40 p-4 rounded-xl shadow-2xl shadow-blue-500/20 text-slate-100 light:text-slate-800 flex items-start gap-3"
          >
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
              <Bell className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold truncate text-white light:text-slate-900">{toast.title}</h4>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300 light:text-slate-600 mt-1 leading-relaxed">{toast.message}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
