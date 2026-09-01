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
  UserCheck,
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

  const roleStyles: Record<string, string> = {
    QC: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    DEVELOPER: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    LEAD: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    PM: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/defects/kanban', label: 'Kanban Board', icon: Kanban },
    { href: '/defects', label: 'Daftar Defect', icon: Bug },
    { href: '/reports/daily', label: 'Laporan Harian', icon: FileText },
    { href: '/tools/iso8583', label: 'ISO 8583 Inspector', icon: Binary },
  ];

  if (pathname === '/login') return null;

  return (
    <nav className="sticky top-0 z-40 glass-nav transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/30 border border-white/20">
              SP
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-white light:text-slate-900 leading-none">
                Defect Tracking Engine
              </div>
              <div className="text-[10px] text-slate-400 light:text-slate-500 font-semibold tracking-wider uppercase mt-1">
                PT Sarana Pactindo &bull; Banking QA
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Quick Role Switcher */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 light:bg-slate-100 border border-white/10 light:border-slate-200 px-2.5 py-1.5 rounded-xl">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-medium text-slate-400">Role:</span>
              <select
                value={currentUser?.id || 1}
                onChange={(e) => handleRoleSwitch(e.target.value)}
                className="bg-transparent text-xs font-bold text-white light:text-slate-900 outline-none cursor-pointer"
              >
                <option value="1" className="bg-slate-900 text-white">Rina (QC Tester)</option>
                <option value="2" className="bg-slate-900 text-white">Budi (Developer)</option>
                <option value="3" className="bg-slate-900 text-white">Agus (Tech Lead)</option>
                <option value="4" className="bg-slate-900 text-white">Siti (Project Manager)</option>
              </select>
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-white/10 light:border-slate-200 bg-white/5 light:bg-slate-100 text-slate-300 light:text-slate-700 hover:text-white transition"
              title="Ganti Tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-xl border border-white/10 light:border-slate-200 bg-white/5 light:bg-slate-100 text-slate-300 light:text-slate-700 hover:text-white relative transition"
                title="Notifikasi"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 glass-panel p-3 shadow-2xl z-50 border border-white/15 bg-slate-900/95">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-white">Notifikasi Real-time</span>
                    <button
                      onClick={markAllRead}
                      className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                    >
                      <CheckCheck className="w-3 h-3" /> Tandai Dibaca
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500">Tidak ada notifikasi baru</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition text-left">
                          <div className="font-semibold text-xs text-blue-300">{n.title}</div>
                          <div className="text-[11px] text-slate-300 mt-0.5">{n.message}</div>
                          <div className="text-[9px] text-slate-500 mt-1">{new Date(n.created_at).toLocaleTimeString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Tag */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white light:text-slate-900">{currentUser?.name || 'QC Tester'}</div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border tracking-wider uppercase ${roleStyles[currentUser?.role || 'QC']}`}>
                  {currentUser?.role || 'QC'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
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
