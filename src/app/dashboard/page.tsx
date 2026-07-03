'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { 
  Megaphone, AlertCircle, HelpCircle, MapPin, Calendar, ArrowRight, Inbox, 
  Plus, Pin, Shield, CheckCircle, Clock, Trash2, Tag, FileText, Send, User, ChevronRight, X, Image as ImageIcon
} from 'lucide-react';
import { UploadDropzone } from '@/lib/uploadthing';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Notice {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  attachmentUrl: string | null;
  isPinned: boolean;
  expiryDate: string | null;
  createdAt: string;
  author: { name: string; email: string };
}

interface StatusHistory {
  id: string;
  status: string;
  updatedBy: string;
  comment: string | null;
  createdAt: string;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  severity: string;
  attachmentUrl: string | null;
  createdAt: string;
  updatedAt: string;
  student?: { name: string; email: string };
  history?: StatusHistory[];
}

interface LostItem {
  id: string;
  itemName: string;
  description: string;
  category: string;
  type: string;
  status: string;
  location: string;
  imageUrl: string | null;
  createdAt: string;
  reporter: { name: string; email: string };
}

interface ClaimRequest {
  id: string;
  itemId: string;
  requesterId: string;
  proof: string;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  item: LostItem;
  requester: { name: string; email: string };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const isAdmin = user?.role === 'ADMIN' || user?.email?.includes('admin') || user?.email === 'john@1234';

  // Real-Time Background Synchronization with SWR
  const { data: notices = [], mutate: mutateNotices } = useSWR<Notice[]>('/api/notices', fetcher, { refreshInterval: 5000 });
  const { data: issues = [], mutate: mutateIssues } = useSWR<Issue[]>('/api/issues', fetcher, { refreshInterval: 5000 });
  const { data: lostItems = [], mutate: mutateLostItems } = useSWR<LostItem[]>('/api/lost-found', fetcher, { refreshInterval: 5000 });
  const { data: claims = [], mutate: mutateClaims } = useSWR<ClaimRequest[]>('/api/lost-found/claim', fetcher, { refreshInterval: 5000 });

  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'notices' | 'lost-found'>('overview');
  const [issueFilter, setIssueFilter] = useState({ category: 'ALL', status: 'ALL' });
  const [lostFilter, setLostFilter] = useState({ type: 'ALL', status: 'ALL', category: 'ALL', query: '' });

  // Modals state
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState<Issue | null>(null);
  const [showClaimModal, setShowClaimModal] = useState<LostItem | null>(null);

  // Form states
  const [noticeForm, setNoticeForm] = useState({ title: '', description: '', category: 'GENERAL', priority: 'MEDIUM', attachmentUrl: '', isPinned: false, expiryDate: '' });
  const [statusForm, setStatusForm] = useState({ status: 'PENDING', severity: 'MEDIUM', comment: '' });
  const [claimForm, setClaimForm] = useState({ proof: '', imageUrl: '' });
  const [complaintForm, setComplaintForm] = useState({ title: '', description: '', category: 'HOSTEL', attachmentUrl: '' });
  const [lostReportForm, setLostReportForm] = useState({ itemName: '', description: '', type: 'LOST', category: 'OTHER', location: '', imageUrl: '' });

  if (status === 'loading') {
    return (
      <div className="flex h-48 items-center justify-center bg-white rounded-2xl border border-slate-200/60 shadow-sm">
        <svg className="animate-spin h-6 w-6 text-cyan-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-500 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
        <AlertCircle className="w-8 h-8 mb-2 stroke-1 text-slate-400" />
        <p className="text-xs font-bold">Please log in to view the dashboard.</p>
      </div>
    );
  }

  // Handle Form Submissions
  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noticeForm),
      });
      if (res.ok) {
        setNoticeForm({ title: '', description: '', category: 'GENERAL', priority: 'MEDIUM', attachmentUrl: '', isPinned: false, expiryDate: '' });
        setShowAddNotice(false);
        mutateNotices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showStatusModal) return;
    try {
      const res = await fetch('/api/issues', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: showStatusModal.id,
          status: statusForm.status,
          severity: statusForm.severity,
          comment: statusForm.comment,
        }),
      });
      if (res.ok) {
        setStatusForm({ status: 'PENDING', severity: 'MEDIUM', comment: '' });
        setShowStatusModal(null);
        mutateIssues();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showClaimModal) return;
    try {
      const res = await fetch('/api/lost-found/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: showClaimModal.id,
          proof: claimForm.proof,
          imageUrl: claimForm.imageUrl,
        }),
      });
      if (res.ok) {
        setClaimForm({ proof: '', imageUrl: '' });
        setShowClaimModal(null);
        mutateClaims();
        mutateLostItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveClaim = async (claimId: string) => {
    try {
      const res = await fetch('/api/lost-found/claim', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, status: 'APPROVED' }),
      });
      if (res.ok) {
        mutateClaims();
        mutateLostItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    try {
      const res = await fetch('/api/lost-found/claim', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, status: 'REJECTED' }),
      });
      if (res.ok) {
        mutateClaims();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintForm),
      });
      if (res.ok) {
        setComplaintForm({ title: '', description: '', category: 'HOSTEL', attachmentUrl: '' });
        mutateIssues();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLostItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/lost-found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lostReportForm),
      });
      if (res.ok) {
        setLostReportForm({ itemName: '', description: '', type: 'LOST', category: 'OTHER', location: '', imageUrl: '' });
        mutateLostItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      const res = await fetch(`/api/notices?id=${id}`, { method: 'DELETE' });
      if (res.ok) mutateNotices();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter computations
  const filteredIssues = issues.filter((i) => {
    const matchCat = issueFilter.category === 'ALL' || i.category === issueFilter.category;
    const matchStat = issueFilter.status === 'ALL' || i.status === issueFilter.status;
    return matchCat && matchStat;
  });

  const filteredLostItems = lostItems.filter((item) => {
    const matchType = lostFilter.type === 'ALL' || item.type === lostFilter.type;
    const matchStat = lostFilter.status === 'ALL' || item.status === lostFilter.status;
    const matchCat = lostFilter.category === 'ALL' || item.category === lostFilter.category;
    const matchSearch = item.itemName.toLowerCase().includes(lostFilter.query.toLowerCase()) || 
                        item.description.toLowerCase().includes(lostFilter.query.toLowerCase());
    return matchType && matchStat && matchCat && matchSearch;
  });

  // Calculations for Admin Analytics
  const totalComplaints = issues.length;
  const pendingCount = issues.filter(i => i.status === 'PENDING').length;
  const progressCount = issues.filter(i => i.status === 'IN_PROGRESS').length;
  const resolvedCount = issues.filter(i => i.status === 'RESOLVED').length;

  const categoryCounts = issues.reduce((acc: any, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {});

  const totalNotices = notices.length;
  const activeClaims = claims.filter(c => c.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Tab Navigation header */}
      <div className="border-b border-slate-200 shrink-0">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'issues' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Complaints & Issues
          </button>
          <button
            onClick={() => setActiveTab('notices')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'notices' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Announcements Board
          </button>
          <button
            onClick={() => setActiveTab('lost-found')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'lost-found' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Lost & Found Desk
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {isAdmin && <Shield className="w-5 h-5 text-emerald-500" />}
                {isAdmin ? 'Administrator Analytics Hub' : 'Student Dashboard'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Real-time status indicators and metrics.</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm relative overflow-hidden group">
              <span className="text-xs font-semibold text-slate-400">Total Notices</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalNotices}</h3>
              <div className="absolute right-4 bottom-4 p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                <Megaphone className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm relative overflow-hidden group">
              <span className="text-xs font-semibold text-slate-400">Active Complaints</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{pendingCount + progressCount}</h3>
              <div className="absolute right-4 bottom-4 p-2 bg-rose-50 text-rose-600 rounded-xl">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm relative overflow-hidden group">
              <span className="text-xs font-semibold text-slate-400">Resolved Rate</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {totalComplaints > 0 ? `${Math.round((resolvedCount / totalComplaints) * 100)}%` : '0%'}
              </h3>
              <div className="absolute right-4 bottom-4 p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm relative overflow-hidden group">
              <span className="text-xs font-semibold text-slate-400">Pending Claim Requests</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{activeClaims}</h3>
              <div className="absolute right-4 bottom-4 p-2 bg-amber-50 text-amber-600 rounded-xl">
                <HelpCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Admin Visual Charts Grid */}
          {isAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Complaints Status Chart (SVG Ring) */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase mb-4">Complaints Status Distribution</h4>
                <div className="flex items-center justify-center h-40">
                  <svg className="w-36 h-36" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                    
                    {totalComplaints > 0 ? (
                      <>
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="4.2" 
                          strokeDasharray={`${(pendingCount / totalComplaints) * 100} ${100 - (pendingCount / totalComplaints) * 100}`} 
                          strokeDashoffset="25" />
                        
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="4.2" 
                          strokeDasharray={`${(progressCount / totalComplaints) * 100} ${100 - (progressCount / totalComplaints) * 100}`} 
                          strokeDashoffset={25 - ((pendingCount / totalComplaints) * 100)} />

                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="4.2" 
                          strokeDasharray={`${(resolvedCount / totalComplaints) * 100} ${100 - (resolvedCount / totalComplaints) * 100}`} 
                          strokeDashoffset={25 - ((pendingCount / totalComplaints) * 100) - ((progressCount / totalComplaints) * 100)} />
                      </>
                    ) : (
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                    )}
                  </svg>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] mt-4 border-t border-slate-50 pt-3">
                  <div className="flex flex-col">
                    <span className="text-rose-500 font-extrabold">● PENDING</span>
                    <span className="text-slate-800 font-bold mt-0.5">{pendingCount}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-amber-500 font-extrabold">● IN PROGRESS</span>
                    <span className="text-slate-800 font-bold mt-0.5">{progressCount}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-emerald-500 font-extrabold">● RESOLVED</span>
                    <span className="text-slate-800 font-bold mt-0.5">{resolvedCount}</span>
                  </div>
                </div>
              </div>

              {/* Complaints Categories Bar Chart (SVG Bars) */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between col-span-2">
                <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase mb-4">Complaints by Category (Departmental)</h4>
                <div className="flex-1 flex flex-col justify-center gap-4">
                  {['HOSTEL', 'WIFI', 'CLASSROOM', 'OTHER'].map((cat) => {
                    const count = categoryCounts[cat] || 0;
                    const pct = totalComplaints > 0 ? (count / totalComplaints) * 100 : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-600">
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
          )}

          {/* Feed Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notices feed */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Announcements board
                </span>
                <button onClick={() => setActiveTab('notices')} className="text-[10px] text-cyan-600 font-extrabold hover:underline">View all</button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {notices.map((n) => (
                  <div key={n.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/50 flex items-start gap-3 hover:bg-white hover:shadow-sm hover:border-cyan-200/50 transition-all">
                    <Megaphone className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-black text-slate-800 line-clamp-1 flex items-center gap-1">
                          {n.title}
                          {n.isPinned && <Pin className="w-3.5 h-3.5 text-rose-500 rotate-45 shrink-0" />}
                        </p>
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase shrink-0">{n.category}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1 line-clamp-2">{n.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Claims feed (Admins) / Status timeline (Students) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
              {isAdmin ? (
                <>
                  <div className="flex justify-between items-center mb-4 shrink-0">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pending Claims approvals desk
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{activeClaims} Requests</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {claims.filter(c => c.status === 'PENDING').length > 0 ? (
                      claims.filter(c => c.status === 'PENDING').map((claim) => (
                        <div key={claim.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/50 space-y-3">
                          <div>
                            <p className="text-xs font-black text-slate-800">Claim for: {claim.item.itemName}</p>
                            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed"><span className="font-bold text-slate-600">Proof Description:</span> {claim.proof}</p>
                            
                            {/* Display visual claim image proof if exists */}
                            {claim.imageUrl && (
                              <div className="h-24 w-36 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative mt-2.5">
                                <img 
                                  src={claim.imageUrl} 
                                  alt="Claim proof document" 
                                  className="object-cover w-full h-full"
                                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                />
                              </div>
                            )}

                            <p className="text-[9px] text-slate-400 mt-2">Submitted by: {claim.requester.name} ({claim.requester.email})</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleApproveClaim(claim.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleRejectClaim(claim.id)}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Inbox className="w-8 h-8 mb-1 stroke-1" />
                        <p className="text-xs font-bold">No claim requests pending</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4 shrink-0">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Your complaints activity log
                    </span>
                    <button onClick={() => setActiveTab('issues')} className="text-[10px] text-rose-600 font-extrabold hover:underline">Create new</button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {issues.length > 0 ? (
                      issues.map((i) => (
                        <div key={i.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/50 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-black text-slate-800 line-clamp-1">{i.title}</p>
                            <span className="text-[9px] font-bold text-slate-400 mt-1 block">Category: {i.category} | Severity: {i.severity}</span>
                          </div>
                          <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                            i.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                            i.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {i.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Inbox className="w-8 h-8 mb-1 stroke-1" />
                        <p className="text-xs font-bold">You haven't filed any complaints</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. COMPLAINTS & ISSUES TAB */}
      {activeTab === 'issues' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List complaints */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Active Complaints hub</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Filter and review issues reported on campus.</p>
              </div>
              <div className="flex gap-2">
                <select 
                  value={issueFilter.category}
                  onChange={(e) => setIssueFilter({ ...issueFilter, category: e.target.value })}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs font-bold focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="HOSTEL">Hostel</option>
                  <option value="WIFI">Wi-Fi</option>
                  <option value="CLASSROOM">Classroom</option>
                  <option value="OTHER">Other</option>
                </select>

                <select 
                  value={issueFilter.status}
                  onChange={(e) => setIssueFilter({ ...issueFilter, status: e.target.value })}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs font-bold focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue) => (
                  <div key={issue.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-350 bg-slate-50/30 space-y-3 transition-all">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-xs font-black text-slate-800 line-clamp-1">{issue.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{issue.description}</p>
                        
                        {issue.attachmentUrl && (
                          <div className="h-28 w-44 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative mt-2.5">
                            <img 
                              src={issue.attachmentUrl} 
                              alt="Attachment preview" 
                              className="object-cover w-full h-full"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                          </div>
                        )}

                        {isAdmin && issue.student && (
                          <span className="text-[9px] font-bold text-slate-400 mt-2 block flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-350" /> Reported by: {issue.student.name}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 items-end shrink-0">
                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                          issue.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                          issue.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {issue.status}
                        </span>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${
                          issue.severity === 'HIGH' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          issue.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-cyan-50 text-cyan-600 border border-cyan-100'
                        }`}>
                          SEVERITY: {issue.severity}
                        </span>
                      </div>
                    </div>

                    {/* Render Timeline/History logs */}
                    {issue.history && issue.history.length > 0 && (
                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Status history timeline</span>
                        <div className="space-y-1.5">
                          {issue.history.map((h) => (
                            <div key={h.id} className="text-[10px] text-slate-500 flex items-start gap-2 leading-relaxed">
                              <Clock className="w-3.5 h-3.5 text-slate-350 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <span className="font-extrabold text-slate-700">[{h.status}]</span> {h.comment || 'Updated.'}{' '}
                                <span className="text-[9px] text-slate-400 font-medium">by {h.updatedBy} ({new Date(h.createdAt).toLocaleDateString()})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Admin Actions buttons */}
                    {isAdmin && (
                      <div className="flex gap-2 justify-end border-t border-slate-100 pt-3">
                        <button
                          onClick={() => {
                            setStatusForm({ status: issue.status, severity: issue.severity, comment: '' });
                            setShowStatusModal(issue);
                          }}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-350 text-[10px] font-bold text-slate-700 bg-white transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          Manage Status <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                  <Inbox className="w-10 h-10 mb-2 stroke-1" />
                  <p className="text-xs font-bold">No issues match the filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Form to raise issue (Student only) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-start">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              {isAdmin ? 'Admin Information desk' : 'Raise a new complaint'}
            </h3>
            {!isAdmin ? (
              <form onSubmit={handleAddComplaint} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Complaint Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Broken hostel geyser, slow room Wi-Fi..."
                    value={complaintForm.title}
                    onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Category</label>
                  <select
                    value={complaintForm.category}
                    onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  >
                    <option value="HOSTEL">Hostel</option>
                    <option value="WIFI">Wi-Fi</option>
                    <option value="CLASSROOM">Classroom</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Complaint Image Upload via Uploadthing */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Attachment Image</label>
                  {complaintForm.attachmentUrl ? (
                    <div className="relative rounded-xl border border-slate-250 p-2.5 bg-slate-50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ImageIcon className="w-5 h-5 text-slate-400 shrink-0" />
                        <span className="text-[10px] text-slate-600 font-bold truncate max-w-[150px]">Image Uploaded!</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setComplaintForm({ ...complaintForm, attachmentUrl: '' })}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <UploadDropzone
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => setComplaintForm({ ...complaintForm, attachmentUrl: res[0].url })}
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Description</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your problem. Write clearly (our AI engine auto-assesses urgency based on details!)."
                    value={complaintForm.description}
                    onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all inline-flex items-center justify-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Complaint
                </button>
              </form>
            ) : (
              <div className="text-xs text-slate-500 leading-relaxed font-medium space-y-2">
                <p>As an **administrator**, you have full oversight of student issues.</p>
                <ul className="list-disc pl-4 space-y-1.5">
                  <li>Review logs filed by students.</li>
                  <li>Perform keyword auto-classification checks.</li>
                  <li>Update resolution status, set severities, and log timeline comments.</li>
                  <li>In-app notifications trigger automatically on status updates.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. ANNOUNCEMENTS BOARD TAB */}
      {activeTab === 'notices' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Campus notices & events board</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Pinned notices float to the top and expired items hide automatically.</p>
            </div>
            {user.role === 'ADMIN' && (
              <button
                onClick={() => setShowAddNotice(true)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" /> Post Announcement
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notices.length > 0 ? (
              notices.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-6 rounded-2xl border bg-white flex flex-col justify-between min-h-[220px] transition-all relative overflow-hidden group shadow-sm hover:shadow-md ${
                    n.isPinned ? 'border-cyan-300 ring-2 ring-cyan-500/10' : 'border-slate-200/80'
                  }`}
                >
                  {n.isPinned && (
                    <div className="absolute top-0 right-0 bg-cyan-500 text-white px-3 py-1 rounded-bl-xl text-[9px] font-black tracking-wide inline-flex items-center gap-1 uppercase">
                      Pinned <Pin className="w-3 h-3 rotate-45" />
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${
                        n.category === 'EXAM' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        n.category === 'EVENT' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        n.category === 'CIRCULAR' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                        'bg-cyan-50 text-cyan-600 border border-cyan-100'
                      }`}>
                        {n.category}
                      </span>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-md border ${
                        n.priority === 'URGENT' ? 'bg-red-50 text-red-600 border-red-100 font-extrabold' :
                        n.priority === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        n.priority === 'LOW' ? 'bg-slate-50 text-slate-600 border-slate-100' :
                        'bg-cyan-50 text-cyan-600 border-cyan-100'
                      }`}>
                        PRIORITY: {n.priority}
                      </span>
                      {n.expiryDate && (
                        <span className="text-[9px] font-bold text-slate-400">
                          Expires: {new Date(n.expiryDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-black text-slate-800 line-clamp-1 pr-12">{n.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium line-clamp-4">{n.description}</p>
                    
                    {n.attachmentUrl && (
                      <div className="h-28 w-full bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative mt-2.5">
                        <img 
                          src={n.attachmentUrl} 
                          alt="Notice attachment" 
                          className="object-cover w-full h-full"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-3 text-[10px] text-slate-400 font-bold shrink-0">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    
                    {user.role === 'ADMIN' ? (
                      <button
                        onClick={() => handleDeleteNotice(n.id)}
                        className="text-rose-500 hover:text-rose-600 p-1.5 rounded-xl border border-transparent hover:border-rose-200/50 hover:bg-rose-50 cursor-pointer transition-all"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="font-semibold text-slate-500">by {n.author.name.split(' ')[0]}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                <Inbox className="w-12 h-12 mb-2 stroke-1" />
                <p className="text-xs font-bold">No announcements posted on the board</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. LOST & FOUND TAB */}
      {activeTab === 'lost-found' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Lost & Found grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
            {/* Filter controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Lost & Found gallery</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Locate missing belongings or claim items found on campus.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <input 
                  type="text"
                  placeholder="Search items..."
                  value={lostFilter.query}
                  onChange={(e) => setLostFilter({ ...lostFilter, query: e.target.value })}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs font-bold focus:outline-none w-28"
                />
                
                <select 
                  value={lostFilter.type}
                  onChange={(e) => setLostFilter({ ...lostFilter, type: e.target.value })}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs font-bold focus:outline-none"
                >
                  <option value="ALL">All Types</option>
                  <option value="LOST">Lost</option>
                  <option value="FOUND">Found</option>
                </select>

                <select 
                  value={lostFilter.category}
                  onChange={(e) => setLostFilter({ ...lostFilter, category: e.target.value })}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs font-bold focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="ELECTRONICS">Electronics</option>
                  <option value="BOOKS">Books</option>
                  <option value="ID_CARDS">ID Cards</option>
                  <option value="CLOTHING">Clothing</option>
                  <option value="OTHER">Other</option>
                </select>

                <select 
                  value={lostFilter.status}
                  onChange={(e) => setLostFilter({ ...lostFilter, status: e.target.value })}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs font-bold focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="REPORTED">Active</option>
                  <option value="CLAIMED">Claimed</option>
                </select>
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
              {filteredLostItems.length > 0 ? (
                filteredLostItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 flex flex-col justify-between gap-3 relative overflow-hidden">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${
                          item.type === 'LOST' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {item.type}
                        </span>
                        <div className="flex gap-1">
                          <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase border border-slate-200/50">
                            {item.category}
                          </span>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${
                            item.status === 'CLAIMED' ? 'bg-slate-200 text-slate-600' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.status === 'CLAIMED' ? 'CLAIMED' : 'ACTIVE'}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-xs font-black text-slate-800">{item.itemName}</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-medium line-clamp-3">{item.description}</p>
                      
                      {item.imageUrl && (
                        <div className="h-28 w-full bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative">
                          <img 
                            src={item.imageUrl} 
                            alt={item.itemName} 
                            className="object-cover w-full h-full"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        </div>
                      )}

                      <p className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location: <span className="text-slate-800 font-bold">{item.location}</span>
                      </p>
                    </div>

                    <div className="border-t border-slate-50 pt-2 flex items-center justify-between gap-2">
                      <span className="text-[9px] text-slate-400 font-bold">
                        📅 {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      {user.role === 'STUDENT' && item.type === 'FOUND' && item.status !== 'CLAIMED' && (
                        <button
                          onClick={() => {
                            setClaimForm({ proof: '', imageUrl: '' });
                            setShowClaimModal(item);
                          }}
                          className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                        >
                          Claim Item
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                  <Inbox className="w-10 h-10 mb-2 stroke-1" />
                  <p className="text-xs font-bold">No gallery items matched your filter</p>
                </div>
              )}
            </div>
          </div>

          {/* Form to report item */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Report lost/found item</h3>
            <form onSubmit={handleAddLostItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blue umbrella, keys on steel ring..."
                  value={lostReportForm.itemName}
                  onChange={(e) => setLostReportForm({ ...lostReportForm, itemName: e.target.value })}
                  className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Type</label>
                  <select
                    value={lostReportForm.type}
                    onChange={(e) => setLostReportForm({ ...lostReportForm, type: e.target.value })}
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  >
                    <option value="LOST">Lost</option>
                    <option value="FOUND">Found</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Category</label>
                  <select
                    value={lostReportForm.category}
                    onChange={(e) => setLostReportForm({ ...lostReportForm, category: e.target.value })}
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  >
                    <option value="ELECTRONICS">Electronics</option>
                    <option value="BOOKS">Books</option>
                    <option value="ID_CARDS">ID Cards</option>
                    <option value="CLOTHING">Clothing</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Library 2nd floor, Hostel C Mess..."
                  value={lostReportForm.location}
                  onChange={(e) => setLostReportForm({ ...lostReportForm, location: e.target.value })}
                  className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              {/* Uploadthing dropzone replaces old text input */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Item Image Upload</label>
                {lostReportForm.imageUrl ? (
                  <div className="relative rounded-xl border border-slate-250 p-2.5 bg-slate-50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ImageIcon className="w-5 h-5 text-slate-400 shrink-0" />
                      <span className="text-[10px] text-slate-600 font-bold truncate max-w-[150px]">Image Uploaded!</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setLostReportForm({ ...lostReportForm, imageUrl: '' })}
                      className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <UploadDropzone
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => setLostReportForm({ ...lostReportForm, imageUrl: res[0].url })}
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide distinct characteristics like color, brand, serial keys, etc."
                  value={lostReportForm.description}
                  onChange={(e) => setLostReportForm({ ...lostReportForm, description: e.target.value })}
                  className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all inline-flex items-center justify-center gap-1"
              >
                Report Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS RENDER SECTION */}
      {/* ======================================================== */}

      {/* Modal 1: Post Notice Modal */}
      {showAddNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Post New Notice</h3>
              <button onClick={() => setShowAddNotice(false)} className="text-slate-400 hover:text-slate-650 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddNotice} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Announcement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End Semester Exam Schedule published..."
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Category</label>
                  <select
                    value={noticeForm.category}
                    onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  >
                    <option value="GENERAL">General</option>
                    <option value="EXAM">Exam</option>
                    <option value="EVENT">Event</option>
                    <option value="CIRCULAR">Circular</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Priority Level</label>
                  <select
                    value={noticeForm.priority}
                    onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={noticeForm.expiryDate}
                    onChange={(e) => setNoticeForm({ ...noticeForm, expiryDate: e.target.value })}
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Uploadthing Dropzone for notice attachment */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Notice Image Attachment (Optional)</label>
                {noticeForm.attachmentUrl ? (
                  <div className="relative rounded-xl border border-slate-250 p-2.5 bg-slate-50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ImageIcon className="w-5 h-5 text-slate-400 shrink-0" />
                      <span className="text-[10px] text-slate-600 font-bold truncate max-w-[150px]">Image Uploaded!</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setNoticeForm({ ...noticeForm, attachmentUrl: '' })}
                      className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <UploadDropzone
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => setNoticeForm({ ...noticeForm, attachmentUrl: res[0].url })}
                  />
                )}
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={noticeForm.isPinned}
                  onChange={(e) => setNoticeForm({ ...noticeForm, isPinned: e.target.checked })}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 h-4 w-4"
                />
                <label htmlFor="isPinned" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Pin announcement to top of notice board
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail your announcement text..."
                  value={noticeForm.description}
                  onChange={(e) => setNoticeForm({ ...noticeForm, description: e.target.value })}
                  className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                Post Notice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Manage Status/Severity Modal (Admins) */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Manage Complaint Status</h3>
              <button onClick={() => setShowStatusModal(null)} className="text-slate-400 hover:text-slate-650 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <p className="text-xs font-bold text-slate-700">Complaint: {showStatusModal.title}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Resolution Status</label>
                  <select
                    value={statusForm.status}
                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Urgency/Severity</label>
                  <select
                    value={statusForm.severity}
                    onChange={(e) => setStatusForm({ ...statusForm, severity: e.target.value })}
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Timeline Log Comment</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain actions taken (e.g. Electrician scheduled for 3 PM...)"
                  value={statusForm.comment}
                  onChange={(e) => setStatusForm({ ...statusForm, comment: e.target.value })}
                  className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                Update and Log Status
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Claim Found Item Modal (Students) */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 text-left">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">File ownership claim</h3>
              <button onClick={() => setShowClaimModal(null)} className="text-slate-400 hover:text-slate-650 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitClaim} className="space-y-4">
              <p className="text-xs font-bold text-slate-700">Claiming: {showClaimModal.itemName}</p>
              
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Proof of Ownership Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe unique identifiers, serial keys, tags, or specify contents if it is a bag/wallet to verify you own this item."
                  value={claimForm.proof}
                  onChange={(e) => setClaimForm({ ...claimForm, proof: e.target.value })}
                  className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 resize-none"
                />
              </div>

              {/* Uploadthing Dropzone for Claim Image Proof */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Proof Receipt / Image</label>
                {claimForm.imageUrl ? (
                  <div className="relative rounded-xl border border-slate-250 p-2.5 bg-slate-50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ImageIcon className="w-5 h-5 text-slate-400 shrink-0" />
                      <span className="text-[10px] text-slate-600 font-bold truncate max-w-[150px]">Proof Image Uploaded!</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setClaimForm({ ...claimForm, imageUrl: '' })}
                      className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <UploadDropzone
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => setClaimForm({ ...claimForm, imageUrl: res[0].url })}
                  />
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                Submit Ownership Claim
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
