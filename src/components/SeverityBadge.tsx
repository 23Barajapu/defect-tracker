import React from 'react';

export function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    Blocker: 'bg-red-600 text-white font-bold',
    High: 'bg-orange-500 text-white font-bold',
    Medium: 'bg-amber-400 text-slate-950 font-bold',
    Low: 'bg-slate-600 text-slate-200 font-semibold',
  };

  const style = styles[severity] || styles['Medium'];

  return (
    <span className={`px-2 py-0.5 rounded text-[11px] tracking-tight uppercase shadow-sm ${style}`}>
      {severity}
    </span>
  );
}
