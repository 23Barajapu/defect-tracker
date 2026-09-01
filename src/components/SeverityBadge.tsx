import React from 'react';

export function SeverityBadge({ severity }: { severity: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    Blocker: {
      bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
      text: 'Blocker',
    },
    High: {
      bg: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300',
      text: 'High',
    },
    Medium: {
      bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
      text: 'Medium',
    },
    Low: {
      bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400',
      text: 'Low',
    },
  };

  const item = config[severity] || config.Medium;

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium tracking-tight ${item.bg}`}>
      {item.text}
    </span>
  );
}
