'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { toast } from '@/components/Toast';
import { 
  ClipboardList, Search, Plus, Download, Eye, X, Calendar, User, Info, 
  CheckCircle2, Clock, AlertCircle, XCircle, ArrowUpRight, UploadCloud, 
  HelpCircle, ChevronRight, MessageSquare, Shield, Tag, FileText, Image as ImageIcon
} from 'lucide-react';
import { UploadDropzone } from '@/lib/uploadthing';
import { DashboardHero } from '@/components/DashboardHero';

interface StatusHistory {
  id: string;
  status: string;
  updatedBy: string;
  comment: string | null;
  createdAt: string;
}

interface ServiceRequest {
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

const SERVICE_SERVICES = [
  { id: 'id-card', name: 'ID Card Request', icon: '🪪', desc: 'Request a new, replacement, or duplicate campus ID card.' },
  { id: 'bonafide', name: 'Bonafide Certificate', icon: '📄', desc: 'Apply for a Bonafide Certificate for visa, bank, or loan verification.' },
  { id: 'hostel', name: 'Hostel Request', icon: '🏠', desc: 'Register for room allocation, room change, or hostel check-out.' },
  { id: 'parking', name: 'Parking Pass', icon: '🚗', desc: 'Request a vehicle campus parking pass sticker.' },
  { id: 'leave', name: 'Leave Application', icon: '📝', desc: 'Submit department leave requests or hostel outstation slips.' },
  { id: 'library', name: 'Library Card Request', icon: '📚', desc: 'Apply for a library membership card or renew existing registration.' },
  { id: 'degree', name: 'Degree/Transcript Request', icon: '🎓', desc: 'Request official semester grade-sheets or official degree transcript copies.' }
];

const SERVICE_NAMES = SERVICE_SERVICES.map(s => s.name);

export default function ServiceRequestsPage() {
  const { data: session, status } = useSession();
  const { data: issues = [], mutate: mutateIssues } = useSWR<ServiceRequest[]>('/api/issues', fetcher, {
    refreshInterval: 5000,
  });

  // UI State
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState<ServiceRequest | null>(null);

  // Form State (Student)
  const [requestType, setRequestType] = useState('ID Card Request');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('url');

  // Review Form State (Admin)
  const [reviewStatus, setReviewStatus] = useState('PENDING');
  const [reviewComment, setReviewComment] = useState('');

  const user = session?.user as any;
  const isAdmin = user?.role === 'ADMIN' || user?.email?.includes('admin') || user?.email === 'john@1234';

  if (status === 'loading') {
    return (
      <div className="flex h-64 items-center justify-center bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-sm animate-pulse">
        <svg className="animate-spin h-6 w-6 text-cyan-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  // Filter issues to display only Service Request categories
  const serviceRequests = issues.filter((i) => SERVICE_NAMES.includes(i.category));

  // Filter requests by Type, Status, and Search query
  const filteredRequests = serviceRequests.filter((req) => {
    const matchesType = filterType === 'ALL' || req.category === filterType;
    const matchesStatus = filterStatus === 'ALL' || req.status === filterStatus;
    const matchesSearch = 
      req.title.toLowerCase().includes(search.toLowerCase()) ||
      req.description.toLowerCase().includes(search.toLowerCase()) ||
      (req.student?.name && req.student.name.toLowerCase().includes(search.toLowerCase())) ||
      req.id.toLowerCase().includes(search.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  // Submit Student Service Request
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) {
      toast.error('Please enter a subject and detailed description.');
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: subject,
          description,
          category: requestType,
          attachmentUrl: attachmentUrl || null,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit service request');
      }

      toast.success('Service request submitted successfully!');
      setSubject('');
      setDescription('');
      setAttachmentUrl('');
      setRequestType('ID Card Request');
      setShowAddModal(false);
      mutateIssues();
    } catch (err) {
      toast.error('Could not submit service request.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Admin Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReviewModal) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/issues', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: showReviewModal.id,
          status: reviewStatus,
          comment: reviewComment || `Request status updated to ${reviewStatus}.`,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update request');
      }

      toast.success('Service request updated successfully!');
      setReviewComment('');
      setShowReviewModal(null);
      mutateIssues();
      // If currently selected card is the reviewed one, update its details
      if (selectedRequest && selectedRequest.id === showReviewModal.id) {
        // Find updated request in mutated response
        const updated = issues.find(i => i.id === showReviewModal.id);
        if (updated) setSelectedRequest(updated);
      }
    } catch (err) {
      toast.error('Could not update request.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/50 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
            <Clock className="w-3 h-3 text-amber-500 animate-pulse" /> Pending
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200/50 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
            <Clock className="w-3 h-3 text-blue-500" /> Under Review
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/50 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200/50 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
            <XCircle className="w-3 h-3 text-rose-500" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
            {statusStr}
          </span>
        );
    }
  };

  const getServiceIcon = (categoryName: string) => {
    const matched = SERVICE_SERVICES.find(s => s.name === categoryName);
    return matched ? matched.icon : '📄';
  };

  const handleOpenReview = (req: ServiceRequest) => {
    setShowReviewModal(req);
    setReviewStatus(req.status);
    setReviewComment('');
  };

  // Find remarks from latest history update
  const getLatestRemarks = (req: ServiceRequest) => {
    if (!req.history || req.history.length === 0) return null;
    // Find the latest non-empty comment that is not the default system startup comment
    const validHistory = req.history
      .filter(h => h.comment && !h.comment.includes('severity auto-classified by AI'))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return validHistory.length > 0 ? validHistory[0].comment : null;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      <DashboardHero
        title="🎫 Service Requests Portal"
        description={isAdmin 
          ? 'Review and manage official service requests submitted by students. Approve, reject, and write comments.'
          : 'Submit official requests for ID cards, Bonafide Certificates, hostel leaves, parking passes, and track verification progress in real-time.'
        }
        icon={ClipboardList}
        gradientClass="from-emerald-600 via-teal-600 to-cyan-500"
        pageType="requests"
        extraHeader={
          <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
            <ClipboardList className="w-3.5 h-3.5" /> Campus Service Desk
          </span>
        }
      />

      {/* Grid containing requests list (Left/Center) & detail card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content (Filters + Request List) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filters Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/85 p-4 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-550 text-xs font-bold focus:outline-none"
              >
                <option value="ALL">All Services</option>
                {SERVICE_NAMES.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-550 text-xs font-bold focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-all text-xs font-semibold"
                />
              </div>

              {!isAdmin && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/10 cursor-pointer transition-all shrink-0 active:scale-95 animate-pulse"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Request</span>
                </button>
              )}
            </div>
          </div>

          {/* Requests Feed / History list */}
          {filteredRequests.length > 0 ? (
            <div className="space-y-3">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className={`bg-white border rounded-[18px] p-5 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                    selectedRequest?.id === req.id 
                      ? 'border-blue-500 ring-4 ring-blue-500/5 shadow-sm' 
                      : 'border-slate-200/60 hover:border-blue-300/40'
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Left Icon or Thumbnail */}
                    <div className="shrink-0">
                      {req.attachmentUrl ? (
                        <div className="w-16 h-16 rounded-xl border border-slate-200/60 overflow-hidden bg-slate-50">
                          <img src={req.attachmentUrl} alt="attachment" className="object-cover w-full h-full" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl">
                          {getServiceIcon(req.category)}
                        </div>
                      )}
                    </div>

                    {/* Center Metadata and Typography */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                          ID: {req.id.slice(0, 8)}...
                        </span>
                        <span className="text-slate-355">•</span>
                        <span className="text-[10px] text-blue-700 font-black uppercase tracking-wider bg-blue-50/50 border border-blue-100/50 px-2 py-0.5 rounded-md">
                          {req.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-355" />
                          {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {isAdmin && req.student && (
                          <span className="text-[10px] text-slate-455 font-extrabold shrink-0">
                            By: {req.student.name} ({req.student.email})
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-sm font-black text-slate-800 leading-tight">
                        {req.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold line-clamp-2 leading-relaxed">
                        {req.description}
                      </p>

                      {/* Student Remarks Fallback summary */}
                      {!isAdmin && getLatestRemarks(req) && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-slate-500 leading-relaxed font-semibold flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-slate-700">Remarks:</span> {getLatestRemarks(req)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Action buttons / status badge */}
                  <div className="flex items-center gap-3.5 shrink-0 md:self-center">
                    {getStatusBadge(req.status)}
                    
                    {req.attachmentUrl && (
                      <a
                        href={req.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-3 rounded-lg border border-slate-200 hover:border-blue-400 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:text-blue-600 bg-white shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Attachment</span>
                      </a>
                    )}
                    
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenReview(req);
                        }}
                        className="py-1.5 px-3 rounded-lg border border-blue-250 bg-blue-50/50 hover:bg-blue-600 hover:text-white text-blue-650 font-black text-[10px] uppercase tracking-wider cursor-pointer transition-all"
                      >
                        Action
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-16 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-sm text-center max-w-xl mx-auto my-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 shadow-inner">
                <ClipboardList className="w-8 h-8 text-slate-300 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">No service requests submitted yet.</h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed max-w-xs font-semibold">
                There are currently no active applications or requests. Choose "New Request" above to launch a service slip.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Timeline & Detailed Review Panel */}
        <div className="space-y-4 lg:col-span-1">
          {selectedRequest ? (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/60 p-6 shadow-sm sticky top-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                  Request Information
                </h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Service details */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shrink-0">
                    {getServiceIcon(selectedRequest.category)}
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-extrabold px-2 py-0.5 rounded-full bg-slate-100 uppercase tracking-wide">
                      {selectedRequest.category}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-800 mt-1">
                      {selectedRequest.title}
                    </h4>
                  </div>
                </div>

                <div className="text-xs space-y-2">
                  <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Description</span>
                  <p className="text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-xl leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedRequest.description}
                  </p>
                </div>

                {selectedRequest.attachmentUrl && (
                  <div className="text-xs space-y-2">
                    <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Attachment Proof</span>
                    <a
                      href={selectedRequest.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-650 hover:text-blue-600 font-bold transition-all"
                    >
                      <ImageIcon className="w-4 h-4 text-slate-400" />
                      <span>View Uploaded Attachment</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-350" />
                    </a>
                  </div>
                )}

                {/* Admin quick action */}
                {isAdmin && (
                  <button
                    onClick={() => handleOpenReview(selectedRequest)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer transition-colors"
                  >
                    Change Status / Write Remarks
                  </button>
                )}
              </div>

              {/* Request Timeline */}
              <div className="pt-4 border-t border-slate-100">
                <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-4">
                  Request Timeline
                </span>
                
                {selectedRequest.history && selectedRequest.history.length > 0 ? (
                  <div className="relative pl-6 border-l border-slate-150 space-y-5">
                    {selectedRequest.history.map((hist, index) => {
                      const isFirst = index === 0;
                      return (
                        <div key={hist.id} className="relative">
                          {/* Dot indicator */}
                          <div className={`absolute -left-[30px] top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                            isFirst ? 'border-blue-500 ring-4 ring-blue-500/5' : 'border-slate-300'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isFirst ? 'bg-blue-500' : 'bg-slate-300'}`} />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-extrabold text-slate-800">
                                {hist.status === 'PENDING' ? 'Request Raised' : hist.status.replace('_', ' ')}
                              </span>
                              <span className="text-[9px] text-slate-400 font-semibold">
                                {new Date(hist.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            
                            <p className="text-[10px] text-slate-450 font-bold flex items-center gap-1">
                              By: <span className="text-slate-650">{hist.updatedBy}</span>
                            </p>

                            {hist.comment && (
                              <p className="text-xs text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1 leading-relaxed">
                                {hist.comment.includes('severity auto-classified by AI') 
                                  ? 'Service request initialized and placed in queue.' 
                                  : hist.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 font-bold">No timeline logged.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/60 p-6 text-center text-slate-400 shadow-sm sticky top-6">
              <ClipboardList className="w-10 h-10 text-slate-300 stroke-[1.2] mx-auto mb-3" />
              <h4 className="text-xs font-bold text-slate-700">Select a Service Request</h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed max-w-[200px] mx-auto font-medium">
                Click on any card to view detailed description, uploaded attachments, and its review history timeline.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* STUDENT NEW REQUEST MODAL */}
      {showAddModal && !isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 cursor-pointer" onClick={() => setShowAddModal(false)} />
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4 relative z-10 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-600" />
                <span>Submit Service Request</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              {/* Service Type Select */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Service Category</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-xs font-semibold h-[42px]"
                >
                  {SERVICE_SERVICES.map((serv) => (
                    <option key={serv.id} value={serv.name}>{serv.icon} {serv.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                  {SERVICE_SERVICES.find(s => s.name === requestType)?.desc}
                </p>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Request Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Issuance of Duplicate ID Card"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-xs font-semibold"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Detailed Reason / Remarks</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe details: roll numbers, periods, lost reports, or delivery details..."
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-xs font-semibold"
                />
              </div>

              {/* Upload Proof */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Attachment Proof (Optional)</label>
                <div className="flex border border-slate-250 bg-slate-50 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`flex-1 py-1.5 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                      uploadMode === 'url' ? 'bg-white border border-slate-200 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-650'
                    }`}
                  >
                    Direct Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('upload')}
                    className={`flex-1 py-1.5 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                      uploadMode === 'upload' ? 'bg-white border border-slate-200 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-650'
                    }`}
                  >
                    Upload Image
                  </button>
                </div>
              </div>

              {uploadMode === 'url' ? (
                <div>
                  <input
                    type="url"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="https://example.com/screenshot.jpg"
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-xs font-semibold"
                  />
                </div>
              ) : (
                <div>
                  {attachmentUrl ? (
                    <div className="relative rounded-xl border border-slate-200 p-2.5 bg-slate-50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <ImageIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-[10px] text-slate-600 font-bold truncate max-w-[200px]">Attachment uploaded!</span>
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
                    <div className="border-2 border-dashed border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <UploadDropzone
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          setAttachmentUrl(res[0].url);
                          toast.success('Image proof uploaded!');
                        }}
                        onUploadError={() => {
                          toast.error('Image upload failed.');
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-655 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-500/10 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN REVIEW MODAL */}
      {showReviewModal && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 cursor-pointer" onClick={() => setShowReviewModal(null)} />
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 flex flex-col gap-4 relative z-10 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Review Service Request</span>
              </h3>
              <button
                onClick={() => setShowReviewModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Service Type</p>
                <p className="text-xs font-black text-slate-700 mt-1">{showReviewModal.category}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Subject</p>
                <p className="text-xs font-semibold text-slate-650 mt-1">{showReviewModal.title}</p>
              </div>

              {/* Status Select */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Updated Status</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-xs font-semibold h-[40px]"
                >
                  <option value="PENDING">🟡 Pending</option>
                  <option value="UNDER_REVIEW">🔵 Under Review</option>
                  <option value="APPROVED">🟢 Approved</option>
                  <option value="REJECTED">🔴 Rejected</option>
                </select>
              </div>

              {/* Remarks/Comment */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Remarks / Remarks to Student</label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="e.g. Your transcript has been printed. Please pick it up from Room 102."
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-xs font-semibold"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-655 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-500/10 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Log Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
