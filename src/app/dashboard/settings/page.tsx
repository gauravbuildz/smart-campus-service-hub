import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-slate-505 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <p className="text-sm font-bold bg-white px-6 py-4 rounded-2xl shadow border border-slate-200">
          Please log in to view this page.
        </p>
      </div>
    );
  }

  const userId = (session.user as any).id;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-slate-500">
        <p className="text-sm font-bold">User profile not found in database.</p>
      </div>
    );
  }

  return <SettingsClient initialUser={user} />;
}
