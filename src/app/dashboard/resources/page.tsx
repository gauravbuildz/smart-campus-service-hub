'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { toast } from '@/components/Toast';
import { 
  FolderOpen, Search, Grid, List, Plus, Download, Eye, X, 
  FileText, Archive, Image as ImageIcon, File, Trash2, 
  ExternalLink, Calendar, User, Info, ArrowUpRight, HelpCircle, 
  UploadCloud, BookOpen, AlertCircle
} from 'lucide-react';
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

interface ResourceMeta {
  text: string;
  fileSize: string;
  fileType: string;
  subcategory?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const RESOURCE_CATEGORIES = [
  'Academic Forms',
  'Study Resources',
  'Important Documents',
  'Downloads'
];

const SUBCATEGORIES_MAP: Record<string, string[]> = {
  'Academic Forms': ['Bonafide Form', 'Scholarship Form', 'Hostel Form', 'Leave Form', 'Other Form'],
  'Study Resources': ['Syllabus', 'Academic Calendar', 'Timetable', 'Examination Schedule', 'Other Study Resource'],
  'Important Documents': ['College Rules', 'Student Handbook', 'Circulars', 'Guidelines', 'Other Document'],
  'Downloads': ['PDF Documents', 'DOC Files', 'ZIP Files', 'Other Downloads']
};

export default function ResourceHubPage() {
  const { data: session, status } = useSession();
  const { data: notices = [], mutate: mutateNotices } = useSWR<Notice[]>('/api/notices', fetcher, {
    refreshInterval: 5000,
  });

  // UI State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewResource, setPreviewResource] = useState<{ title: string; url: string; fileType: string; size: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State (Admin)
  const [title, setTitle] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [category, setCategory] = useState('Academic Forms');
  const [subcategory, setSubcategory] = useState('Bonafide Form');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [fileType, setFileType] = useState('PDF');
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('url');
  const [attachmentUrl, setAttachmentUrl] = useState('');

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

  // Parse resource metadata safely
  const parseMetadata = (description: string, url: string | null): ResourceMeta => {
    try {
      const meta = JSON.parse(description);
      if (meta && typeof meta === 'object') {
        return {
          text: meta.text || '',
          fileSize: meta.fileSize || 'Unknown Size',
          fileType: meta.fileType || 'FILE',
          subcategory: meta.subcategory
        };
      }
    } catch (e) {
      // Return default values parsed from URL/text if JSON parsing fails
    }

    // Fallback parser
    let guessedType = 'FILE';
    if (url) {
      const ext = url.split('.').pop()?.split('?')[0]?.toLowerCase();
      if (ext === 'pdf') guessedType = 'PDF';
      else if (['doc', 'docx'].includes(ext || '')) guessedType = 'DOC';
      else if (['zip', 'rar', '7z'].includes(ext || '')) guessedType = 'ZIP';
      else if (['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(ext || '')) guessedType = 'IMAGE';
    }
    return {
      text: description,
      fileSize: 'Unknown Size',
      fileType: guessedType,
      subcategory: 'General Document'
    };
  };

  // Filter notices to keep only those which represent resource categories
  const resources = notices
    .filter((n) => RESOURCE_CATEGORIES.includes(n.category))
    .map((n) => {
      const meta = parseMetadata(n.description, n.attachmentUrl);
      return {
        id: n.id,
        title: n.title,
        category: n.category,
        attachmentUrl: n.attachmentUrl,
        createdAt: n.createdAt,
        author: n.author,
        isPinned: n.isPinned,
        ...meta
      };
    });

  // Filter resources based on Category & Search
  const filteredResources = resources.filter((res) => {
    const matchesCategory = selectedCategory === 'ALL' || res.category === selectedCategory;
    const matchesSearch = 
      res.title.toLowerCase().includes(search.toLowerCase()) ||
      res.text.toLowerCase().includes(search.toLowerCase()) ||
      (res.subcategory && res.subcategory.toLowerCase().includes(search.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Handle Category Select change (reset subcategory form state too)
  const handleCategoryFormChange = (catVal: string) => {
    setCategory(catVal);
    const subcats = SUBCATEGORIES_MAP[catVal];
    if (subcats && subcats.length > 0) {
      setSubcategory(subcats[0]);
    }
  };

  // Submit Admin Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !attachmentUrl) {
      toast.error('Please enter a title and upload or input a file link.');
      return;
    }
    setSubmitting(true);

    try {
      // Build metadata JSON string to store in description
      const metaObj: ResourceMeta = {
        text: descriptionText,
        fileSize,
        fileType,
        subcategory
      };

      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: JSON.stringify(metaObj),
          category,
          priority: 'LOW',
          attachmentUrl,
          isPinned: false,
          expiryDate: null,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create resource');
      }

      toast.success('Resource published to database successfully!');
      setTitle('');
      setDescriptionText('');
      setCategory('Academic Forms');
      setSubcategory('Bonafide Form');
      setFileSize('1.5 MB');
      setFileType('PDF');
      setAttachmentUrl('');
      setShowAddModal(false);
      mutateNotices();
    } catch (err) {
      toast.error('Could not save resource.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const res = await fetch(`/api/notices?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete');
      }

      toast.success('Resource deleted successfully.');
      mutateNotices();
    } catch (err) {
      toast.error('Could not delete resource.');
    }
  };

  const FileIcon = ({ type, className = 'w-6 h-6' }: { type: string; className?: string }) => {
    switch (type) {
      case 'PDF':
        return <FileText className={`text-rose-500 ${className}`} />;
      case 'DOC':
        return <FileText className={`text-blue-500 ${className}`} />;
      case 'ZIP':
        return <Archive className={`text-amber-500 ${className}`} />;
      case 'IMAGE':
        return <ImageIcon className={`text-emerald-500 ${className}`} />;
      default:
        return <File className={`text-slate-500 ${className}`} />;
    }
  };

  // Guess metadata from URL change
  const handleUrlChange = (url: string) => {
    setAttachmentUrl(url);
    if (!url) return;
    
    // Guess file type
    const ext = url.split('.').pop()?.split('?')[0]?.toLowerCase();
    if (ext === 'pdf') {
      setFileType('PDF');
    } else if (['doc', 'docx'].includes(ext || '')) {
      setFileType('DOC');
    } else if (['zip', 'rar', '7z'].includes(ext || '')) {
      setFileType('ZIP');
    } else if (['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(ext || '')) {
      setFileType('IMAGE');
    } else {
      setFileType('FILE');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      <DashboardHero
        title="📚 Academic Resource Hub"
        description="Access official college forms, study syllabus, examination timetables, official circulars, and course materials."
        icon={FolderOpen}
        gradientClass="from-cyan-600 via-teal-600 to-emerald-500"
        pageType="resources"
        extraHeader={
          <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
            <BookOpen className="w-3.5 h-3.5" /> Campus Drive
          </span>
        }
      />

      {/* Main Toolbar Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-sm">
        
        {/* Category Filters Tabs */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`py-2 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            All Resources
          </button>
          {RESOURCE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-2 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                  : 'bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search, View toggle and Admin actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-xs font-semibold"
            />
          </div>

          {/* Grid/List View Toggles */}
          <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm border border-slate-150' : 'text-slate-400 hover:text-slate-655'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm border border-slate-150' : 'text-slate-400 hover:text-slate-655'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Add Resource Button (Admin Only) */}
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/10 cursor-pointer transition-all shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Resource</span>
            </button>
          )}
        </div>
      </div>

      {filteredResources.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="flex flex-col gap-4">
            {filteredResources.map((res) => (
              <div
                key={res.id}
                className="bg-white border border-slate-200/60 rounded-[18px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-md hover:border-blue-500/25 transition-all duration-300 relative group"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Left Icon or Thumbnail */}
                  <div className="shrink-0">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                      <FileIcon type={res.fileType} className="w-8 h-8" />
                    </div>
                  </div>

                  {/* Center Metadata and Typography */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="bg-blue-50/50 border border-blue-100 text-blue-700 text-[9px] font-black tracking-wider px-2.5 py-0.5 rounded-md uppercase">
                        {res.subcategory || res.category}
                      </span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[9px] font-black text-slate-500 uppercase tracking-wider">
                        {res.fileType}
                      </span>
                      <span className="text-[10px] text-slate-400 font-extrabold">
                        {res.fileSize}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] text-slate-400 font-extrabold">
                        {new Date(res.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] text-slate-450 font-extrabold">
                        By: {res.author?.name || 'Admin'}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors leading-tight">
                      {res.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold line-clamp-2">
                      {res.text || 'No description provided.'}
                    </p>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 md:self-center">
                  {/* Delete (Admin) */}
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(res.id)}
                      className="p-2 text-slate-450 hover:text-rose-655 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-100"
                      title="Delete Resource"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* Preview (PDF/IMAGE only) */}
                  {res.attachmentUrl && (res.fileType === 'PDF' || res.fileType === 'IMAGE') && (
                    <button
                      onClick={() => setPreviewResource({ title: res.title, url: res.attachmentUrl!, fileType: res.fileType, size: res.fileSize })}
                      className="py-1.5 px-3 rounded-lg border border-slate-200 hover:border-blue-400 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:text-blue-600 bg-white shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                      title="Preview Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                  )}

                  {/* Download */}
                  {res.attachmentUrl && (
                    <a
                      href={res.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-[10px] font-black uppercase tracking-wider text-white shadow-md shadow-blue-500/10 hover:shadow-lg flex items-center gap-1.5 cursor-pointer transition-all"
                      title="Download File"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Get</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 bg-slate-50/75 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Type</th>
                    <th className="py-4 px-4">Size</th>
                    <th className="py-4 px-4">Date Added</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {filteredResources.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6 max-w-sm">
                        <div className="flex items-center gap-3">
                          <FileIcon type={res.fileType} className="w-5 h-5 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate" title={res.title}>{res.title}</p>
                            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{res.text || 'No description'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-650 border border-slate-150 text-[9px] font-bold px-2 py-0.5 rounded-md">
                          {res.subcategory || res.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-bold uppercase">{res.fileType}</td>
                      <td className="py-4 px-4 text-slate-500 font-bold">{res.fileSize}</td>
                      <td className="py-4 px-4 text-slate-400 font-medium">
                        {new Date(res.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Preview Button */}
                          {res.attachmentUrl && (res.fileType === 'PDF' || res.fileType === 'IMAGE') && (
                            <button
                              onClick={() => setPreviewResource({ title: res.title, url: res.attachmentUrl!, fileType: res.fileType, size: res.fileSize })}
                              className="p-1.5 text-slate-455 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                              title="Preview Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}

                          {/* Download Button */}
                          {res.attachmentUrl && (
                            <a
                              href={res.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-455 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                              title="Download File"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}

                          {/* Delete Button */}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(res.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
                              title="Delete Resource"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-16 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-sm text-center max-w-xl mx-auto my-8 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 shadow-inner">
            <FolderOpen className="w-8 h-8 text-slate-300 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800">No resources available.</h3>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed max-w-xs font-semibold">
            There are currently no academic materials published. If you are an administrator, you can add resources using the action panel.
          </p>
        </div>
      )}

      {/* PDF / IMAGE PREVIEW MODAL */}
      {previewResource && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 cursor-pointer" onClick={() => setPreviewResource(null)} />
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden relative z-10 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <FileIcon type={previewResource.fileType} className="w-6 h-6" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 line-clamp-1">{previewResource.title}</h3>
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mt-0.5">
                    {previewResource.fileType} • {previewResource.size}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewResource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-slate-405 hover:bg-slate-200 hover:text-slate-650 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-slate-200"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Open URL</span>
                </a>
                <button
                  onClick={() => setPreviewResource(null)}
                  className="p-2 rounded-xl text-slate-405 hover:bg-slate-200 hover:text-slate-650 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body (Preview Iframe / Image) */}
            <div className="flex-1 bg-slate-100 flex flex-col min-h-0">
              {previewResource.fileType === 'PDF' ? (
                <iframe
                  src={previewResource.url}
                  className="w-full h-full border-0"
                  title={previewResource.title}
                />
              ) : previewResource.fileType === 'IMAGE' ? (
                <div className="flex-1 bg-slate-900 flex items-center justify-center p-8 overflow-auto">
                  <img
                    src={previewResource.url}
                    alt={previewResource.title}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg border border-slate-800"
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-550">
                  <FileIcon type={previewResource.fileType} className="w-12 h-12 mb-4" />
                  <p className="text-sm font-bold">Preview is not supported for this file format.</p>
                  <a
                    href={previewResource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN ADD RESOURCE DIALOG MODAL */}
      {showAddModal && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 cursor-pointer" onClick={() => setShowAddModal(false)} />
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4 relative z-10 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-600" />
                <span>Upload Campus Resource</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Resource Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Resource Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Hostels Leave Application Form"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-xs font-semibold"
                />
              </div>

              {/* Category & Subcategory Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Category</label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryFormChange(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-xs font-semibold h-[38px]"
                  >
                    {RESOURCE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Subcategory</label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-xs font-semibold h-[38px]"
                  >
                    {SUBCATEGORIES_MAP[category]?.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Metadata: File Size & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">File Size (Custom)</label>
                  <input
                    type="text"
                    required
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    placeholder="e.g. 1.5 MB"
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-xs font-semibold h-[38px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">File Type</label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-xs font-semibold h-[38px]"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="DOC">DOC / Word File</option>
                    <option value="ZIP">ZIP / Compressed</option>
                    <option value="IMAGE">Image File</option>
                    <option value="FILE">General File</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Description</label>
                <textarea
                  rows={2}
                  value={descriptionText}
                  onChange={(e) => setDescriptionText(e.target.value)}
                  placeholder="Provide details about the resource (instructions, guidelines)..."
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-xs font-semibold"
                />
              </div>

              {/* File source Toggle (Upload or URL link) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">File Content Source</label>
                <div className="flex border border-slate-250 bg-slate-50 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`flex-1 py-1.5 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                      uploadMode === 'url' ? 'bg-white border border-slate-200 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-655'
                    }`}
                  >
                    Direct URL Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('upload')}
                    className={`flex-1 py-1.5 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                      uploadMode === 'upload' ? 'bg-white border border-slate-200 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-655'
                    }`}
                  >
                    Upload Image
                  </button>
                </div>
              </div>

              {/* Attachment link input OR Upload zone */}
              {uploadMode === 'url' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Document File Link URL</label>
                  <input
                    type="url"
                    required
                    value={attachmentUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com/sharing-link-to-file.pdf"
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-xs font-semibold"
                  />
                  <p className="text-[10px] text-slate-450 mt-1.5 font-medium leading-relaxed flex items-start gap-1.5 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      For PDF/DOCX/ZIP resources, share a public link (e.g. from Google Drive, Dropbox, GitHub) and paste the URL here.
                    </span>
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Image File Attachment</label>
                  {attachmentUrl ? (
                    <div className="relative rounded-xl border border-slate-200 p-2.5 bg-slate-50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <ImageIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-[10px] text-slate-600 font-bold truncate max-w-[200px]">Image file uploaded!</span>
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
                          setFileType('IMAGE');
                          setFileSize('1.2 MB'); // Default estimate for uploaded screen images
                          toast.success('Image file uploaded!');
                        }}
                        onUploadError={() => {
                          toast.error('File upload failed.');
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
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
                  {submitting ? 'Publishing...' : 'Publish Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
