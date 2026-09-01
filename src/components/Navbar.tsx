'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export function Navbar({ currentUser }: { currentUser: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const json = await res.json();
      if (json.success) {
        setUnreadCount(json.count);
        setNotifications(json.data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'POST' });
      setUnreadCount(0);
      fetchNotifications();
    } catch {}
  };

  const handleRoleSwitch = async (userId: string) => {
    await fetch(`/api/auth/switch?user_id=${userId}`);
    router.refresh();
    window.location.reload();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/defects/kanban', label: 'Kanban' },
    { href: '/defects', label: 'Daftar Defect' },
    { href: '/reports/daily', label: 'Laporan Harian' },
    { href: '/tools/iso8583', label: 'ISO 8583' },
  ];

  if (pathname === '/login') return null;

  return (
    <nav className="glass-nav sticky top-0 z-40 transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-6 shrink-0">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs tracking-tight">
                SP
              </span>
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                Defect Tracker
              </span>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/defects'
                    ? pathname === '/defects' || (pathname.startsWith('/defects/') && !pathname.startsWith('/defects/kanban'))
                    : item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Tools */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Demo Switcher */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500">
              <span>Demo Role:</span>
              <select
                value={currentUser?.id || 1}
                onChange={(e) => handleRoleSwitch(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 rounded px-2 py-1 outline-none cursor-pointer"
              >
                <option value="1">Rina (QC Tester)</option>
                <option value="2">Budi (Developer)</option>
                <option value="3">Agus (Tech Lead)</option>
                <option value="4">Siti (Project Manager)</option>
              </select>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1"
                title="Notifikasi"
              >
                <span>Notifikasi</span>
                {unreadCount > 0 && (
                  <span className="w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-xl z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">Notifikasi Masuk</span>
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Tandai Dibaca
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1.5">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500">Tidak ada notifikasi baru</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-left">
                          <div className="font-semibold text-xs text-blue-600 dark:text-blue-400">{n.title}</div>
                          <div className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5 leading-snug">{n.message}</div>
                          <div className="text-[10px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              title="Ganti Tema"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                {currentUser?.name || 'QC Tester'}
              </span>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-600 transition"
                title="Keluar"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
