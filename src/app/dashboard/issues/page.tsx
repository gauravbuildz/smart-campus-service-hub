'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { toast } from '@/components/Toast';
import { AlertTriangle, Clock, Calendar, User, Inbox, ShieldAlert, Send, Image as ImageIcon, X, ChevronRight } from 'lucide-react';
import { UploadDropzone } from '@/lib/uploadthing';

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
  student?: {
    name: string;
    email: string;
  };
  history?: StatusHistory[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function IssuesPage() {
  const { data: session, status } = useSession();
  const { data: issues = [], mutate: mutateIssues } = useSWR<Issue[]>('/api/issues', fetcher, {
    refreshInterval: 5000,
  });

  const [submitting, setSubmitting] = useState(false);

  // Form State (Student)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('WIFI');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  // Manage Status Modal (Admin)
  const [showStatusModal, setShowStatusModal] = useState<Issue | null>(null);
  const [statusForm, setStatusForm] = useState({ status: 'PENDING', severity: 'MEDIUM', comment: '' });

  // Filtering State
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const user = session?.user as any;
  const isAdmin = user?.role === 'ADMIN' || user?.email?.includes('admin') || user?.email === 'john@1234';

  if (status === 'loading') {
    return (
      <div className="flex h-48 items-center justify-center bg-white rounded-2xl border border-slate-200/60 shadow-sm animate-pulse">
        <svg className="animate-spin h-6 w-6 text-cyan-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error('Please fill in all fields.');
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, attachmentUrl }),
      });

      if (!res.ok) {
        throw new Error('Failed to raise issue');
      }

      toast.success('Complaint raised successfully!');
      setTitle('');
      setDescription('');
      setCategory('WIFI');
      setAttachmentUrl('');
      mutateIssues();
    } catch (err) {
      toast.error('Could not submit complaint.');
    } finally {
      setSubmitting(false);
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
        toast.success('Complaint status logged successfully!');
        setStatusForm({ status: 'PENDING', severity: 'MEDIUM', comment: '' });
        setShowStatusModal(null);
        mutateIssues();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status.');
    }
  };

  const filteredIssues = issues.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = filterCategory === 'ALL' || i.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || i.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Complaints & Issues Hub</h2>
        <p className="text-slate-500 text-sm font-medium">Raise support tickets for campus amenities, WiFi, or hostel maintenance.</p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-550 text-xs font-semibold focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="WIFI">WiFi & Networks</option>
            <option value="HOSTEL">Hostel & Housing</option>
            <option value="CLASSROOM">Classrooms</option>
            <option value="OTHER">Other</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-550 text-xs font-semibold focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <AlertTriangle className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-xs font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Form for student, Info for Admin */}
        {!isAdmin ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm h-fit space-y-4 lg:col-span-1">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              File a Complaint
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">TITLE</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. WiFi outage on 3rd floor"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-xs font-medium h-[38px]"
                >
                  <option value="WIFI">WiFi & Networks</option>
                  <option value="HOSTEL">Hostel & Housing</option>
                  <option value="CLASSROOM">Classroom Repairs</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Uploadthing Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ATTACH IMAGE PROOF</label>
                {attachmentUrl ? (
                  <div className="relative rounded-xl border border-slate-250 p-2.5 bg-slate-50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ImageIcon className="w-5 h-5 text-slate-400 shrink-0" />
                      <span className="text-[10px] text-slate-600 font-bold truncate max-w-[150px]">Image Uploaded!</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setAttachmentUrl('')}
                      className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <UploadDropzone
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => setAttachmentUrl(res[0].url)}
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">DETAILED DESCRIPTION</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your issue with exact room numbers, blocks, etc..."
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-sm font-semibold text-white cursor-pointer shadow-md shadow-cyan-500/10 transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'File Complaint'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm h-fit space-y-3 lg:col-span-1">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-500" />
              Admin Portal
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              As an **ADMINISTRATOR**, you have control over the student issues board:
            </p>
            <ul className="list-disc pl-4 text-xs text-slate-500 space-y-1.5 leading-relaxed font-medium">
              <li>Inspect tickets raised by students.</li>
              <li>Filter complaints by status or category.</li>
              <li>Manage status logs, severity ratings, and timeline descriptions.</li>
              <li>Status transitions send instant student notifications.</li>
            </ul>
          </div>
        )}

        {/* Right Side: Complaints list */}
        <div className="lg:col-span-2 space-y-4">
          {filteredIssues.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase shrink-0 ${
                            issue.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/30' :
                            issue.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800 border border-amber-200/30' :
                            'bg-rose-100 text-rose-800 border border-rose-200/30'
                          }`}>
                            {issue.status}
                          </span>
                          <span className="text-[9px] text-slate-500 font-bold bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200/60 shrink-0">
                            {issue.category}
                          </span>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${
                            issue.severity === 'HIGH' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            issue.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            'bg-cyan-50 text-cyan-600 border border-cyan-100'
                          }`}>
                            SEVERITY: {issue.severity}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 shrink-0">
                            <Calendar className="w-3.5 h-3.5 text-slate-350" />
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-800 mt-2">{issue.title}</h3>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-550 leading-relaxed font-medium whitespace-pre-wrap">{issue.description}</p>
                    
                    {issue.attachmentUrl && (
                      <div className="h-44 w-72 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative mt-2">
                        <img 
                          src={issue.attachmentUrl} 
                          alt="Issue attachment" 
                          className="object-cover w-full h-full"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>
                    )}

                    {isAdmin && issue.student && (
                      <div className="pt-2 border-t border-slate-50 text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-350" />
                        Reported by: <span className="text-slate-600 font-bold">{issue.student.name} ({issue.student.email})</span>
                      </div>
                    )}

                    {/* Timeline History log rendering */}
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
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2 justify-end border-t border-slate-50 pt-3 shrink-0">
                      <button
                        onClick={() => {
                          setStatusForm({ status: issue.status, severity: issue.severity, comment: '' });
                          setShowStatusModal(issue);
                        }}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-[10px] font-bold text-slate-700 bg-white transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        Manage Status <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl text-slate-400 border border-slate-200/80 shadow-sm w-full">
              <Inbox className="w-12 h-12 mb-3 stroke-1 text-slate-300" />
              <p className="text-sm font-semibold">No issues matching criteria found</p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Status/Severity Management Modal */}
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
    </div>
  );
}
