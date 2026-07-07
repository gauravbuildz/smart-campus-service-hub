'use client';

import React from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { 
  Activity, ShieldAlert, BarChart3, PieChart, TrendingUp, AlertTriangle, 
  Bell, FolderOpen, ClipboardList 
} from 'lucide-react';
import { DashboardHero } from '@/components/DashboardHero';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Notice {
  id: string;
  category: string;
  createdAt: string;
}

interface Issue {
  id: string;
  category: string;
  status: string;
  createdAt: string;
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isAdmin = user?.role === 'ADMIN' || user?.email?.includes('admin') || user?.email === 'john@1234';

  const { data: notices = [] } = useSWR<Notice[]>('/api/notices', fetcher);
  const { data: issues = [] } = useSWR<Issue[]>('/api/issues', fetcher);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl text-slate-400 border border-slate-200/80 shadow-sm w-full">
        <ShieldAlert className="w-12 h-12 mb-3 stroke-1 text-slate-355" />
        <p className="text-sm font-semibold">Access Denied: Admin role required</p>
      </div>
    );
  }

  const SERVICE_REQUEST_CATEGORIES = [
    'ID Card Request', 'Bonafide Certificate', 'Hostel Request', 
    'Parking Pass', 'Leave Application', 'Library Card Request', 'Degree/Transcript Request'
  ];

  // Process data
  const complaints = issues.filter(i => !SERVICE_REQUEST_CATEGORIES.includes(i.category));
  const serviceRequests = issues.filter(i => SERVICE_REQUEST_CATEGORIES.includes(i.category));
  const resources = notices.filter(n => ['Academic Forms', 'Study Resources', 'Important Documents', 'Downloads'].includes(n.category));
  const plainNotices = notices.filter(n => !['Academic Forms', 'Study Resources', 'Important Documents', 'Downloads'].includes(n.category));

  // Complaints status counters
  const compPending = complaints.filter(c => c.status === 'PENDING').length;
  const compProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const compResolved = complaints.filter(c => c.status === 'RESOLVED').length;

  // Requests status counters
  const reqPending = serviceRequests.filter(r => r.status === 'PENDING').length;
  const reqApproved = serviceRequests.filter(r => r.status === 'APPROVED' || r.status === 'RESOLVED').length;
  const reqRejected = serviceRequests.filter(r => r.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      <DashboardHero
        icon={Activity}
        title="Campus Analytics Hub"
        description="Monitor smart campus operations, inspect visual statistics, analyze service request rates, and review user interactions."
        gradientClass="from-emerald-600 via-teal-600 to-cyan-500"
        pageType="overview"
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Complaints</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{complaints.length}</span>
            <span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-0.5 mt-1.5">
              <TrendingUp className="w-3 h-3" /> {compResolved} Resolved
            </span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Service Requests</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{serviceRequests.length}</span>
            <span className="text-[9px] text-blue-600 font-extrabold flex items-center gap-0.5 mt-1.5">
              {reqPending} Pending Approval
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Published Materials</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{resources.length}</span>
            <span className="text-[9px] text-slate-400 font-extrabold mt-1.5 block">
              Across 4 academic categories
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <FolderOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Notices & Events</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{plainNotices.length}</span>
            <span className="text-[9px] text-amber-600 font-extrabold mt-1.5 block">
              Broadcasted announcements
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Bell className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SVG Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints Distribution Ring */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase mb-4 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-rose-500" /> Complaints Status Distribution
          </h4>
          <div className="flex items-center justify-center h-44">
            <svg className="w-36 h-36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
              {complaints.length > 0 ? (
                <>
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="4.2" 
                    strokeDasharray={`${(compPending / complaints.length) * 100} ${100 - (compPending / complaints.length) * 100}`} 
                    strokeDashoffset="25" />
                  
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="4.2" 
                    strokeDasharray={`${(compProgress / complaints.length) * 100} ${100 - (compProgress / complaints.length) * 100}`} 
                    strokeDashoffset={25 - ((compPending / complaints.length) * 100)} />

                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="4.2" 
                    strokeDasharray={`${(compResolved / complaints.length) * 100} ${100 - (compResolved / complaints.length) * 100}`} 
                    strokeDashoffset={25 - ((compPending / complaints.length) * 100) - ((compProgress / complaints.length) * 100)} />
                </>
              ) : (
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              )}
            </svg>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] mt-4 border-t border-slate-100 pt-3">
            <div className="flex flex-col">
              <span className="text-rose-500 font-black">● PENDING</span>
              <span className="text-slate-800 font-extrabold mt-0.5">{compPending}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-amber-500 font-black">● IN PROGRESS</span>
              <span className="text-slate-800 font-extrabold mt-0.5">{compProgress}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-emerald-500 font-black">● RESOLVED</span>
              <span className="text-slate-800 font-extrabold mt-0.5">{compResolved}</span>
            </div>
          </div>
        </div>

        {/* Service Requests Distribution Ring */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase mb-4 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-blue-500" /> Service Request Statuses
          </h4>
          <div className="flex items-center justify-center h-44">
            <svg className="w-36 h-36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
              {serviceRequests.length > 0 ? (
                <>
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="4.2" 
                    strokeDasharray={`${(reqPending / serviceRequests.length) * 100} ${100 - (reqPending / serviceRequests.length) * 100}`} 
                    strokeDashoffset="25" />
                  
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="4.2" 
                    strokeDasharray={`${(reqRejected / serviceRequests.length) * 100} ${100 - (reqRejected / serviceRequests.length) * 100}`} 
                    strokeDashoffset={25 - ((reqPending / serviceRequests.length) * 100)} />

                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="4.2" 
                    strokeDasharray={`${(reqApproved / serviceRequests.length) * 100} ${100 - (reqApproved / serviceRequests.length) * 100}`} 
                    strokeDashoffset={25 - ((reqPending / serviceRequests.length) * 100) - ((reqRejected / serviceRequests.length) * 100)} />
                </>
              ) : (
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              )}
            </svg>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] mt-4 border-t border-slate-100 pt-3">
            <div className="flex flex-col">
              <span className="text-blue-500 font-black">● PENDING</span>
              <span className="text-slate-800 font-extrabold mt-0.5">{reqPending}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-rose-500 font-black">● REJECTED</span>
              <span className="text-slate-800 font-extrabold mt-0.5">{reqRejected}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-emerald-500 font-black">● APPROVED</span>
              <span className="text-slate-800 font-extrabold mt-0.5">{reqApproved}</span>
            </div>
          </div>
        </div>

        {/* Complaints categories bar chart */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between lg:col-span-2">
          <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase mb-4 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-indigo-500" /> Complaints by Category (Departmental)
          </h4>
          <div className="flex-1 flex flex-col gap-4">
            {['HOSTEL', 'WIFI', 'CLASSROOM', 'OTHER'].map((cat) => {
              const count = complaints.filter(c => c.category === cat).length;
              const pct = complaints.length > 0 ? (count / complaints.length) * 100 : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-655">
                    <span>{cat}</span>
                    <span>{count} issues ({Math.round(pct)}%)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-1000"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
