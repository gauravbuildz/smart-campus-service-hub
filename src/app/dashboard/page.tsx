'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { 
  Megaphone, AlertCircle, HelpCircle, MapPin, Calendar, ArrowRight, Inbox, 
  Plus, Pin, Shield, CheckCircle, Clock, Trash2, Tag, FileText, Send, User, ChevronRight, X, Image as ImageIcon,
  FolderOpen, ClipboardList, Bell, AlertTriangle, Search, Activity, Home
} from 'lucide-react';
import { UploadDropzone } from '@/lib/uploadthing';
import { DashboardHero } from '@/components/DashboardHero';

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


interface StudentOverviewProps {
  totalNotices: number;
  pendingCount: number;
  progressCount: number;
  resolvedCount: number;
  totalComplaints: number;
  activeClaims: number;
  categoryCounts: any;
  notices: any[];
  issues: any[];
  lostItems: any[];
  claims: any[];
  setActiveTab: (tab: any) => void;
  isAdmin: boolean;
  handleApproveClaim: (claimId: string) => void;
  handleRejectClaim: (claimId: string) => void;
  user: any;
  getGreeting: () => string;
}

function StudentOverview({
  totalNotices,
  pendingCount,
  progressCount,
  resolvedCount,
  totalComplaints,
  activeClaims,
  categoryCounts,
  notices,
  issues,
  lostItems,
  claims,
  setActiveTab,
  isAdmin,
  handleApproveClaim,
  handleRejectClaim,
  user,
  getGreeting
}: StudentOverviewProps) {
  const router = useRouter();
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Welcome Banner */}
      <DashboardHero
        title={`👋 ${getGreeting()}, ${user?.name || 'Student'}`}
        description="Welcome back to your Smart Campus Service Hub. View notifications, track complaints, or apply for service certificates."
        icon={Home}
        gradientClass="from-blue-600 via-indigo-650 to-cyan-500"
        pageType="overview"
        metadata={
          <>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {isAdmin ? 'System Administration & Operations' : 'Information Technology Department'}
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Student ID: <span className="text-white font-extrabold">STU-{user?.id?.slice(0, 6).toUpperCase()}</span>
            </p>
          </>
        }
      />

      {/* 2. Live Statistics */}
      <div className="space-y-3">
        <span className="text-[10px] font-black text-slate-800 tracking-wider uppercase">Your Dashboard Statistics</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <span className="text-xs font-semibold text-slate-400">Total Notices</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{totalNotices}</h3>
            <div className="absolute right-4 bottom-4 p-2 bg-cyan-50 text-cyan-600 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <span className="text-xs font-semibold text-slate-400">Active Complaints</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{pendingCount + progressCount}</h3>
            <div className="absolute right-4 bottom-4 p-2 bg-rose-50 text-rose-605 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <span className="text-xs font-semibold text-slate-400">Resolved Rate</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">
              {totalComplaints > 0 ? `${Math.round((resolvedCount / totalComplaints) * 100)}%` : '0%'}
            </h3>
            <div className="absolute right-4 bottom-4 p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <span className="text-xs font-semibold text-slate-400">Pending Requests</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">
              {(() => {
                const SERVICE_REQUEST_CATEGORIES = [
                  'ID Card Request', 'Bonafide Certificate', 'Hostel Request', 
                  'Parking Pass', 'Leave Application', 'Library Card Request', 'Degree/Transcript Request'
                ];
                return issues.filter((i: any) => SERVICE_REQUEST_CATEGORIES.includes(i.category) && i.status === 'PENDING').length;
              })()}
            </h3>
            <div className="absolute right-4 bottom-4 p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>

        </div>
      </div>

      {/* 3. Quick Actions */}
      <div className="space-y-3">
        <span className="text-[10px] font-black text-slate-800 tracking-wider uppercase">Quick Actions</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <button
            onClick={() => router.push('/dashboard/issues')}
            className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm text-left hover:shadow-md hover:border-rose-500/20 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:bg-rose-600 group-hover:text-white transition-all">
              <AlertCircle className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-800">Submit Complaint</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Report a new issue on campus.</p>
          </button>

          <button
            onClick={() => router.push('/dashboard/lost-found')}
            className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm text-left hover:shadow-md hover:border-amber-500/20 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <Search className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-800">Report Lost/Found</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Search or declare items.</p>
          </button>

          <button
            onClick={() => router.push('/dashboard/requests')}
            className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm text-left hover:shadow-md hover:border-emerald-500/25 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <ClipboardList className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-800">Request Services</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Apply for ID cards, forms, etc.</p>
          </button>

          <button
            onClick={() => router.push('/dashboard/resources')}
            className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm text-left hover:shadow-md hover:border-indigo-500/20 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <FolderOpen className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-800">Resource Hub</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Download forms & resources.</p>
          </button>

        </div>
      </div>

      {/* 4. Student Feeds Section */}
      <div className="space-y-6">
        
        {/* 4.1. Recent Notices */}
        <div className="bg-white p-6 rounded-[18px] border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center shrink-0">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" /> Recent Notices & Events
            </span>
            <button onClick={() => router.push('/dashboard/notices')} className="text-[10px] text-cyan-600 font-extrabold hover:underline">View All Board</button>
          </div>
          <div className="space-y-2.5">
            {(() => {
              const plainNotices = notices.filter((n: any) => !['Academic Forms', 'Study Resources', 'Important Documents', 'Downloads'].includes(n.category));
              return plainNotices.slice(0, 3).length > 0 ? (
                plainNotices.slice(0, 3).map((n: any) => (
                  <div key={n.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl hover:bg-slate-100/50 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md">{n.category}</span>
                      <span className="text-[9px] text-slate-400 font-extrabold">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs font-black text-slate-800 truncate">{n.title}</p>
                    <p className="text-[10.5px] text-slate-500 font-semibold line-clamp-1 leading-relaxed mt-0.5">{n.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4 font-semibold">No announcements published.</p>
              );
            })()}
          </div>
        </div>

        {/* 4.2. Recent Complaints */}
        <div className="bg-white p-6 rounded-[18px] border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center shrink-0">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" /> Your Recent Complaints
            </span>
            <button onClick={() => router.push('/dashboard/issues')} className="text-[10px] text-rose-600 font-extrabold hover:underline">Track Complaints</button>
          </div>
          <div className="space-y-2.5">
            {(() => {
              const SERVICE_REQUEST_CATEGORIES = [
                'ID Card Request', 'Bonafide Certificate', 'Hostel Request', 
                'Parking Pass', 'Leave Application', 'Library Card Request', 'Degree/Transcript Request'
              ];
              const studentComplaints = issues.filter((i: any) => !SERVICE_REQUEST_CATEGORIES.includes(i.category));
              return studentComplaints.slice(0, 3).length > 0 ? (
                studentComplaints.slice(0, 3).map((i: any) => (
                  <div key={i.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between hover:bg-slate-100/50 transition-colors">
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black uppercase text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md">{i.category}</span>
                        <span className="text-[8px] font-black uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">{i.status}</span>
                        <span className="text-[9px] text-slate-400 font-extrabold">{new Date(i.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs font-black text-slate-800 mt-1 truncate">{i.title}</p>
                    </div>
                    <button onClick={() => router.push('/dashboard/issues')} className="text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-rose-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm shrink-0 cursor-pointer">View</button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4 font-semibold">No complaints raised.</p>
              );
            })()}
          </div>
        </div>

        {/* 4.3. Recent Lost & Found */}
        <div className="bg-white p-6 rounded-[18px] border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center shrink-0">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" /> Recent Lost & Found reports
            </span>
            <button onClick={() => router.push('/dashboard/lost-found')} className="text-[10px] text-amber-600 font-extrabold hover:underline">View Desk</button>
          </div>
          <div className="space-y-2.5">
            {lostItems.slice(0, 3).length > 0 ? (
              lostItems.slice(0, 3).map((l: any) => (
                <div key={l.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between hover:bg-slate-100/50 transition-colors">
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${l.type === 'LOST' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>{l.type}</span>
                      <span className="text-[8px] font-black uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">{l.category}</span>
                      <span className="text-[9px] text-slate-400 font-extrabold">{new Date(l.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs font-black text-slate-800 mt-1 truncate">{l.itemName}</p>
                  </div>
                  <button onClick={() => router.push('/dashboard/lost-found')} className="text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-amber-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm shrink-0 cursor-pointer">View</button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4 font-semibold">No items declared.</p>
            )}
          </div>
        </div>

        {/* 4.4. Recent Service Requests */}
        <div className="bg-white p-6 rounded-[18px] border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center shrink-0">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> Your Service Requests
            </span>
            <button onClick={() => router.push('/dashboard/requests')} className="text-[10px] text-emerald-600 font-extrabold hover:underline">Track Requests</button>
          </div>
          <div className="space-y-2.5">
            {(() => {
              const SERVICE_REQUEST_CATEGORIES = [
                'ID Card Request', 'Bonafide Certificate', 'Hostel Request', 
                'Parking Pass', 'Leave Application', 'Library Card Request', 'Degree/Transcript Request'
              ];
              const studentRequests = issues.filter((i: any) => SERVICE_REQUEST_CATEGORIES.includes(i.category));
              return studentRequests.slice(0, 3).length > 0 ? (
                studentRequests.slice(0, 3).map((r: any) => (
                  <div key={r.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between hover:bg-slate-100/50 transition-colors">
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black uppercase text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md">{r.category}</span>
                        <span className="text-[8px] font-black uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">{r.status}</span>
                        <span className="text-[9px] text-slate-400 font-extrabold">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs font-black text-slate-800 mt-1 truncate">{r.title}</p>
                    </div>
                    <button onClick={() => router.push('/dashboard/requests')} className="text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-blue-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm shrink-0 cursor-pointer">View</button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4 font-semibold">No service requests submitted.</p>
              );
            })()}
          </div>
        </div>

        {/* 4.5. Recently Added Resources */}
        <div className="bg-white p-6 rounded-[18px] border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center shrink-0">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" /> Recently Added Resources
            </span>
            <button onClick={() => router.push('/dashboard/resources')} className="text-[10px] text-indigo-600 font-extrabold hover:underline">View Resources</button>
          </div>
          <div className="space-y-2.5">
            {(() => {
              const resources = notices.filter((n: any) => ['Academic Forms', 'Study Resources', 'Important Documents', 'Downloads'].includes(n.category));
              return resources.slice(0, 3).length > 0 ? (
                resources.slice(0, 3).map((r: any) => (
                  <div key={r.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between hover:bg-slate-100/50 transition-colors">
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black uppercase text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md">{r.category}</span>
                        <span className="text-[9px] text-slate-400 font-extrabold">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs font-black text-slate-800 mt-1 truncate">{r.title}</p>
                    </div>
                    <button onClick={() => router.push('/dashboard/resources')} className="text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-indigo-650 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm shrink-0 cursor-pointer">Get</button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4 font-semibold">No resources available.</p>
              );
            })()}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const isAdmin = user?.role === 'ADMIN' || user?.email?.includes('admin') || user?.email === 'john@1234';
  const router = useRouter();
  const { data: studentsRaw, mutate: mutateStudents } = useSWR<any[]>('/api/students', fetcher, { refreshInterval: 5000 });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Real-Time Background Synchronization with SWR
  const { data: noticesRaw, mutate: mutateNotices } = useSWR<Notice[]>('/api/notices', fetcher, { refreshInterval: 5000 });
  const { data: issuesRaw, mutate: mutateIssues } = useSWR<Issue[]>('/api/issues', fetcher, { refreshInterval: 5000 });
  const { data: lostItemsRaw, mutate: mutateLostItems } = useSWR<LostItem[]>('/api/lost-found', fetcher, { refreshInterval: 5000 });
  const { data: claimsRaw, mutate: mutateClaims } = useSWR<ClaimRequest[]>('/api/lost-found/claim', fetcher, { refreshInterval: 5000 });

  const students = Array.isArray(studentsRaw) ? studentsRaw : [];
  const notices = Array.isArray(noticesRaw) ? noticesRaw : [];
  const issues = Array.isArray(issuesRaw) ? issuesRaw : [];
  const lostItems = Array.isArray(lostItemsRaw) ? lostItemsRaw : [];
  const claims = Array.isArray(claimsRaw) ? claimsRaw : [];

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
      {/* RENDER ACTIVE TAB */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        isAdmin ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Section 1: Welcome Banner */}
            <DashboardHero
              title={`👋 ${getGreeting()}, ${user?.name || 'Administrator'}`}
              description="Manage your campus operations, monitor student activities and oversee all campus services from one place."
              icon={Shield}
              gradientClass="from-slate-900 via-indigo-950 to-blue-900"
              pageType="overview"
              extraHeader={
                <span className="inline-flex items-center gap-1 bg-white/10 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md border border-white/5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  Administrator Portal
                </span>
              }
              metadata={
                <>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Campus Ops & Management
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    System Staff ID: <span className="text-white font-extrabold">ADM-{user?.id?.slice(0, 6).toUpperCase()}</span>
                  </p>
                </>
              }
            />

            {/* Section 2: Live Statistics Grid */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-800 tracking-wider uppercase">Live Operations Statistics</span>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                
                {/* Total Students */}
                <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md hover:border-blue-400/30 transition-all duration-300">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">Students</span>
                  <h3 className="text-lg font-black text-slate-800 mt-1">{students.filter((s: any) => s.role === 'STUDENT').length}</h3>
                  <div className="absolute right-3.5 bottom-3.5 p-1 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Active Notices */}
                <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md hover:border-cyan-400/30 transition-all duration-300">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">Notices</span>
                  <h3 className="text-lg font-black text-slate-800 mt-1">{totalNotices - notices.filter((n: any) => ['Academic Forms', 'Study Resources', 'Important Documents', 'Downloads'].includes(n.category)).length}</h3>
                  <div className="absolute right-3.5 bottom-3.5 p-1 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Pending Complaints */}
                <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md hover:border-rose-400/30 transition-all duration-300">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">Pending Issues</span>
                  <h3 className="text-lg font-black text-slate-805 mt-1">{pendingCount}</h3>
                  <div className="absolute right-3.5 bottom-3.5 p-1 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Lost & Found Cases */}
                <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md hover:border-amber-400/30 transition-all duration-300">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">L&F Cases</span>
                  <h3 className="text-lg font-black text-slate-800 mt-1">{lostItems.length}</h3>
                  <div className="absolute right-3.5 bottom-3.5 p-1 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Resources */}
                <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md hover:border-indigo-400/30 transition-all duration-300">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">Resources</span>
                  <h3 className="text-lg font-black text-slate-800 mt-1">{notices.filter((n: any) => ['Academic Forms', 'Study Resources', 'Important Documents', 'Downloads'].includes(n.category)).length}</h3>
                  <div className="absolute right-3.5 bottom-3.5 p-1 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <FolderOpen className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Pending Requests */}
                <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md hover:border-emerald-400/30 transition-all duration-300">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">Pending Req.</span>
                  <h3 className="text-lg font-black text-slate-805 mt-1">
                    {(() => {
                      const SERVICE_REQUEST_CATEGORIES = [
                        'ID Card Request', 'Bonafide Certificate', 'Hostel Request', 
                        'Parking Pass', 'Leave Application', 'Library Card Request', 'Degree/Transcript Request'
                      ];
                      return issues.filter((i: any) => SERVICE_REQUEST_CATEGORIES.includes(i.category) && i.status === 'PENDING').length;
                    })()}
                  </h3>
                  <div className="absolute right-3.5 bottom-3.5 p-1 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <ClipboardList className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Today's Activities */}
                <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md hover:border-violet-400/30 transition-all duration-300">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">Today's Logs</span>
                  <h3 className="text-lg font-black text-slate-800 mt-1">
                    {(() => {
                      const today = new Date().toDateString();
                      return notices.filter(n => new Date(n.createdAt).toDateString() === today).length + 
                             issues.filter(i => new Date(i.createdAt).toDateString() === today).length + 
                             lostItems.filter(l => new Date(l.createdAt).toDateString() === today).length;
                    })()}
                  </h3>
                  <div className="absolute right-3.5 bottom-3.5 p-1 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Active Users */}
                <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md hover:border-teal-400/30 transition-all duration-300">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">Total Users</span>
                  <h3 className="text-lg font-black text-slate-800 mt-1">{students.length}</h3>
                  <div className="absolute right-3.5 bottom-3.5 p-1 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </div>

              </div>
            </div>

            {/* Section 3: Quick Actions */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-800 tracking-wider uppercase">System Management Quick Actions</span>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                
                <button
                  onClick={() => router.push('/dashboard/students')}
                  className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm text-left hover:shadow-md hover:border-blue-500/20 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-800">Add Student</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Register new user account.</p>
                </button>

                <button
                  onClick={() => router.push('/dashboard/notices')}
                  className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm text-left hover:shadow-md hover:border-cyan-500/20 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-800">Create Notice</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Publish notices & events.</p>
                </button>

                <button
                  onClick={() => router.push('/dashboard/resources')}
                  className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm text-left hover:shadow-md hover:border-indigo-500/20 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-800">Upload Resource</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Publish forms & resources.</p>
                </button>

                <button
                  onClick={() => router.push('/dashboard/issues')}
                  className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm text-left hover:shadow-md hover:border-rose-500/20 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:bg-rose-600 group-hover:text-white transition-all">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-800">Review Complaints</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Manage filed student issues.</p>
                </button>

                <button
                  onClick={() => router.push('/dashboard/requests')}
                  className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm text-left hover:shadow-md hover:border-emerald-500/25 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-800">Review Requests</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Approve or reject applications.</p>
                </button>

                <button
                  onClick={() => router.push('/dashboard/analytics')}
                  className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm text-left hover:shadow-md hover:border-violet-500/25 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3 group-hover:bg-violet-600 group-hover:text-white transition-all">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-805">Open Analytics</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Visual operational charts.</p>
                </button>

              </div>
            </div>

            {/* Section 4: Feeds in specific order */}
            <div className="space-y-6">
              
              {/* 1. Recent Activity (Unified Recent Activity Log) */}
              <div className="bg-white p-6 rounded-[18px] border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center shrink-0">
                  <span className="text-xs font-black text-slate-808 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" /> Unified Recent Activities
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">System Event Logs</span>
                </div>
                <div className="space-y-2.5">
                  {(() => {
                    const recentActivities: any[] = [];
                    notices.filter((n: any) => !['Academic Forms', 'Study Resources', 'Important Documents', 'Downloads'].includes(n.category)).forEach(n => {
                      recentActivities.push({
                        id: n.id,
                        title: `Broadcast: ${n.title}`,
                        meta: `Posted by Admin | ${n.category}`,
                        date: n.createdAt,
                      });
                    });
                    notices.filter((n: any) => ['Academic Forms', 'Study Resources', 'Important Documents', 'Downloads'].includes(n.category)).forEach(r => {
                      recentActivities.push({
                        id: r.id,
                        title: `Resource: ${r.title}`,
                        meta: `Published resource file | ${r.category}`,
                        date: r.createdAt,
                      });
                    });
                    const SERVICE_REQUEST_CATEGORIES = [
                      'ID Card Request', 'Bonafide Certificate', 'Hostel Request', 
                      'Parking Pass', 'Leave Application', 'Library Card Request', 'Degree/Transcript Request'
                    ];
                    issues.filter((i: any) => !SERVICE_REQUEST_CATEGORIES.includes(i.category)).forEach(c => {
                      recentActivities.push({
                        id: c.id,
                        title: `Complaint: ${c.title}`,
                        meta: `Reported by Student | Status: ${c.status}`,
                        date: c.createdAt,
                      });
                    });
                    issues.filter((i: any) => SERVICE_REQUEST_CATEGORIES.includes(i.category)).forEach(sr => {
                      recentActivities.push({
                        id: sr.id,
                        title: `Request: ${sr.title}`,
                        meta: `Service request filed | Status: ${sr.status}`,
                        date: sr.createdAt,
                      });
                    });
                    lostItems.forEach(li => {
                      recentActivities.push({
                        id: li.id,
                        title: `Lost&Found: ${li.itemName}`,
                        meta: `${li.type} listing reported | Location: ${li.location}`,
                        date: li.createdAt,
                      });
                    });

                    const sorted = recentActivities
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 8);

                    return sorted.length > 0 ? (
                      sorted.map((act) => (
                        <div key={act.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between hover:bg-slate-100/50 transition-colors">
                          <div className="min-w-0 flex-1 pr-4">
                            <p className="text-xs font-black text-slate-808 truncate">{act.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{act.meta}</p>
                          </div>
                          <span className="text-[9px] text-slate-455 shrink-0 font-extrabold">{new Date(act.date).toLocaleDateString()}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-4 font-semibold">No logged system actions.</p>
                    );
                  })()}
                </div>
              </div>

              {/* 2. Recent Complaints (Latest Complaints) */}
              <div className="bg-white p-6 rounded-[18px] border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center shrink-0">
                  <span className="text-xs font-black text-slate-805 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" /> Latest Complaints
                  </span>
                  <button onClick={() => router.push('/dashboard/issues')} className="text-[10px] text-rose-600 font-extrabold hover:underline">Review All</button>
                </div>
                <div className="space-y-2.5">
                  {(() => {
                    const SERVICE_REQUEST_CATEGORIES = [
                      'ID Card Request', 'Bonafide Certificate', 'Hostel Request', 
                      'Parking Pass', 'Leave Application', 'Library Card Request', 'Degree/Transcript Request'
                    ];
                    const plainComplaints = issues.filter((i: any) => !SERVICE_REQUEST_CATEGORIES.includes(i.category));
                    return plainComplaints.slice(0, 5).length > 0 ? (
                      plainComplaints.slice(0, 5).map((i: any) => (
                        <div key={i.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between hover:bg-slate-100/50 transition-colors">
                          <div className="min-w-0 flex-1 pr-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-black uppercase text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md">{i.category}</span>
                              <span className="text-[8px] font-black uppercase text-slate-505 bg-slate-100 px-1.5 py-0.5 rounded-md">{i.status}</span>
                              <span className="text-[9px] text-slate-400 font-extrabold">{new Date(i.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs font-black text-slate-800 mt-1 truncate">{i.title}</p>
                          </div>
                          <button onClick={() => router.push('/dashboard/issues')} className="text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-rose-650 bg-white border border-slate-200 hover:border-slate-350 px-2.5 py-1 rounded-lg shadow-sm shrink-0 cursor-pointer">View</button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-4 font-semibold">No complaints reported.</p>
                    );
                  })()}
                </div>
              </div>

              {/* 3. Latest Notices & Events */}
              <div className="bg-white p-6 rounded-[18px] border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center shrink-0">
                  <span className="text-xs font-black text-slate-850 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" /> Latest Notices
                  </span>
                  <button onClick={() => router.push('/dashboard/notices')} className="text-[10px] text-cyan-600 font-extrabold hover:underline">Manage Notices</button>
                </div>
                <div className="space-y-2.5">
                  {(() => {
                    const plainNotices = notices.filter((n: any) => !['Academic Forms', 'Study Resources', 'Important Documents', 'Downloads'].includes(n.category));
                    return plainNotices.slice(0, 5).length > 0 ? (
                      plainNotices.slice(0, 5).map((n: any) => (
                        <div key={n.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl hover:bg-slate-100/50 transition-colors">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[8px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md">{n.category}</span>
                            <span className="text-[9px] text-slate-400 font-extrabold">{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs font-black text-slate-800 truncate">{n.title}</p>
                          <p className="text-[10.5px] text-slate-505 font-semibold line-clamp-1 leading-relaxed mt-0.5">{n.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-4 font-semibold">No announcements published.</p>
                    );
                  })()}
                </div>
              </div>

              {/* 4. Recently Added Resources (Recently Uploaded Resources) */}
              <div className="bg-white p-6 rounded-[18px] border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center shrink-0">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" /> Recently Uploaded Resources
                  </span>
                  <button onClick={() => router.push('/dashboard/resources')} className="text-[10px] text-indigo-600 font-extrabold hover:underline">Manage Resources</button>
                </div>
                <div className="space-y-2.5">
                  {(() => {
                    const resources = notices.filter((n: any) => ['Academic Forms', 'Study Resources', 'Important Documents', 'Downloads'].includes(n.category));
                    return resources.slice(0, 5).length > 0 ? (
                      resources.slice(0, 5).map((r: any) => (
                        <div key={r.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between hover:bg-slate-100/50 transition-colors">
                          <div className="min-w-0 flex-1 pr-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-black uppercase text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md">{r.category}</span>
                              <span className="text-[9px] text-slate-400 font-extrabold">{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs font-black text-slate-800 mt-1 truncate">{r.title}</p>
                          </div>
                          <button onClick={() => router.push('/dashboard/resources')} className="text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-indigo-650 bg-white border border-slate-200 hover:border-slate-350 px-2.5 py-1 rounded-lg shadow-sm shrink-0 cursor-pointer">View</button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-4 font-semibold">No resource materials uploaded.</p>
                    );
                  })()}
                </div>
              </div>

              {/* 5. Recent Service Requests (Latest Service Requests) */}
              <div className="bg-white p-6 rounded-[18px] border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center shrink-0">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> Latest Service Requests
                  </span>
                  <button onClick={() => router.push('/dashboard/requests')} className="text-[10px] text-emerald-600 font-extrabold hover:underline">Review All</button>
                </div>
                <div className="space-y-2.5">
                  {(() => {
                    const SERVICE_REQUEST_CATEGORIES = [
                      'ID Card Request', 'Bonafide Certificate', 'Hostel Request', 
                      'Parking Pass', 'Leave Application', 'Library Card Request', 'Degree/Transcript Request'
                    ];
                    const serviceRequests = issues.filter((i: any) => SERVICE_REQUEST_CATEGORIES.includes(i.category));
                    return serviceRequests.slice(0, 5).length > 0 ? (
                      serviceRequests.slice(0, 5).map((r: any) => (
                        <div key={r.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between hover:bg-slate-100/50 transition-colors">
                          <div className="min-w-0 flex-1 pr-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-black uppercase text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md">{r.category}</span>
                              <span className="text-[8px] font-black uppercase text-slate-505 bg-slate-100 px-1.5 py-0.5 rounded-md">{r.status}</span>
                              <span className="text-[9px] text-slate-400 font-extrabold">{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs font-black text-slate-805 mt-1 truncate">{r.title}</p>
                          </div>
                          <button onClick={() => router.push('/dashboard/requests')} className="text-[10px] font-black uppercase tracking-wider text-slate-505 hover:text-blue-650 bg-white border border-slate-200 hover:border-slate-350 px-2.5 py-1 rounded-lg shadow-sm shrink-0 cursor-pointer">View</button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-4 font-semibold">No service requests submitted.</p>
                    );
                  })()}
                </div>
              </div>

              {/* 6. Analytics Summary */}
              <div className="bg-white p-6 rounded-[18px] border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center shrink-0">
                  <span className="text-xs font-black text-slate-808 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" /> Analytics Summary
                  </span>
                  <button onClick={() => router.push('/dashboard/analytics')} className="text-[10px] text-violet-600 font-extrabold hover:underline">View Detailed Analytics</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Resolution Rate */}
                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Complaints Resolution Rate</span>
                      <span className="text-slate-800 font-black">
                        {totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                        style={{ width: `${totalComplaints > 0 ? (resolvedCount / totalComplaints) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">{resolvedCount} of {totalComplaints} complaints resolved successfully.</p>
                  </div>

                  {/* Request Completion Rate */}
                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
                    {(() => {
                      const SERVICE_REQUEST_CATEGORIES = [
                        'ID Card Request', 'Bonafide Certificate', 'Hostel Request', 
                        'Parking Pass', 'Leave Application', 'Library Card Request', 'Degree/Transcript Request'
                      ];
                      const sReqs = issues.filter((i: any) => SERVICE_REQUEST_CATEGORIES.includes(i.category));
                      const totalSReqs = sReqs.length;
                      const resolvedSReqs = sReqs.filter((r: any) => r.status === 'APPROVED' || r.status === 'RESOLVED').length;
                      const completionRate = totalSReqs > 0 ? Math.round((resolvedSReqs / totalSReqs) * 100) : 0;
                      return (
                        <>
                          <div className="flex justify-between text-xs font-bold text-slate-600">
                            <span>Service Request Completion Rate</span>
                            <span className="text-slate-800 font-black">{completionRate}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                              style={{ width: `${completionRate}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold">{resolvedSReqs} of {totalSReqs} applications processed.</p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <StudentOverview 
            totalNotices={totalNotices}
            pendingCount={pendingCount}
            progressCount={progressCount}
            resolvedCount={resolvedCount}
            totalComplaints={totalComplaints}
            activeClaims={activeClaims}
            categoryCounts={categoryCounts}
            notices={notices}
            issues={issues}
            lostItems={lostItems}
            claims={claims}
            setActiveTab={setActiveTab}
            isAdmin={isAdmin}
            handleApproveClaim={handleApproveClaim}
            handleRejectClaim={handleRejectClaim}
            user={user}
            getGreeting={getGreeting}
          />
        )
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
