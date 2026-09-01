import React from 'react';

export function SeverityBadge({ severity }: { severity: string }) {
  const config: Record<string, { text: string; label: string }> = {
    Blocker: {
      text: 'text-rose-600 dark:text-rose-400 font-semibold',
      label: 'Blocker',
    },
    High: {
      text: 'text-amber-600 dark:text-amber-400 font-semibold',
      label: 'High',
    },
    Medium: {
      text: 'text-slate-600 dark:text-slate-400 font-medium',
      label: 'Medium',
    },
    Low: {
      text: 'text-slate-400 dark:text-slate-500 font-normal',
      label: 'Low',
    },
  };

  const item = config[severity] || config.Medium;

  return (
    <span className={`text-xs ${item.text} whitespace-nowrap`}>
      {item.label}
    </span>
  );
}
