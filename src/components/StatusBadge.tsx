import React from 'react';

export function StatusBadge({ status, reopenCount = 0 }: { status: string; reopenCount?: number }) {
  const styles: Record<string, string> = {
    Open: 'bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.2)]',
    Retesting: 'bg-purple-500/15 text-purple-400 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]',
    'Re-open': 'bg-red-500/15 text-red-400 border-red-500/40 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.3)]',
    Close: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
  };

  const style = styles[status] || styles['Open'];

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-wide uppercase ${style}`}>
        {status}
      </span>
      {reopenCount > 0 && (
        <span className="text-[10px] font-extrabold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
          #{reopenCount}
        </span>
      )}
    </div>
  );
}
