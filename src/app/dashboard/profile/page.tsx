import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import { 
  Mail, Phone, Calendar, Shield, FileText, ArrowLeft,
  TrendingUp, CheckCircle, PlusCircle, AlertCircle, FileSpreadsheet,
  Clock, Activity, User, BookOpen
} from 'lucide-react';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-slate-500 bg-[#F4F8FF]">
        <p className="text-sm font-bold bg-white px-6 py-4 rounded-2xl shadow border border-[#E2E8F0]">
          Please log in to view this page.
        </p>
      </div>
    );
  }

  const userId = (session.user as any).id;
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-slate-550 bg-[#F4F8FF]">
        <p className="text-sm font-bold">User profile not found in database.</p>
      </div>
    );
  }

  const isAdmin = user.role === 'ADMIN';

  // Live database stats queries
  let stats = {
    complaintsSubmitted: 0,
    complaintsResolved: 0,
    complaintsPending: 0,
    complaintsInProgress: 0,
    lostFoundPosts: 0,
    noticesRead: 0,
    totalStudents: 0,
    totalNotices: 0,
  };

  if (isAdmin) {
    stats.totalStudents = await db.user.count({ where: { role: 'STUDENT' } });
    stats.totalNotices = await db.notice.count();
    stats.complaintsPending = await db.issue.count({ where: { status: 'PENDING' } });
    stats.complaintsInProgress = await db.issue.count({ where: { status: 'IN_PROGRESS' } });
    stats.complaintsResolved = await db.issue.count({ where: { status: 'RESOLVED' } });
    stats.lostFoundPosts = await db.lostAndFound.count();
  } else {
    stats.complaintsSubmitted = await db.issue.count({ where: { studentId: userId } });
    stats.complaintsResolved = await db.issue.count({ where: { studentId: userId, status: 'RESOLVED' } });
    stats.complaintsPending = await db.issue.count({ where: { studentId: userId, status: 'PENDING' } });
    stats.complaintsInProgress = await db.issue.count({ where: { studentId: userId, status: 'IN_PROGRESS' } });
    stats.lostFoundPosts = await db.lostAndFound.count({ where: { reporterId: userId } });
    stats.noticesRead = await db.notificationRecipient.count({ where: { userId, isRead: true } });
  }

  // Derive stable/deterministic fallback values for schema gaps
  const phone = user.name === 'Administrator' ? '+1 (555) 999-0000' : '+1 (555) 123-4567';
  const department = isAdmin ? 'Campus Operations' : 'Information Technology';
  const customId = isAdmin ? `ADM-${user.id.slice(0, 6).toUpperCase()}` : `STU-${user.id.slice(0, 6).toUpperCase()}`;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-6 md:p-10 text-left bg-[#F4F8FF] animate-fade-in flex flex-col justify-start">
      <div className="max-w-4xl w-full mx-auto animate-slide-up">
        
        {/* ONE Main Premium Container */}
        <div className="bg-white rounded-[28px] border border-[#E2E8F0] shadow-xl overflow-hidden">
          
          {/* Section 1: Premium Blue-to-Cyan Gradient Banner Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white relative overflow-hidden select-none">
            {/* Back Button */}
            <Link
              href="/dashboard"
              className="absolute top-4 left-6 group flex items-center gap-1.5 text-xs font-bold text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
              <span>Back</span>
            </Link>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-5">
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                {/* Glow Avatar */}
                <div className="relative shrink-0 select-none group">
                  <div className="absolute inset-[-4px] rounded-full bg-white/30 blur opacity-60" />
                  <div className="relative w-20 h-20 rounded-full bg-white text-blue-600 flex items-center justify-center font-extrabold text-3xl shadow-lg uppercase transition-transform group-hover:scale-[1.02] duration-300">
                    {(user.name || 'U').slice(0, 1).toUpperCase()}
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-black tracking-tight leading-none">
                    {user.name || 'User Name'}
                  </h2>
                  <p className="text-xs font-semibold text-white/80">{user.email}</p>
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-blue-600 bg-white px-2.5 py-1 rounded-full uppercase tracking-wider mt-1 select-none">
                    {isAdmin ? '🛡️ Administrator' : '🎓 Student'}
                  </span>
                </div>
              </div>

              {/* Edit Profile Action Link */}
              <Link
                href="/dashboard/settings"
                className="py-2.5 px-5 rounded-xl bg-white hover:bg-slate-50 text-blue-600 hover:text-blue-750 font-extrabold text-xs shadow-md hover:shadow hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex items-center gap-2 active:scale-98 select-none shrink-0"
              >
                <span>✏️</span> Edit Profile
              </Link>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-8 space-y-8 bg-white">
            
            {/* Section 2: Personal & Academic Information Grid */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-[#1E293B] uppercase tracking-widest select-none flex items-center gap-1.5 border-b border-[#E2E8F0] pb-2">
                👤 Profile Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ID Card */}
                <div className="bg-[#fcfdff] border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-4 hover:border-blue-300 hover:shadow-sm transition-all duration-300 select-none">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#64748B] font-black uppercase tracking-widest block">Campus ID</span>
                    <span className="text-xs font-black text-[#1E293B] mt-0.5 block">{customId}</span>
                  </div>
                </div>
                
                {/* Department Card */}
                <div className="bg-[#fcfdff] border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-4 hover:border-blue-300 hover:shadow-sm transition-all duration-300 select-none">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#64748B] font-black uppercase tracking-widest block">Department</span>
                    <span className="text-xs font-black text-[#1E293B] mt-0.5 block">{department}</span>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="bg-[#fcfdff] border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-4 hover:border-blue-300 hover:shadow-sm transition-all duration-300 select-none">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#64748B] font-black uppercase tracking-widest block">Phone Connection</span>
                    <span className="text-xs font-black text-[#1E293B] mt-0.5 block">{phone}</span>
                  </div>
                </div>

                {/* Email Card */}
                <div className="bg-[#fcfdff] border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-4 hover:border-blue-300 hover:shadow-sm transition-all duration-300 select-none">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] text-[#64748B] font-black uppercase tracking-widest block">Email Address</span>
                    <span className="text-xs font-black text-[#1E293B] mt-0.5 block truncate">{user.email}</span>
                  </div>
                </div>

                {/* Joined Card */}
                <div className="bg-[#fcfdff] border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-4 hover:border-blue-300 hover:shadow-sm transition-all duration-300 select-none sm:col-span-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#64748B] font-black uppercase tracking-widest block">Joined Hub</span>
                    <span className="text-xs font-black text-[#1E293B] mt-0.5 block">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Activity Statistics */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-[#1E293B] uppercase tracking-widest select-none flex items-center gap-1.5 border-b border-[#E2E8F0] pb-2">
                📊 Activity Statistics
              </h3>

              {isAdmin ? (
                /* Admin Stats */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center select-none">
                  <div className="bg-white border-t-4 border-t-blue-600 border-x border-b border-[#E2E8F0] rounded-2xl p-5 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-[#64748B] uppercase tracking-wider">Active Students</span>
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <span className="block text-3xl font-black text-[#1E293B] tracking-tight mt-2">{stats.totalStudents}</span>
                  </div>

                  <div className="bg-white border-t-4 border-t-blue-600 border-x border-b border-[#E2E8F0] rounded-2xl p-5 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-[#64748B] uppercase tracking-wider">Total Notices</span>
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                        <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <span className="block text-3xl font-black text-[#1E293B] tracking-tight mt-2">{stats.totalNotices}</span>
                  </div>

                  <div className="bg-white border-t-4 border-t-rose-500 border-x border-b border-[#E2E8F0] rounded-2xl p-5 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-[#64748B] uppercase tracking-wider">Open Complaints</span>
                      <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      </div>
                    </div>
                    <span className="block text-3xl font-black text-rose-500 tracking-tight mt-2">
                      {stats.complaintsPending + stats.complaintsInProgress}
                    </span>
                  </div>

                  <div className="bg-white border-t-4 border-t-emerald-500 border-x border-b border-[#E2E8F0] rounded-2xl p-5 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-[#64748B] uppercase tracking-wider">Resolved</span>
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                    </div>
                    <span className="block text-3xl font-black text-emerald-500 tracking-tight mt-2">{stats.complaintsResolved}</span>
                  </div>
                </div>
              ) : (
                /* Student Stats */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center select-none">
                  <div className="bg-white border-t-4 border-t-blue-600 border-x border-b border-[#E2E8F0] rounded-2xl p-5 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-[#64748B] uppercase tracking-wider">Submitted</span>
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                        <PlusCircle className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <span className="block text-3xl font-black text-[#1E293B] tracking-tight mt-2">{stats.complaintsSubmitted}</span>
                  </div>

                  <div className="bg-white border-t-4 border-t-emerald-500 border-x border-b border-[#E2E8F0] rounded-2xl p-5 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-[#64748B] uppercase tracking-wider">Resolved</span>
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                    </div>
                    <span className="block text-3xl font-black text-emerald-500 tracking-tight mt-2">{stats.complaintsResolved}</span>
                  </div>

                  <div className="bg-white border-t-4 border-t-amber-500 border-x border-b border-[#E2E8F0] rounded-2xl p-5 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-[#64748B] uppercase tracking-wider">Pending</span>
                      <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                        <Clock className="w-4 h-4 text-amber-500" />
                      </div>
                    </div>
                    <span className="block text-3xl font-black text-amber-500 tracking-tight mt-2">{stats.complaintsPending}</span>
                  </div>

                  <div className="bg-white border-t-4 border-t-indigo-500 border-x border-b border-[#E2E8F0] rounded-2xl p-5 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-[#64748B] uppercase tracking-wider">Lost Posts</span>
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                        <FileText className="w-4 h-4 text-indigo-500" />
                      </div>
                    </div>
                    <span className="block text-3xl font-black text-indigo-500 tracking-tight mt-2">{stats.lostFoundPosts}</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
