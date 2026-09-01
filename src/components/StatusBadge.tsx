import React from 'react';

export function StatusBadge({ status, reopenCount = 0 }: { status: string; reopenCount?: number }) {
  const config: Record<string, { dot: string; bg: string; text: string; label: string }> = {
    Open: {
      dot: 'bg-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-300',
      label: 'Open',
    },
    Retesting: {
      dot: 'bg-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-700 dark:text-purple-300',
      label: 'Retesting',
    },
    'Re-open': {
      dot: 'bg-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      label: 'Re-open',
    },
    Close: {
      dot: 'bg-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      label: 'Closed',
    },
  };

  const item = config[status] || config.Open;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${item.bg} ${item.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
      <span>{item.label}</span>
      {reopenCount > 0 && (
        <span className="ml-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
          (#{reopenCount})
        </span>
      )}
    </span>
  );
}
