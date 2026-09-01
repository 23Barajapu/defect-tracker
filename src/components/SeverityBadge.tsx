import React from 'react';

export function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    Blocker: 'bg-red-500/15 text-red-400 border-red-500/30',
    High: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Low: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  };

  const style = styles[severity] || styles.Medium;

  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase border ${style}`}>
      {severity}
    </span>
  );
}
