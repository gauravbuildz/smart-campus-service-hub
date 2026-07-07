'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Bell, AlertTriangle, Search, LogOut, Menu, X, Calendar, Check, MailOpen, Home, ChevronDown, FolderOpen, ClipboardList, User, Activity, Shield, Sun 
} from 'lucide-react';
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
  const [isSigningOut, setIsSigningOut] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ redirect: false });
    window.location.replace('/auth/login');
  };

  // Redirect to login page immediately if session is unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.replace('/auth/login');
    }
  }, [status]);

  // SWR for Real-Time Background Notification Updates
  const { data: notifications, mutate } = useSWR('/api/notifications', fetcher, {
    refreshInterval: 5000,
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

  // Prevent infinite loading
  useEffect(() => {
    if (status === 'loading') {
      const timer = setTimeout(() => setLoadingTimedOut(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (status === 'unauthenticated' || isSigningOut) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0f172a] z-50">
        <svg className="animate-spin h-8 w-8 text-cyan-400 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase animate-pulse">
          {isSigningOut ? 'Signing out...' : 'Redirecting...'}
        </span>
      </div>
    );
  }

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

  const navigation: SidebarItem[] = isAdmin ? [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: 'Student Management',
      href: '/dashboard/students',
      icon: <User className="w-5 h-5" />,
    },
    {
      name: 'Notice & Event Management',
      href: '/dashboard/notices',
      icon: <Bell className="w-5 h-5" />,
    },
    {
      name: 'Complaint Management',
      href: '/dashboard/issues',
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
      name: 'Lost & Found Management',
      href: '/dashboard/lost-found',
      icon: <Search className="w-5 h-5" />,
    },
    {
      name: 'Resource Management',
      href: '/dashboard/resources',
      icon: <FolderOpen className="w-5 h-5" />,
    },
    {
      name: 'Service Request Management',
      href: '/dashboard/requests',
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: <Activity className="w-5 h-5" />,
    },
  ] : [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: 'Notices & Events',
      href: '/dashboard/notices',
      icon: <Bell className="w-5 h-5" />,
    },
    {
      name: 'Complaints',
      href: '/dashboard/issues',
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
      name: 'Lost & Found',
      href: '/dashboard/lost-found',
      icon: <Search className="w-5 h-5" />,
    },
    {
      name: 'Resource Hub',
      href: '/dashboard/resources',
      icon: <FolderOpen className="w-5 h-5" />,
    },
    {
      name: 'Service Requests',
      href: '/dashboard/requests',
      icon: <ClipboardList className="w-5 h-5" />,
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

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
      <aside className="hidden lg:flex lg:w-64 lg:flex-col shrink-0 border-r border-slate-800 bg-[#0f172a] h-screen overflow-hidden">
        {/* Header */}
        <div className="flex flex-col h-20 justify-center px-6 border-b border-slate-850 bg-slate-950/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-white tracking-tight block uppercase">
                {isAdmin ? '🛡️ Admin Dashboard' : '🎓 Student Dashboard'}
              </span>
              <span className="text-[9px] font-bold text-slate-400 tracking-wide block mt-0.5 uppercase">
                Smart Campus Service Hub
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-850">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
                             (item.href === '/dashboard' && (
                               pathname === '/dashboard' ||
                               pathname === '/admin/dashboard' ||
                               pathname === '/student/dashboard' ||
                               pathname === '/dashboard/' ||
                               pathname === '/admin/dashboard/' ||
                               pathname === '/student/dashboard/'
                             ));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-3.5 mx-3 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-300 group overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 via-indigo-650/15 to-cyan-500/5 text-blue-400 border border-blue-500/10 shadow-sm shadow-blue-500/5'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
                }`}
              >
                {/* Left Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-r-full" />
                )}
                <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-350'}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom Profile and Sign Out fixed */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0f172a] flex flex-col gap-3 shrink-0">
          {/* Profile Card */}
          <Link
            href="/dashboard/profile"
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-[14px] bg-[#1e293b]/70 hover:bg-[#1e293b] border border-slate-700/60 hover:border-blue-500/40 transition-all duration-300 text-left shadow-sm hover:shadow-md hover:shadow-blue-500/5 group cursor-pointer"
          >
            {/* Circular Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-cyan-500 text-white flex items-center justify-center font-black text-xs border border-blue-400/30 shadow-md shrink-0 uppercase group-hover:scale-105 transition-transform duration-300">
              {(user?.name || 'U').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black text-slate-100 group-hover:text-white transition-colors tracking-tight">{user?.name || 'User'}</p>
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1 mt-0.5 group-hover:text-blue-300 transition-colors">
                {isAdmin ? '👨‍💼 Admin' : '👤 Student'}
              </span>
            </div>
          </Link>

          {/* Separate Bottom Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-800 hover:border-rose-500/40 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-white bg-slate-900/20 hover:bg-rose-600 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-rose-500/10 active:scale-[0.98] group/logout"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500 group-hover/logout:text-white transition-colors duration-300" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-14 items-center justify-between px-8 border-b border-slate-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-20 shrink-0 transition-all duration-300">
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 mr-1 transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex flex-col">
              <h1 className="text-[13px] font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                {getGreeting()}, {user?.name || 'User'}
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5">
                Have a productive day!
              </p>
            </div>
          </div>

          {/* Search Bar in center (For all users, larger & centered) */}
          <div className="hidden md:flex flex-1 items-center justify-center max-w-md mx-6 relative group">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
            <input
              type="text"
              placeholder="Search notices, complaints, resources..."
              className="w-full pl-9 pr-4 py-1.5 rounded-full border border-slate-205 bg-slate-50/50 text-[10px] font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm/5"
            />
          </div>

          <div className="flex items-center gap-4.5">
            {/* Theme Toggle Button */}
            <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-55 border border-slate-200 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm/5">
              <Sun className="w-3.5 h-3.5" />
            </button>

            {/* In-App Notification Center Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm/5"
              >
                <Bell className="w-3.5 h-3.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-white">
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

            {/* Current Date Display */}
            <span className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-600 text-[10px] font-black shadow-sm transition-all hover:bg-slate-100/50">
              <Calendar className="w-3.5 h-3.5 text-slate-405 shrink-0" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </span>

            {/* User Avatar */}
            <Link
              href="/dashboard/profile"
              className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-cyan-500 text-white flex items-center justify-center font-black text-xs border border-blue-400/30 shadow-md shrink-0 uppercase group-hover:scale-105 transition-transform duration-305 cursor-pointer"
            >
              {(user?.name || 'U').slice(0, 1).toUpperCase()}
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/40 backdrop-blur-sm">
            <div className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col p-4 animate-slide-in h-full overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-850 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-blue-500/10 rounded-md text-blue-400">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-white uppercase tracking-tight block">
                      {isAdmin ? '🛡️ Admin Dashboard' : '🎓 Student Dashboard'}
                    </span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wide block mt-0.5">
                      Smart Campus Service Hub
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-805"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable menu list */}
              <div className="flex-1 overflow-y-auto space-y-1.5 py-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href ||
                                   (item.href === '/dashboard' && (
                                     pathname === '/dashboard' ||
                                     pathname === '/admin/dashboard' ||
                                     pathname === '/student/dashboard' ||
                                     pathname === '/dashboard/' ||
                                     pathname === '/admin/dashboard/' ||
                                     pathname === '/student/dashboard/'
                                   ));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-300 group overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600/20 via-indigo-650/15 to-cyan-500/5 text-blue-400 border border-blue-500/10'
                          : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      {/* Left Active Indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-r-full" />
                      )}
                      <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-350'}`}>
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Bottom profile and signout fixed */}
              <div className="pt-4 border-t border-slate-800/80 bg-[#0f172a] flex flex-col gap-3 shrink-0">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setSidebarOpen(false)}
                  className="w-full flex items-center gap-3.5 p-3 rounded-[14px] bg-[#1e293b]/70 hover:bg-[#1e293b] border border-slate-700/60 hover:border-blue-500/40 transition-all duration-300 text-left shadow-sm hover:shadow-md hover:shadow-blue-500/5 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-cyan-500 text-white flex items-center justify-center font-black text-xs border border-blue-400/30 shadow-md shrink-0 uppercase group-hover:scale-105 transition-transform duration-300">
                    {(user?.name || 'U').slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black text-slate-100 group-hover:text-white transition-colors tracking-tight">{user?.name || 'User'}</p>
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1 mt-0.5 group-hover:text-blue-300 transition-colors">
                      {isAdmin ? '👨‍💼 Admin' : '👤 Student'}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-800 hover:border-rose-500/40 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-white bg-slate-900/20 hover:bg-rose-600 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-rose-500/10 active:scale-[0.98] group/logout"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500 group-hover/logout:text-white transition-colors duration-300" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Child Pages Stream */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
