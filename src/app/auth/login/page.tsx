'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from '@/components/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error(res.error || 'Invalid credentials');
      } else {
        toast.success('Successfully logged in!');
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem]">
      {/* Visual background lights */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Sign in to the <span className="bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent font-semibold">Smart Campus Hub</span>
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200/80">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                College Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campus.edu"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-xl bg-cyan-500 hover:bg-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-cyan-500/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-col gap-2 items-center text-xs text-slate-500 font-medium">
            <div>
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-cyan-600 hover:text-cyan-500 font-bold transition-all">
                Create one now
              </Link>
            </div>
            <div className="border-t border-slate-100 w-full my-3" />
            <div className="text-slate-400 text-center font-medium">
              Demo Credentials:
              <div className="mt-2 flex flex-col gap-1.5">
                <span className="flex items-center justify-center gap-1.5">
                  <span className="font-bold text-slate-500">Student:</span>
                  <code className="text-cyan-600 bg-cyan-500/5 border border-cyan-500/10 px-1.5 py-0.5 rounded text-[11px] font-semibold">student@campus.edu / student123</code>
                </span>
                <span className="flex items-center justify-center gap-1.5">
                  <span className="font-bold text-slate-500">Admin:</span>
                  <code className="text-cyan-600 bg-cyan-500/5 border border-cyan-500/10 px-1.5 py-0.5 rounded text-[11px] font-semibold">admin@campus.edu / admin123</code>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
