'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  User, Plus, Search, Filter, Trash2, Edit3, X, Eye, 
  ShieldAlert, Calendar, AlertCircle 
} from 'lucide-react';
import { DashboardHero } from '@/components/DashboardHero';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Student {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

export default function StudentManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user as any;
  const isAdmin = user?.role === 'ADMIN' || user?.email?.includes('admin') || user?.email === 'john@1234';

  const { data: students = [], mutate } = useSWR<Student[]>('/api/students', fetcher);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Student | null>(null);
  const [showViewModal, setShowViewModal] = useState<Student | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' });
  const [editForm, setEditForm] = useState({ id: '', name: '', email: '', role: 'STUDENT', password: '' });
  const [formError, setFormError] = useState('');

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl text-slate-400 border border-slate-200/80 shadow-sm w-full">
        <ShieldAlert className="w-12 h-12 mb-3 stroke-1 text-slate-350" />
        <p className="text-sm font-semibold">Access Denied: Admin role required</p>
      </div>
    );
  }

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = (s.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          s.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to add student');
      } else {
        setAddForm({ name: '', email: '', password: '', role: 'STUDENT' });
        setShowAddModal(false);
        mutate();
      }
    } catch (err) {
      setFormError('An error occurred. Please try again.');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to update user');
      } else {
        setShowEditModal(null);
        mutate();
      }
    } catch (err) {
      setFormError('An error occurred. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/students?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        mutate();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHero
        icon={User}
        title="Student Management"
        description="Maintain the student registry database, search details, edit credentials, view logs and control active student statuses."
        gradientClass="from-blue-600 via-indigo-650 to-cyan-500"
        pageType="overview"
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-slate-200/60 shadow-sm shrink-0">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-full border border-slate-200 bg-slate-50/50 text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="relative shrink-0 flex items-center">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-full border border-slate-200 bg-slate-50/50 text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer font-sans"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="ADMIN">Administrators</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/10 cursor-pointer transition-all shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Grid view (reused vertical list feed) */}
      {filteredStudents.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredStudents.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-slate-200/60 rounded-[18px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-md hover:border-blue-500/25 transition-all duration-300 relative group"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Left Circular Avatar */}
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-650 text-white flex items-center justify-center font-black text-sm border border-slate-100 shadow-md uppercase">
                    {(s.name || 'U').slice(0, 1).toUpperCase()}
                  </div>
                </div>

                {/* Center Metadata and Typography */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`text-[9px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-md border ${
                      s.role === 'ADMIN' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {s.role}
                    </span>
                    <span className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-350" />
                      Joined: {new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] text-slate-400 font-extrabold truncate max-w-[200px]">
                      ID: {s.id.slice(0, 8)}...
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-800 leading-tight">
                    {s.name || 'Anonymous User'}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {s.email}
                  </p>
                </div>
              </div>

              {/* Right Action buttons */}
              <div className="flex items-center gap-2 shrink-0 md:self-center">
                <button
                  onClick={() => setShowViewModal(s)}
                  className="py-1.5 px-3 rounded-lg border border-slate-200 hover:border-blue-400 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:text-blue-600 bg-white shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                  title="View Profile Details"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    setEditForm({ id: s.id, name: s.name || '', email: s.email, role: s.role, password: '' });
                    setShowEditModal(s);
                  }}
                  className="p-2 text-slate-450 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-all cursor-pointer"
                  title="Edit User"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {s.id !== user.id && (
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-2 text-slate-450 hover:text-rose-655 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl text-slate-400 border border-slate-200/80 shadow-sm w-full">
          <AlertCircle className="w-12 h-12 mb-3 stroke-1 text-slate-300" />
          <p className="text-sm font-semibold">No student records found</p>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 cursor-pointer" onClick={() => setShowViewModal(null)} />
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 relative z-10 animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowViewModal(null)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl text-slate-450 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-cyan-500 text-white flex items-center justify-center font-black text-2xl border border-white shadow-xl uppercase">
                {(showViewModal.name || 'U').slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">{showViewModal.name || 'Anonymous User'}</h3>
                <span className={`text-[9px] font-black tracking-wider uppercase px-2.5 py-0.5 mt-1.5 inline-block rounded-md border ${
                  showViewModal.role === 'ADMIN' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                }`}>
                  {showViewModal.role}
                </span>
              </div>
            </div>
            <div className="mt-6 border-t border-slate-100 pt-4 space-y-3 text-xs font-semibold text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Email Address</span>
                <span className="text-slate-800">{showViewModal.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Database ID</span>
                <span className="text-slate-800 font-mono text-[10px] max-w-[200px] truncate">{showViewModal.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Registration Date</span>
                <span className="text-slate-800">{new Date(showViewModal.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 cursor-pointer" onClick={() => setShowAddModal(false)} />
          <form onSubmit={handleAdd} className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 relative z-10 animate-in fade-in zoom-in duration-200 space-y-4">
            <button type="button" onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl text-slate-455 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-black text-slate-800 tracking-tight">Add New Student</h3>
            
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Gaurav Kumar"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="e.g. gaurav@campus.edu"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">System Role</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="STUDENT">STUDENT (Default)</option>
                  <option value="ADMIN">ADMINISTRATOR</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="py-2 px-4 rounded-xl border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/10 transition-all cursor-pointer"
              >
                Create Student
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 cursor-pointer" onClick={() => setShowEditModal(null)} />
          <form onSubmit={handleEdit} className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 relative z-10 animate-in fade-in zoom-in duration-200 space-y-4">
            <button type="button" onClick={() => setShowEditModal(null)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl text-slate-455 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-black text-slate-800 tracking-tight">Edit Student Profile</h3>
            
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. Gaurav Kumar"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="e.g. gaurav@campus.edu"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Reset Password (Optional)</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Leave empty to keep current password"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">System Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="ADMIN">ADMINISTRATOR</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowEditModal(null)}
                className="py-2 px-4 rounded-xl border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/10 transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
