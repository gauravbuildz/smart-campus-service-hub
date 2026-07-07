'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Mail, Phone, Shield, FileText, ArrowLeft, Camera, User, Lock, Key,
  Settings
} from 'lucide-react';
import { toast } from '@/components/Toast';
import { updateProfile, updatePassword } from './actions';

interface SettingsClientProps {
  initialUser: {
    id: string;
    name: string | null;
    email: string;
    phone?: string;
  };
}

export default function SettingsClient({ initialUser }: SettingsClientProps) {
  const router = useRouter();
  
  const [name, setName] = useState(initialUser.name || '');
  const [phone, setPhone] = useState(initialUser.phone || '+1 (555) 123-4567');

  // Password states
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [saving, setSaving] = useState(false);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Save profile details if changed
      if (name !== initialUser.name || phone !== '+1 (555) 123-4567') {
        await updateProfile(name, phone);
      }
      
      // 2. Save security password if filled
      if (currentPass || newPass || confirmPass) {
        if (newPass !== confirmPass) {
          toast.error('New password and confirm password do not match.');
          setSaving(false);
          return;
        }
        await updatePassword(currentPass, newPass);
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      }

      toast.success('Settings updated successfully!');
      router.refresh();
      router.push('/dashboard/profile');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-8 px-6 text-left bg-[#F4F8FF] animate-fade-in flex flex-col justify-start select-none">
      {/* Compact Centered Container (Max Width 720px) */}
      <div className="max-w-[720px] w-full mx-auto animate-slide-up my-auto">
        
        {/* ONE Premium SaaS Card Container with Gradient Fill & Soft Shadow */}
        <div className="bg-gradient-to-br from-white to-[#EEF6FF] backdrop-blur-md border border-blue-200/50 rounded-[24px] shadow-xl p-8 space-y-6 shadow-blue-900/5 relative overflow-hidden">
          
          {/* Soft Blue Glow Overlay */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-blue-300/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-cyan-300/10 blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-blue-100 pb-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Settings className="w-4 h-4" />
                </div>
                <h1 className="text-lg font-black text-[#1E293B] tracking-tight">Settings</h1>
              </div>
              <p className="text-[11px] text-[#64748B] font-semibold pl-10">Manage your account settings.</p>
            </div>
            
            <Link
              href="/dashboard/profile"
              className="group flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-black text-slate-500 hover:text-slate-900 transition-all shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform duration-200" />
              <span>Cancel</span>
            </Link>
          </div>

          <form onSubmit={handleSaveChanges} className="space-y-6">
            
            {/* Section 1: Profile */}
            <div className="space-y-4">
              <h2 className="text-sm font-black text-[#1E293B] uppercase tracking-wider flex items-center gap-1.5 border-b border-blue-50 pb-1.5">
                👤 Profile
              </h2>
              
              <div className="space-y-4">
                {/* Avatar Change Row */}
                <div className="flex items-center gap-4 pb-1">
                  <div className="relative shrink-0 select-none group">
                    <div className="absolute inset-[-2px] rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 blur-sm opacity-25" />
                    <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 via-cyan-600 to-blue-600 text-white flex items-center justify-center font-extrabold text-xl border-2 border-white shadow-sm uppercase">
                      {(name || 'U').slice(0, 1).toUpperCase()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-650 block">Profile Photo</span>
                    <button
                      type="button"
                      onClick={() => toast.success('Profile avatar uploading synced with college enrollment database.')}
                      className="py-1 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[9px] font-black text-[#64748B] flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm shadow-slate-100"
                    >
                      <Camera className="w-3 h-3 text-slate-400" />
                      Change Photo
                    </button>
                  </div>
                </div>

                {/* Profile Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="block w-full h-10 rounded-[12px] border border-[#E2E8F0] bg-white pl-9.5 pr-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-xs font-semibold shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-450">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="block w-full h-10 rounded-[12px] border border-[#E2E8F0] bg-white pl-9.5 pr-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-xs font-semibold shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-705 block">Email Address (Read Only)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="email"
                        value={initialUser.email}
                        disabled
                        className="block w-full h-10 rounded-[12px] border border-[#E2E8F0] bg-slate-50/50 pl-9.5 pr-4 py-2 text-slate-450 cursor-not-allowed text-xs font-semibold shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#E2E8F0]" />

            {/* Section 2: Security */}
            <div className="space-y-4">
              <h2 className="text-sm font-black text-[#1E293B] uppercase tracking-wider flex items-center gap-1.5 border-b border-blue-50 pb-1.5">
                🔒 Security
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Current Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="password"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="Enter current password"
                      className="block w-full h-10 rounded-[12px] border border-[#E2E8F0] bg-white pl-9.5 pr-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-xs font-semibold shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-450">
                        <Key className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="New password"
                        className="block w-full h-10 rounded-[12px] border border-[#E2E8F0] bg-white pl-9.5 pr-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-xs font-semibold shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-455">
                        <Key className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="password"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        placeholder="Confirm password"
                        className="block w-full h-10 rounded-[12px] border border-[#E2E8F0] bg-white pl-9.5 pr-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-xs font-semibold shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#E2E8F0]" />

            {/* Save Changes Footer */}
            <div className="flex justify-end gap-3 pt-1 select-none">
              <Link
                href="/dashboard/profile"
                className="py-2 px-4.5 rounded-xl border border-[#E2E8F0] text-slate-700 hover:bg-slate-50 font-extrabold text-xs transition-colors cursor-pointer shadow-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="py-2 px-5.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-750 hover:to-cyan-600 text-white font-extrabold text-xs shadow-md hover:shadow hover:-translate-y-0.5 transition-all duration-300 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
