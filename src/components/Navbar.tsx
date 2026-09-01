'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import {
  LayoutDashboard,
  Kanban,
  Bug,
  FileText,
  Binary,
  Sun,
  Moon,
  Bell,
  LogOut,
  CheckCheck,
} from 'lucide-react';

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

  const roleBadges: Record<string, { bg: string; text: string; border: string }> = {
    QC: { bg: 'bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/30' },
    DEVELOPER: { bg: 'bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/30' },
    LEAD: { bg: 'bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' },
    PM: { bg: 'bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' },
  };

  const currentRoleStyle = roleBadges[currentUser?.role || 'QC'] || roleBadges.QC;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/defects/kanban', label: 'Kanban', icon: Kanban },
    { href: '/defects', label: 'Daftar Defect', icon: Bug },
    { href: '/reports/daily', label: 'Laporan Harian', icon: FileText },
    { href: '/tools/iso8583', label: 'ISO 8583', icon: Binary },
  ];

  if (pathname === '/login') return null;

  return (
    <nav className="sticky top-0 z-40 glass-nav transition-all">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* 1. Brand Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-600/30 border border-white/20 group-hover:scale-105 transition">
              SP
            </div>
            <div className="hidden sm:block">
              <div className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white leading-none">
                Defect Tracker
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase mt-1">
                PT Sarana Pactindo
              </div>
            </div>
          </Link>

          {/* 2. Navigation Links Center */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/70 p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
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
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* 3. Right Action Tools & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Demo Switcher */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 px-2.5 py-1.5 rounded-xl text-xs shadow-sm">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Demo:</span>
              <select
                value={currentUser?.id || 1}
                onChange={(e) => handleRoleSwitch(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer pr-1"
              >
                <option value="1" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Rina (QC Tester)</option>
                <option value="2" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Budi (Developer)</option>
                <option value="3" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Agus (Tech Lead)</option>
                <option value="4" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Siti (Project Manager)</option>
              </select>
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition shadow-sm"
              title="Ganti Tema (Dark / Light)"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white relative transition shadow-sm"
                title="Notifikasi"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 glass-panel p-3 shadow-2xl z-50 border border-slate-200 dark:border-white/15 bg-white/95 dark:bg-slate-900/95">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-white/10">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Notifikasi Real-time</span>
                    <button
                      onClick={markAllRead}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <CheckCheck className="w-3 h-3" /> Tandai Dibaca
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1.5">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500">Tidak ada notifikasi baru</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition text-left border border-slate-200 dark:border-white/5">
                          <div className="font-semibold text-xs text-blue-600 dark:text-blue-300">{n.title}</div>
                          <div className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5 leading-snug">{n.message}</div>
                          <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2.5 py-1.5 rounded-xl shadow-sm">
                <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                  {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-none truncate max-w-[110px]">
                    {currentUser?.name?.split(' ')[0] || 'QC Tester'}
                  </div>
                  <div className={`text-[9px] font-extrabold uppercase mt-0.5 tracking-wider ${currentRoleStyle.text}`}>
                    {currentUser?.role || 'QC'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
