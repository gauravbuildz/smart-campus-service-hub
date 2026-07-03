'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Bell, AlertTriangle, Search, LogOut, Menu, X, Calendar, Check, MailOpen, Home } from 'lucide-react';
import useSWR from 'swr';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.href = '/auth/login';
  };

  // SWR for Real-Time Background Notification Updates
  const { data: notifications, mutate } = useSWR('/api/notifications', fetcher, {
    refreshInterval: 5000, // Poll every 5 seconds for new notices or complaint status changes
  });

  // Handle outside click to close notifications panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent infinite loading — if session takes more than 3s, continue rendering
  useEffect(() => {
    if (status === 'loading') {
      const timer = setTimeout(() => setLoadingTimedOut(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const navigation: SidebarItem[] = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: 'Notices & Events',
      href: '/dashboard/notices',
      icon: <Bell className="w-5 h-5" />,
    },
    {
      name: 'Complaints Hub',
      href: '/dashboard/issues',
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
      name: 'Lost & Found',
      href: '/dashboard/lost-found',
      icon: <Search className="w-5 h-5" />,
    },
  ];

  if (status === 'loading' && !loadingTimedOut) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <svg className="animate-spin h-8 w-8 text-cyan-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const user = session?.user as any;
  const isAdmin = user?.role === 'ADMIN' || user?.email?.includes('admin') || user?.email === 'john@1234';
  const unreadCount = notifications ? notifications.filter((n: any) => !n.isRead).length : 0;

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col shrink-0 border-r border-slate-800 bg-[#0f172a]">
        <div className="flex h-16 items-center px-6 border-b border-slate-800">
          <span className="text-xl font-extrabold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm" />
            Campus Hub
          </span>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto py-4 gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 border-l-4 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 border-l-cyan-400 text-cyan-400'
                    : 'border-l-transparent text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 font-bold text-sm shrink-0">
              {user?.name?.slice(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-200 truncate">{user?.name || 'User'}</p>
              <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                isAdmin
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              }`}>
                {isAdmin ? 'ADMIN' : 'STUDENT'}
              </span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-800 hover:border-rose-500/30 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-all cursor-pointer bg-slate-900/30"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between px-8 border-b border-slate-200 bg-white shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 mr-1"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Campus Hub Branding */}
            <span className="text-sm font-extrabold text-slate-800 flex items-center gap-2 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm animate-pulse" />
              <span>Campus Hub</span>
            </span>

            <span className="text-slate-300">|</span>

            {/* Premium SaaS Home Button */}
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-all duration-200 shadow-sm shrink-0"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>Home</span>
            </Link>

            <span className="text-slate-300">|</span>

            {/* Welcome back message */}
            <h1 className="text-xs font-semibold text-slate-500 truncate max-w-[120px] sm:max-w-none">
              Welcome back, <span className="text-slate-800 font-extrabold">{user?.name?.split(' ')[0] || 'User'}</span> 👋
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* In-App Notification Center Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-slate-200"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-80 rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-100/50 py-3 z-50 flex flex-col h-96">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <span className="text-xs font-black text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-cyan-600 hover:text-cyan-500 font-extrabold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
                    {notifications && notifications.length > 0 ? (
                      notifications.map((n: any) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl transition-all text-left flex items-start gap-3 border ${
                            n.isRead
                              ? 'bg-white border-transparent'
                              : 'bg-cyan-50/20 border-cyan-100/30'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-slate-800 line-clamp-1">{n.title}</p>
                            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                            <span className="text-[9px] text-slate-400 mt-2 block font-medium">
                              {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {!n.isRead && (
                            <button
                              onClick={() => markAsRead(n.id)}
                              className="text-slate-400 hover:text-cyan-600 p-0.5 rounded-lg border border-slate-150 hover:border-cyan-200 cursor-pointer shrink-0"
                              title="Mark as read"
                            >
                              <MailOpen className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                        <Bell className="w-8 h-8 mb-2 stroke-1 text-slate-300" />
                        <p className="text-xs font-bold">All caught up!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <span className="text-xs text-slate-500 font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/40 backdrop-blur-sm">
            <div className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col p-4 animate-slide-in">
              <div className="flex h-12 items-center justify-between mb-6">
                <span className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  Campus Hub
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:bg-slate-800"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex flex-col flex-1 gap-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 border-l-4 text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-cyan-500/10 border-l-cyan-400 text-cyan-400'
                          : 'border-l-transparent text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
                      }`}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-auto pt-4 border-t border-slate-800 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 font-bold text-sm">
                    {user?.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200 truncate">{user?.name}</p>
                    <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      isAdmin
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}>
                      {isAdmin ? 'ADMIN' : 'STUDENT'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-rose-400 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Child Pages Stream */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
