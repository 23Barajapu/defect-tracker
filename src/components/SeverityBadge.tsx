import React from 'react';

export function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    Blocker: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
    High: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
    Medium: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    Low: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
  };

  const style = styles[severity] || styles.Medium;

  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase border ${style}`}>
      {severity}
    </span>
  );
}
