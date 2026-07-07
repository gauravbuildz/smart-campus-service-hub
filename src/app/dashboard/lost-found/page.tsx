'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { toast } from '@/components/Toast';
import { Search, MapPin, Calendar, User, Trash2, Inbox, PlusCircle, AlertCircle, HelpCircle, Tag, Image as ImageIcon, X, Check, ShieldAlert } from 'lucide-react';
import { UploadDropzone } from '@/lib/uploadthing';
import { DashboardHero } from '@/components/DashboardHero';

interface Item {
  id: string;
  itemName: string;
  description: string;
  category: string;
  type: string;
  status: string;
  location: string;
  imageUrl: string | null;
  createdAt: string;
  reporterId: string;
  reporter: {
    name: string;
    email: string;
  };
}

interface ClaimRequest {
  id: string;
  itemId: string;
  requesterId: string;
  proof: string;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  item: Item;
  requester: {
    name: string;
    email: string;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LostFoundPage() {
  const { data: session, status } = useSession();
  
  // Real-Time Background Synchronization with SWR
  const { data: itemsRaw, mutate: mutateItems } = useSWR<Item[]>('/api/lost-found', fetcher, { refreshInterval: 5000 });
  const { data: claimsRaw, mutate: mutateClaims } = useSWR<ClaimRequest[]>('/api/lost-found/claim', fetcher, { refreshInterval: 5000 });

  const items = Array.isArray(itemsRaw) ? itemsRaw : [];
  const claims = Array.isArray(claimsRaw) ? claimsRaw : [];

  const [submitting, setSubmitting] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState<Item | null>(null);

  // Form State (Reporting Item)
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('FOUND'); // LOST or FOUND
  const [category, setCategory] = useState('OTHER'); // ELECTRONICS, BOOKS, ID_CARDS, CLOTHING, OTHER
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Form State (Ownership Claim)
  const [claimForm, setClaimForm] = useState({ proof: '', imageUrl: '' });

  // Filtering State
  const [filterType, setFilterType] = useState('ALL'); // ALL, LOST, FOUND
  const [filterCategory, setFilterCategory] = useState('ALL'); // ALL, ELECTRONICS, etc.
  const [search, setSearch] = useState('');

  // Tab View for Admin (viewing listings vs claim approvals)
  const [adminSubTab, setAdminSubTab] = useState<'listings' | 'claims'>('listings');

  const currentUser = session?.user as any;
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.email?.includes('admin') || currentUser?.email === 'john@1234';

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
    if (!itemName || !description || !location) {
      toast.error('Please fill in all fields.');
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch('/api/lost-found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemName, description, type, location, category, imageUrl }),
      });

      if (!res.ok) {
        throw new Error('Failed to report item');
      }

      toast.success('Item reported successfully!');
      setItemName('');
      setDescription('');
      setLocation('');
      setCategory('OTHER');
      setImageUrl('');
      mutateItems();
    } catch (err) {
      toast.error('Could not report item.');
    } finally {
      setSubmitting(false);
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

      if (!res.ok) {
        throw new Error('Failed to submit claim');
      }

      toast.success('Claim request submitted successfully!');
      setClaimForm({ proof: '', imageUrl: '' });
      setShowClaimModal(null);
      mutateClaims();
      mutateItems();
    } catch (err) {
      toast.error('Failed to submit claim.');
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
        toast.success('Claim approved successfully!');
        mutateClaims();
        mutateItems();
      }
    } catch (err) {
      toast.error('Failed to approve claim.');
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
        toast.success('Claim rejected.');
        mutateClaims();
      }
    } catch (err) {
      toast.error('Failed to reject claim.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this item listing?')) return;

    try {
      const res = await fetch(`/api/lost-found?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete item');
      }

      toast.success('Listing removed successfully.');
      mutateItems();
    } catch (err) {
      toast.error('Could not delete listing.');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === 'ALL' || item.type === filterType;
    const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const activeClaims = claims.filter(c => c.status === 'PENDING').length;

  return (
    <div className="space-y-6 text-left">
      <DashboardHero
        title="🎒 Lost & Found Desk"
        description="Lost something or found someone's asset? Report items, match claims, and reclaim lost properties."
        icon={Search}
        gradientClass="from-amber-600 via-orange-600 to-yellow-500"
        pageType="lost-found"
      />

      {/* Global Gallery Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {/* Admin tab toggles */}
          {isAdmin ? (
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setAdminSubTab('listings')}
                className={`py-1.5 px-3 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  adminSubTab === 'listings' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Gallery Items
              </button>
              <button
                onClick={() => setAdminSubTab('claims')}
                className={`py-1.5 px-3 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  adminSubTab === 'claims' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Claim Approvals Desk
                {activeClaims > 0 && (
                  <span className="bg-rose-500 text-white rounded-full px-1.5 py-0.5 text-[8px] font-black leading-none">
                    {activeClaims}
                  </span>
                )}
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              {['ALL', 'LOST', 'FOUND'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`py-2 px-4 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    filterType === t
                      ? 'bg-cyan-500 text-white shadow-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {t} Items
                </button>
              ))}
            </div>
          )}

          {adminSubTab === 'listings' && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-550 text-xs font-semibold focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="ELECTRONICS">Electronics</option>
              <option value="BOOKS">Books</option>
              <option value="ID_CARDS">ID Cards</option>
              <option value="CLOTHING">Clothing</option>
              <option value="OTHER">Other</option>
            </select>
          )}
        </div>

        {adminSubTab === 'listings' && (
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search items by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-xs font-medium"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form (Students & Admins) / Info Desk (Admins when checking claims) */}
        {adminSubTab === 'listings' ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm h-fit space-y-4 lg:col-span-1">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-cyan-500" />
              Report an Item
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ITEM NAME</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Blue Water Bottle"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">REPORT TYPE</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setType('FOUND')}
                      className={`py-2 px-2 rounded-xl border font-semibold text-[10px] transition-all cursor-pointer ${
                        type === 'FOUND'
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Found It
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('LOST')}
                      className={`py-2 px-2 rounded-xl border font-semibold text-[10px] transition-all cursor-pointer ${
                        type === 'LOST'
                          ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Lost It
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">CATEGORY</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-xs font-medium h-[38px]"
                  >
                    <option value="ELECTRONICS">Electronics</option>
                    <option value="BOOKS">Books</option>
                    <option value="ID_CARDS">ID Cards</option>
                    <option value="CLOTHING">Clothing</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">LOCATION</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Science Lab B, Library"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm font-medium"
                />
              </div>

              {/* Image upload box */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">UPLOAD IMAGE</label>
                {imageUrl ? (
                  <div className="relative rounded-xl border border-slate-250 p-2.5 bg-slate-50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ImageIcon className="w-5 h-5 text-slate-400 shrink-0" />
                      <span className="text-[10px] text-slate-600 font-bold truncate max-w-[150px]">Image Uploaded!</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setImageUrl('')}
                      className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <UploadDropzone
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => setImageUrl(res[0].url)}
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe details like brand, color, or tags. Provide contact info if wanted..."
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-sm font-semibold text-white cursor-pointer shadow-md shadow-cyan-500/10 transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Post Item Report'}
              </button>
            </form>
          </div>
        ) : (
          /* Approvals Info Desk */
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm h-fit space-y-3 lg:col-span-1">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-500" />
              Approvals Desk
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              You are currently viewing student claim requests. 
            </p>
            <ul className="list-disc pl-4 text-xs text-slate-500 space-y-1.5 leading-relaxed font-medium">
              <li>Inspect the ownership proof description and attached images.</li>
              <li>Approving a claim automatically marks the item as **CLAIMED** and rejects other pending claims for that item.</li>
            </ul>
          </div>
        )}

        {/* Right Column: Gallery stream (Listings OR Claims Approvals) */}
        <div className="lg:col-span-2">
          {adminSubTab === 'listings' ? (
            filteredItems.length > 0 ? (
              <div className="flex flex-col gap-4">
                {filteredItems.map((item) => {
                  const canDelete = isAdmin || item.reporterId === currentUser?.id;
                  const showClaimButton = !isAdmin && item.type === 'FOUND' && item.status !== 'CLAIMED';
                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200/60 rounded-[18px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-md hover:border-blue-500/25 transition-all duration-300 relative group"
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Left Thumbnail or Icon */}
                        <div className="shrink-0">
                          {item.imageUrl ? (
                            <div className="w-16 h-16 rounded-xl border border-slate-200/60 overflow-hidden bg-slate-50">
                              <img src={item.imageUrl} alt={item.itemName} className="object-cover w-full h-full" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-amber-500">
                              <Tag className="w-6 h-6 text-amber-650" />
                            </div>
                          )}
                        </div>

                        {/* Center Metadata and Typography */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-md border ${
                              item.type === 'LOST'
                                ? 'bg-rose-50 text-rose-700 border-rose-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}>
                              {item.type}
                            </span>
                            <span className="text-[9px] font-black tracking-wider uppercase text-blue-700 bg-blue-50/50 border border-blue-100/50 px-2 py-0.5 rounded-md">
                              {item.category}
                            </span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 font-extrabold truncate">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              Location: <span className="text-slate-700 font-black">{item.location}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-350" />
                              {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-[9px] text-slate-400 flex items-center gap-1 font-extrabold">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              By: <span className="text-slate-655 font-black truncate">{item.reporter?.name || 'Student'}</span>
                            </span>
                          </div>

                          <h3 className="text-sm font-black text-slate-800 leading-tight">{item.itemName}</h3>
                          <p className="text-xs text-slate-500 font-semibold line-clamp-2 leading-relaxed">{item.description}</p>
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 md:self-center">
                        {showClaimButton && (
                          <button
                            onClick={() => {
                              setClaimForm({ proof: '', imageUrl: '' });
                              setShowClaimModal(item);
                            }}
                            className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[10px] font-black uppercase tracking-wider text-white shadow-md shadow-emerald-500/10 hover:shadow-lg cursor-pointer transition-all"
                          >
                            Claim
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg bg-rose-50 border border-rose-100 hover:bg-rose-500 text-rose-500 hover:text-white transition-all cursor-pointer shadow-sm"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl text-slate-400 border border-slate-200/80 shadow-sm w-full">
                <Inbox className="w-12 h-12 mb-3 stroke-1 text-slate-300" />
                <p className="text-sm font-semibold">No items matched your criteria</p>
              </div>
            )
          ) : (
            /* Admin Claims approval desk stream */
            claims.filter(c => c.status === 'PENDING').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {claims.filter(c => c.status === 'PENDING').map((claim) => (
                  <div
                    key={claim.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/85 shadow-sm flex flex-col justify-between h-[320px] relative hover:shadow-md transition-all duration-200"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-250/20">
                          PENDING APPROVAL
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-350" />
                          {new Date(claim.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-slate-800 mt-2">Claim for: {claim.item.itemName}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed"><span className="font-bold text-slate-600">Proof:</span> {claim.proof}</p>
                      
                      {claim.imageUrl && (
                        <div className="h-28 w-full bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative">
                          <img 
                            src={claim.imageUrl} 
                            alt="Claim receipt proof" 
                            className="object-cover w-full h-full"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] text-slate-400 flex items-center gap-1 truncate font-semibold">
                          <User className="w-3 h-3 text-slate-350" />
                          Claimant: <span className="text-slate-600 font-bold truncate">{claim.requester.name} ({claim.requester.email})</span>
                        </span>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => handleApproveClaim(claim.id)}
                          className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-0.5"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectClaim(claim.id)}
                          className="p-1 px-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-0.5"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl text-slate-400 border border-slate-200/80 shadow-sm w-full">
                <Inbox className="w-12 h-12 mb-3 stroke-1 text-slate-300" />
                <p className="text-sm font-semibold">No pending claim requests</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Claim Form Modal (Student) */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
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
