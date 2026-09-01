import React from 'react';

export function StatusBadge({ status, reopenCount = 0 }: { status: string; reopenCount?: number }) {
  const styles: Record<string, string> = {
    Open: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    Retesting: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    'Re-open': 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/40 animate-pulse',
    Close: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  };

  const style = styles[status] || styles['Open'];

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border tracking-wide uppercase ${style}`}>
        {status}
      </span>
      {reopenCount > 0 && (
        <span className="text-[10px] font-black text-red-700 dark:text-red-400 bg-red-500/15 px-1.5 py-0.5 rounded border border-red-500/30">
          #{reopenCount}
        </span>
      )}
    </div>
  );
}
