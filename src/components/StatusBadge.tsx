import React from 'react';

export function StatusBadge({ status, reopenCount = 0 }: { status: string; reopenCount?: number }) {
  const config: Record<string, { dot: string; text: string; label: string }> = {
    Open: {
      dot: 'bg-blue-500',
      text: 'text-blue-600 dark:text-blue-400',
      label: 'Open',
    },
    Retesting: {
      dot: 'bg-purple-500',
      text: 'text-purple-600 dark:text-purple-400',
      label: 'Retesting',
    },
    'Re-open': {
      dot: 'bg-rose-500',
      text: 'text-rose-600 dark:text-rose-400',
      label: 'Re-open',
    },
    Close: {
      dot: 'bg-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
      label: 'Closed',
    },
  };

  const item = config[status] || config.Open;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap">
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot} shrink-0`} />
      <span className={item.text}>{item.label}</span>
      {reopenCount > 0 && (
        <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
          (#{reopenCount})
        </span>
      )}
    </span>
  );
}
