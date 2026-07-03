import Link from 'next/link';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ArrowRight, Bell, AlertTriangle, Search, Check, GraduationCap, Sparkles } from 'lucide-react';

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative overflow-hidden bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem]">
      {/* Background visual glow spheres */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Modern SaaS Header Navbar */}
      <header className="w-full h-20 flex items-center justify-between px-8 md:px-16 border-b border-slate-200 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50 animate-pulse" />
          <span className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            Campus Hub
          </span>
        </div>
        
        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#features" className="hover:text-cyan-600 transition-colors">Features</a>
          <a href="#about" className="hover:text-cyan-600 transition-colors">About</a>
        </nav>

        {/* CTA Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 h-10 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-md shadow-cyan-500/10 transition-all text-xs hover:-translate-y-0.5 duration-200 cursor-pointer"
            >
              Go to Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-slate-700 hover:text-cyan-600 font-semibold text-sm px-4 py-2 transition-colors cursor-pointer"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center justify-center h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm transition-all text-xs hover:-translate-y-0.5 duration-200 cursor-pointer"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 md:py-32 max-w-5xl mx-auto z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-700 border border-cyan-500/20 mb-6 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
          The Unified Campus Experience
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Smart Campus <br />
          <span className="bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Service Hub
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-500 leading-relaxed font-medium mt-6">
          A premium digital space built specifically for modern colleges. Stay updated with administrative notices, report infrastructure complaints, and search lost items in one centralized portal.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 w-full sm:w-auto">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center justify-center h-12 px-8 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-lg shadow-cyan-500/15 transition-all text-sm w-full sm:w-auto hover:-translate-y-0.5 duration-200 cursor-pointer"
            >
              Access Your Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="flex items-center justify-center h-12 px-8 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-lg shadow-cyan-500/15 transition-all text-sm w-full sm:w-auto hover:-translate-y-0.5 duration-200 cursor-pointer"
              >
                Sign In to Platform
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center justify-center h-12 px-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-sm transition-all text-sm w-full sm:w-auto hover:-translate-y-0.5 duration-200 cursor-pointer"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white border-t border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Engineered for Student Productivity
            </h2>
            <p className="mt-4 text-slate-500 font-medium">
              Eliminate bureaucracy and streamline all operational utilities into three core workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* feature 1 */}
            <div className="bg-slate-50 border border-slate-200/80 p-8 rounded-3xl transition-all duration-300 hover:shadow-lg hover:shadow-slate-100/50 hover:border-cyan-500/30 flex flex-col justify-between h-72 group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-350">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Real-Time Notices</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
                  Stay updated with dynamic, categorized bulletins, AI-powered summaries, and automatic push updates from administrators.
                </p>
              </div>
            </div>

            {/* feature 2 */}
            <div className="bg-slate-50 border border-slate-200/80 p-8 rounded-3xl transition-all duration-300 hover:shadow-lg hover:shadow-slate-100/50 hover:border-cyan-500/30 flex flex-col justify-between h-72 group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-350">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Complaints Hub</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
                  File technical and hostel complaints securely with attachment previews. Admins track, resolve, and update status in real-time.
                </p>
              </div>
            </div>

            {/* feature 3 */}
            <div className="bg-slate-50 border border-slate-200/80 p-8 rounded-3xl transition-all duration-300 hover:shadow-lg hover:shadow-slate-100/50 hover:border-cyan-500/30 flex flex-col justify-between h-72 group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-350">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Lost & Found Desk</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
                  Submit lost items and verified claim ownership requests. Image uploads are fully supported via secure asset uploads.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-[#0f172a] text-slate-100 border-t border-slate-800 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" /> About the Portal
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Transforming Campus Administration
            </h2>
            <p className="text-slate-400 leading-relaxed font-medium text-sm sm:text-base">
              The Smart Campus Service Hub replaces fragmented channels—like bulletin boards, Telegram groups, and physical registers—with a single, secure, and modern SaaS dashboard.
            </p>
            <div className="space-y-3 font-medium text-xs sm:text-sm text-slate-350">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Encrypted role-based verification workflows</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Responsive interface tailored for mobile web views</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Integrated real-time database queries & analytics</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-3xl shadow-2xl relative">
            <div className="absolute top-4 right-4 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <p className="text-xs font-mono text-cyan-400 mb-4">// Project Mission</p>
            <blockquote className="text-slate-300 font-bold italic leading-relaxed text-sm md:text-base">
              "We believe that modern technology should enable academic life, not complicate it. By unifying campus services, we save thousands of operational hours for students and staff alike."
            </blockquote>
            <p className="text-xs font-black text-white mt-4 tracking-wider uppercase">— Campus Hub Dev Team</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-500 font-medium">
        <p>© {new Date().getFullYear()} Smart Campus Service Hub. Built for the modern university.</p>
      </footer>
    </div>
  );
}
