'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { toast } from '@/components/Toast';
import { Megaphone, Trash2, Calendar, User, Inbox, PlusCircle, Pin, AlertCircle, X, Image as ImageIcon, Search } from 'lucide-react';
import { UploadDropzone } from '@/lib/uploadthing';
import { DashboardHero } from '@/components/DashboardHero';

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
  author: {
    name: string;
    email: string;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NoticesPage() {
  const { data: session, status } = useSession();
  const { data: noticesRaw, mutate: mutateNotices, error } = useSWR<Notice[]>('/api/notices', fetcher, {
    refreshInterval: 5000,
  });
  const notices = Array.isArray(noticesRaw) ? noticesRaw : [];

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State (Admin)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [priority, setPriority] = useState('MEDIUM');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');

  // Search/Filter State
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

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
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          priority,
          attachmentUrl,
          isPinned,
          expiryDate: expiryDate || null,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create announcement');
      }

      toast.success('Notice published successfully!');
      setTitle('');
      setDescription('');
      setCategory('GENERAL');
      setPriority('MEDIUM');
      setAttachmentUrl('');
      setIsPinned(false);
      setExpiryDate('');
      mutateNotices();
    } catch (err) {
      toast.error('Could not publish notice.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;

    try {
      const res = await fetch(`/api/notices?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete');
      }

      toast.success('Notice deleted successfully.');
      mutateNotices();
    } catch (err) {
      toast.error('Could not delete notice.');
    }
  };

  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = filterCategory === 'ALL' || n.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <DashboardHero
        title="📢 Notices & Events Board"
        description="Stay up to date with the latest campus announcements, official circulars, and student activities."
        icon={Megaphone}
        gradientClass="from-violet-600 via-purple-650 to-fuchsia-500"
        pageType="notices"
      />

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex gap-2">
          {['ALL', 'GENERAL', 'EXAM', 'EVENT', 'CIRCULAR'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterCategory(t)}
              className={`py-2 px-4 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                filterCategory === t
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t} Announcement
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-xs font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notice creation form for Admins ONLY */}
        {isAdmin ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm h-fit space-y-4 lg:col-span-1">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-cyan-500" />
              Publish Announcement
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">TITLE</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. WiFi Maintenance Schedule"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">CATEGORY</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-xs font-medium h-[38px]"
                  >
                    <option value="GENERAL">General</option>
                    <option value="EXAM">Exam</option>
                    <option value="EVENT">Event</option>
                    <option value="CIRCULAR">Circular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">PRIORITY</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-xs font-medium h-[38px]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">EXPIRY DATE (OPTIONAL)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm font-medium"
                />
              </div>

              {/* Uploadthing dropzone inside form */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">IMAGE ATTACHMENT</label>
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

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 h-4 w-4"
                />
                <label htmlFor="isPinned" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Pin to top of board
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">DESCRIPTION</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed description here..."
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-sm font-semibold text-white cursor-pointer shadow-md shadow-cyan-500/10 transition-all disabled:opacity-50"
              >
                {submitting ? 'Publishing...' : 'Publish Announcement'}
              </button>
            </form>
          </div>
        ) : (
          /* Informational sidebar desk for students */
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm h-fit space-y-3 lg:col-span-1">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-cyan-500" />
              Information Desk
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Welcome to the notices board! As a **STUDENT**, you have access to read, search, and filter campus events, exams schedules, and general college circulars. Important notices are pinned to the top of the feed automatically.
            </p>
          </div>
        )}

        <div className="lg:col-span-2 space-y-4">
          {filteredNotices.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredNotices.map((n) => (
                <div
                  key={n.id}
                  className={`bg-white border rounded-[18px] p-5 shadow-sm hover:shadow-md hover:border-cyan-500/25 transition-all duration-300 relative group flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                    n.isPinned ? 'border-cyan-300 ring-4 ring-cyan-500/5' : 'border-slate-200/60'
                  }`}
                >
                  {n.isPinned && (
                    <div className="absolute top-3 right-3 bg-cyan-500 text-white px-2.5 py-0.5 rounded-full text-[8px] font-black tracking-wide inline-flex items-center gap-0.5 uppercase shadow-sm">
                      Pinned <Pin className="w-2.5 h-2.5 rotate-45" />
                    </div>
                  )}

                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Left Icon or Thumbnail */}
                    <div className="shrink-0">
                      {n.attachmentUrl ? (
                        <div className="w-16 h-16 rounded-xl border border-slate-200/60 overflow-hidden bg-slate-50">
                          <img src={n.attachmentUrl} alt="attachment" className="object-cover w-full h-full" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-cyan-600">
                          <Megaphone className="w-6 h-6 text-cyan-650" />
                        </div>
                      )}
                    </div>

                    {/* Center Metadata and Typography */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-md border ${
                          n.category === 'EXAM' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                          n.category === 'EVENT' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          n.category === 'CIRCULAR' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                          'bg-cyan-50 text-cyan-700 border-cyan-100'
                        }`}>
                          {n.category}
                        </span>
                        <span className={`text-[8px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-md border ${
                          n.priority === 'URGENT' ? 'bg-red-50 text-red-700 border-red-100 animate-pulse' :
                          n.priority === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                          n.priority === 'LOW' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                          'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {n.priority}
                        </span>
                        <span className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1 shrink-0">
                          <Calendar className="w-3.5 h-3.5 text-slate-350" />
                          {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {n.expiryDate && (
                          <span className="text-[9px] font-bold text-rose-500/80 bg-rose-50/50 px-2 py-0.5 rounded-md border border-rose-100/50">
                            Expires: {new Date(n.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-extrabold shrink-0">
                          By: <span className="text-slate-600 font-black">{n.author?.name || 'Admin'}</span>
                        </span>
                      </div>
                      
                      <h3 className="text-sm font-black text-slate-800 leading-tight pr-12">{n.title}</h3>
                      <p className="text-xs text-slate-500 font-semibold line-clamp-2 leading-relaxed whitespace-pre-wrap">{n.description}</p>
                    </div>
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex items-center gap-2 shrink-0 md:self-center">
                    {n.attachmentUrl && (
                      <a
                        href={n.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-3 rounded-lg border border-slate-200 hover:border-blue-400 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:text-blue-600 bg-white shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>View Attachment</span>
                      </a>
                    )}
                    
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="p-2 rounded-lg bg-rose-50 border border-rose-100 hover:bg-rose-500 text-rose-500 hover:text-white transition-all cursor-pointer shadow-sm"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl text-slate-400 border border-slate-200/80 shadow-sm w-full">
              <Inbox className="w-12 h-12 mb-3 stroke-1 text-slate-300" />
              <p className="text-sm font-semibold">No notices published yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
