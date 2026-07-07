'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowRight, Bell, AlertTriangle, Search, Check, 
  GraduationCap, Sparkles, X, Mail, Lock, User, 
  Shield, CheckCircle, Info, Menu, Phone, MapPin, 
  Eye, EyeOff, Activity, ChevronRight, MessageSquare,
  FolderOpen, ClipboardList, LayoutDashboard
} from 'lucide-react';
import { toast } from '@/components/Toast';

interface LandingPageClientProps {
  initialSession: any;
}

export default function LandingPageClient({ initialSession }: LandingPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Authentication State
  const [session, setSession] = useState(initialSession);
  const isAuthenticated = !!session;
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Modal and Navigation States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup Form States
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  // Contact Form States
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Intercept trigger params (?login=true or ?register=true)
  useEffect(() => {
    const triggerLogin = searchParams.get('login') === 'true';
    const triggerRegister = searchParams.get('register') === 'true';

    if (triggerLogin) {
      setIsLoginOpen(true);
      setIsSignupOpen(false);
    } else if (triggerRegister) {
      setIsSignupOpen(true);
      setIsLoginOpen(false);
    }
  }, [searchParams]);

  // Global ESC Key Listener to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLoginOpen(false);
        setIsSignupOpen(false);
        setIsFeaturesOpen(false);
        setIsAboutOpen(false);
        setIsContactOpen(false);

        // Reset URL params without reloading page
        const url = new URL(window.location.href);
        url.searchParams.delete('login');
        url.searchParams.delete('register');
        window.history.replaceState({}, '', url.pathname + url.search);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Action Button handling depending on Auth
  const handleDashboardRedirect = async () => {
    if (isAuthenticated) {
      const user = session?.user;
      const isAdmin = user?.role === 'ADMIN' || user?.email?.includes('admin') || user?.email === 'john@1234';
      router.push(isAdmin ? '/admin/dashboard' : '/student/dashboard');
    } else {
      setIsLoginOpen(true);
    }
  };

  // Switch Modals
  const switchToSignup = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  const switchToLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('login');
    window.history.replaceState({}, '', url.pathname + url.search);
  };

  const closeSignupModal = () => {
    setIsSignupOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('register');
    window.history.replaceState({}, '', url.pathname + url.search);
  };

  // Form Submissions
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const res = await signIn('credentials', {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });

      if (res?.error) {
        toast.error(res.error || 'Invalid credentials');
      } else {
        setIsRedirecting(true);
        toast.success('Successfully logged in!');

        // Retrieve active session details to redirect user dynamically
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();

        const user = sessionData?.user;
        const isAdmin = user?.role === 'ADMIN' || user?.email?.includes('admin') || user?.email === 'john@1234';
        
        window.location.replace(isAdmin ? '/admin/dashboard' : '/student/dashboard');
      }
    } catch (err: any) {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSignupLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          role: signupRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Registration failed');
      } else {
        toast.success('Registration successful! Please log in.');
        setLoginEmail(signupEmail); // pre-populate email for login convenience
        setLoginPassword('');
        switchToLogin();
      }
    } catch (err: any) {
      toast.error('An unexpected error occurred.');
    } finally {
      setSignupLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    // Mock contact message response
    setTimeout(() => {
      toast.success('Message sent! Support team will review shortly.');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setContactLoading(false);
    }, 1000);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col justify-between bg-slate-50 relative select-none">
      {/* Full-Screen Redirecting Overlay */}
      {isRedirecting && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-slate-100/50 flex items-center justify-center animate-scale-in">
            <svg className="animate-spin h-8 w-8 text-cyan-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>
      )}

      {/* Background glow visual elements */}
      <div className="absolute top-[-15%] left-[10%] w-[550px] h-[550px] bg-cyan-400/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[10%] w-[550px] h-[550px] bg-blue-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Premium Sticky Navbar */}
      <header className="w-full h-20 flex items-center justify-between px-6 md:px-16 border-b border-slate-200/80 bg-white/70 backdrop-blur-md z-45 shrink-0">
        {/* Left Side: Brand Logo */}
        <Link 
          href="/" 
          onClick={(e) => {
            e.preventDefault();
            // Close all modals to return to main Hero
            setIsFeaturesOpen(false);
            setIsAboutOpen(false);
            setIsContactOpen(false);
          }}
          className="flex items-center gap-2.5 group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
            <GraduationCap className="w-5.5 h-5.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
              Campus Hub
            </span>
            <span className="text-[10px] font-bold text-slate-450 mt-1 uppercase tracking-wider">Smart Campus Service Hub</span>
          </div>
        </Link>

        {/* Center: Navigation Options (Launch Modals) */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-650">
          <button 
            onClick={() => {
              setIsFeaturesOpen(false);
              setIsAboutOpen(false);
              setIsContactOpen(false);
            }} 
            className={`flex items-center gap-1.5 px-1 py-1 transition-all hover:text-cyan-600 cursor-pointer ${
              (!isFeaturesOpen && !isAboutOpen && !isContactOpen) ? 'text-cyan-600 font-extrabold' : ''
            }`}
          >
            🏠 Home
          </button>
          <button 
            onClick={() => {
              setIsAboutOpen(false);
              setIsContactOpen(false);
              setIsFeaturesOpen(true);
            }} 
            className={`flex items-center gap-1.5 px-1 py-1 transition-all hover:text-cyan-600 cursor-pointer ${
              isFeaturesOpen ? 'text-cyan-600 font-extrabold' : ''
            }`}
          >
            ✨ Features
          </button>
          <button 
            onClick={() => {
              setIsFeaturesOpen(false);
              setIsContactOpen(false);
              setIsAboutOpen(true);
            }} 
            className={`flex items-center gap-1.5 px-1 py-1 transition-all hover:text-cyan-600 cursor-pointer ${
              isAboutOpen ? 'text-cyan-600 font-extrabold' : ''
            }`}
          >
            ℹ️ About
          </button>
          <button 
            onClick={() => {
              setIsFeaturesOpen(false);
              setIsAboutOpen(false);
              setIsContactOpen(true);
            }} 
            className={`flex items-center gap-1.5 px-1 py-1 transition-all hover:text-cyan-600 cursor-pointer ${
              isContactOpen ? 'text-cyan-600 font-extrabold' : ''
            }`}
          >
            📞 Contact
          </button>
        </nav>

        {/* Right Side: Auth controls */}
        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated ? (
            /* User Info profile badge instead of repeating the dashboard button */
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-2xl">
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-slate-800">{session?.user?.name || 'User'}</span>
                <span className="text-[10px] font-extrabold text-cyan-600 tracking-wider uppercase">{session?.user?.role || 'STUDENT'}</span>
              </div>
              <div className="w-8.5 h-8.5 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center border border-cyan-500/20 font-extrabold text-xs">
                {(session?.user?.name || 'US').slice(0, 2).toUpperCase()}
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="text-slate-700 hover:text-cyan-600 border border-slate-200 hover:border-cyan-500/30 rounded-xl font-semibold text-xs px-4.5 py-2.5 transition-all duration-200 cursor-pointer bg-white/50 backdrop-blur"
              >
                🔐 Login
              </button>
              <button
                onClick={() => setIsSignupOpen(true)}
                className="flex items-center justify-center h-10.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold shadow-md shadow-cyan-500/10 transition-all text-xs hover:-translate-y-0.5 active:translate-y-0 duration-200 cursor-pointer"
              >
                🚀 Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-650 hover:bg-slate-100 border border-slate-200 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
        </button>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-20 bg-slate-900/10 backdrop-blur-sm z-40 lg:hidden animate-fade-in">
          <div className="bg-white border-b border-slate-200 flex flex-col p-6 gap-3 shadow-lg">
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                setIsFeaturesOpen(false);
                setIsAboutOpen(false);
                setIsContactOpen(false);
              }}
              className="p-3 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-all text-left text-slate-700"
            >
              🏠 Home
            </button>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAboutOpen(false);
                setIsContactOpen(false);
                setIsFeaturesOpen(true);
              }}
              className="p-3 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-all text-left text-slate-700"
            >
              ✨ Features
            </button>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                setIsFeaturesOpen(false);
                setIsContactOpen(false);
                setIsAboutOpen(true);
              }}
              className="p-3 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-all text-left text-slate-700"
            >
              ℹ️ About
            </button>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                setIsFeaturesOpen(false);
                setIsAboutOpen(false);
                setIsContactOpen(true);
              }}
              className="p-3 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-all text-left text-slate-700"
            >
              📞 Contact
            </button>
            <div className="h-px bg-slate-100 my-1" />
            <div className="flex flex-col gap-2.5">
              {isAuthenticated ? (
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-800">{session?.user?.name || 'User'}</span>
                    <span className="text-[10px] font-extrabold text-cyan-600 uppercase tracking-wider">{session?.user?.role || 'STUDENT'}</span>
                  </div>
                  <button
                    onClick={handleDashboardRedirect}
                    className="h-9 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs cursor-pointer shadow-sm flex items-center gap-1"
                  >
                    Go
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsLoginOpen(true);
                    }}
                    className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm bg-slate-50 hover:bg-slate-100 cursor-pointer"
                  >
                    🔐 Login
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsSignupOpen(true);
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm cursor-pointer shadow-md text-center"
                  >
                    🚀 Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Home / Hero Section (Fits 100vh completely) */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-6 max-w-4xl mx-auto relative z-10 shrink-0 select-none">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-700 border border-cyan-500/20 mb-6 text-xs font-black uppercase tracking-wider shadow-sm shadow-cyan-500/2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
          Unified Smart Campus Portal
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7.5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Smart Campus <br />
          <span className="bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Service Hub
          </span>
        </h1>

        {/* Short Description */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-550 leading-relaxed font-semibold mt-6">
          A centralized, premium digital hub designed for modern academic life. Access real-time administrative notices, report campus maintenance complaints, and trace lost belongings in one unified interface.
        </p>

        {/* Primary CTA (Guest vs Logged In - exactly one Dashboard button shown) */}
        <div className="mt-8">
          {isAuthenticated ? (
            <button
              onClick={handleDashboardRedirect}
              className="flex items-center justify-center h-12.5 px-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold shadow-lg shadow-cyan-500/15 transition-all text-sm hover:-translate-y-0.5 active:translate-y-0 duration-200 cursor-pointer"
            >
              📊 Go to Dashboard
              <ArrowRight className="w-4.5 h-4.5 ml-2" />
            </button>
          ) : (
            <button
              onClick={() => setIsFeaturesOpen(true)}
              className="flex items-center justify-center h-12.5 px-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold shadow-lg shadow-cyan-500/15 transition-all text-sm hover:-translate-y-0.5 active:translate-y-0 duration-200 cursor-pointer"
            >
              ✨ Explore Platform
            </button>
          )}
        </div>
      </main>

      {/* Tiny clean footer */}
      <footer className="h-12 border-t border-slate-200/50 flex items-center justify-between px-6 md:px-16 text-slate-400 text-[10px] font-bold z-10 shrink-0">
        <p>© {new Date().getFullYear()} Smart Campus Hub. All rights reserved.</p>
        <div className="flex gap-4">
          <button onClick={() => setIsAboutOpen(true)} className="hover:text-cyan-600 transition-colors cursor-pointer">About Team</button>
          <span>•</span>
          <button onClick={() => setIsContactOpen(true)} className="hover:text-cyan-600 transition-colors cursor-pointer">Help Center</button>
        </div>
      </footer>


      {/* PREMIUM FEATURES MODAL */}
      {isFeaturesOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md animate-fade-in p-4 md:p-8">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsFeaturesOpen(false)} />
          
          <div className="w-full max-w-5xl bg-white border border-slate-250 rounded-3xl shadow-2xl z-10 animate-slide-up relative flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-600" />
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Platform Capabilities</h2>
              </div>
              <button 
                onClick={() => setIsFeaturesOpen(false)}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700 cursor-pointer transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Content (Scrollable internally) */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Operational Utilities</p>
                <h3 className="text-2xl md:text-3.5xl font-extrabold text-slate-905 mt-1">Unified Campus Workflows</h3>
                <p className="text-sm font-semibold text-slate-450 mt-2">Explore the digital modules built to simplify administrative processes for student bodies and staff.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {/* Feature 1: Smart Dashboard */}
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col justify-between min-h-[160px] hover:border-cyan-500/30 transition-all duration-300 shadow-sm group">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold">
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-600 px-2 py-0.5 rounded-full border border-cyan-500/20">Unified Hub</span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-base font-bold text-slate-805">Smart Dashboard</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold">Personalized dashboard with live campus updates, profile management and quick access to all services.</p>
                  </div>
                </div>

                {/* Feature 2: Notices & Events */}
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col justify-between min-h-[160px] hover:border-cyan-500/30 transition-all duration-300 shadow-sm group">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold">
                      <Bell className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-500/20">Real-Time</span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-base font-bold text-slate-805">Notices & Events</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold">Receive real-time campus announcements, academic updates and event notifications.</p>
                  </div>
                </div>

                {/* Feature 3: Campus Services */}
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col justify-between min-h-[160px] hover:border-cyan-500/30 transition-all duration-300 shadow-sm group">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full border border-amber-500/20">Support desk</span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-base font-bold text-slate-805">Campus Services</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold">Submit complaints, track service requests and manage lost & found reports from one place.</p>
                  </div>
                </div>

                {/* Feature 4: Resource Hub */}
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col justify-between min-h-[160px] hover:border-cyan-500/30 transition-all duration-300 shadow-sm group">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-500/20">Resource vault</span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-base font-bold text-slate-805">Resource Hub</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold">Access notes, PDFs, forms, academic resources and important campus documents.</p>
                  </div>
                </div>

                {/* Feature 5: Secure Administration */}
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col justify-between min-h-[160px] hover:border-cyan-500/30 transition-all duration-300 shadow-sm group">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold">
                      <Shield className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 px-2 py-0.5 rounded-full border border-rose-500/20">Role Access</span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-base font-bold text-slate-805">Secure Administration</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold">Role-based Student and Admin dashboards with live analytics, resource management and secure authentication.</p>
                  </div>
                </div>

                {/* Quick actions panel */}
                <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between min-h-[160px] text-white shadow-sm group">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-450">Get started</span>
                  </div>
                  <div className="mt-4 flex flex-col gap-3">
                    <p className="text-xs text-slate-350 leading-relaxed font-semibold">Ready to utilize the platform tools?</p>
                    <button
                      onClick={() => {
                        setIsFeaturesOpen(false);
                        handleDashboardRedirect();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      {isAuthenticated ? 'Go to Dashboard' : 'Login / Register'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* PREMIUM ABOUT MODAL */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm animate-fade-in p-4">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsAboutOpen(false)} />
          
          <div className="w-full max-w-2xl bg-white border border-slate-250 rounded-3xl shadow-2xl z-10 animate-slide-up relative flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-cyan-650" />
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Portal Profile</h2>
              </div>
              <button 
                onClick={() => setIsAboutOpen(false)}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700 cursor-pointer transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Content (Scrollable internally) */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="space-y-3">
                <h3 className="text-2xl font-extrabold text-slate-905 saas-heading">Complete Smart Campus Management System</h3>
                <p className="text-sm text-slate-550 leading-relaxed font-semibold">
                  A centralized digital platform connecting students and administrators through a unified portal, streamlining notifications, complaints, and official certificates.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-150 p-4.5 rounded-2xl bg-slate-50/55">
                  <h4 className="text-xs font-black text-slate-450 uppercase tracking-wider">Platform Scope</h4>
                  <div className="text-[10px] text-slate-600 mt-1.5 space-y-1 font-semibold leading-relaxed">
                    <p>• Real-time campus updates & notices</p>
                    <p>• Complaint management & tracking</p>
                    <p>• Lost & Found claim tracing</p>
                    <p>• Academic study resource sharing</p>
                  </div>
                </div>
                <div className="border border-slate-150 p-4.5 rounded-2xl bg-slate-50/55">
                  <h4 className="text-xs font-black text-slate-450 uppercase tracking-wider">Platform Core</h4>
                  <div className="text-[10px] text-slate-600 mt-1.5 space-y-1 font-semibold leading-relaxed">
                    <p>• Digital service requests application</p>
                    <p>• Secure authentication encryption</p>
                    <p>• Role-based Student & Admin views</p>
                    <p>• Live Analytics for administrators</p>
                  </div>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-3 border border-slate-200 rounded-2xl p-4 divide-x divide-slate-150 text-center bg-slate-50/40">
                <div>
                  <span className="block text-xl md:text-2xl font-black text-cyan-600">1,200+</span>
                  <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider">Active Students</span>
                </div>
                <div>
                  <span className="block text-xl md:text-2xl font-black text-cyan-600">&lt; 2 mins</span>
                  <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider">Response Speed</span>
                </div>
                <div>
                  <span className="block text-xl md:text-2xl font-black text-cyan-600">98%</span>
                  <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider">Resolutions</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-450 uppercase tracking-wider">Technical Architecture</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-750 border border-slate-200 px-3 py-1 rounded-xl">Next.js 16 (App Router)</span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-755 border border-slate-200 px-3 py-1 rounded-xl">React 19</span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-755 border border-slate-200 px-3 py-1 rounded-xl">NextAuth v4</span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-755 border border-slate-200 px-3 py-1 rounded-xl">Prisma Client</span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-755 border border-slate-200 px-3 py-1 rounded-xl">PostgreSQL (Neon)</span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-755 border border-slate-200 px-3 py-1 rounded-xl">Tailwind CSS v4</span>
                </div>
              </div>

              <div className="border-t border-slate-150 pt-5 flex items-center justify-between text-[11px] font-bold text-slate-450">
                <span>Dev Team: Engineers focused on campus communication and digital services</span>
                <span>Smart Campus Management System</span>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* PREMIUM CONTACT MODAL */}
      {isContactOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm animate-fade-in p-4">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsContactOpen(false)} />
          
          <div className="w-full max-w-3xl bg-white border border-slate-250 rounded-3xl shadow-2xl z-10 animate-slide-up relative flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-cyan-650" />
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Support Desk</h2>
              </div>
              <button 
                onClick={() => setIsContactOpen(false)}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700 cursor-pointer transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Content (Scrollable internally) */}
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Directory Column */}
              <div className="md:col-span-5 flex flex-col justify-between gap-6">
                <div className="space-y-5">
                  <h3 className="text-lg font-black text-slate-805">Helpdesk Directory</h3>
                  
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-500/10">
                      <Mail className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Support</p>
                      <a href="mailto:support@campus.edu" className="text-xs font-semibold text-slate-800 hover:text-cyan-600 transition-colors">support@campus.edu</a>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-500/10">
                      <Phone className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Telephone Desk</p>
                      <a href="tel:+1234567890" className="text-xs font-semibold text-slate-800 hover:text-cyan-600 transition-colors">+1 (234) 567-890</a>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-500/10">
                      <MapPin className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Office Location</p>
                      <p className="text-xs font-semibold text-slate-805">Block A, Desk 12, Smart Campus Center</p>
                    </div>
                  </div>
                </div>

                {/* FAQ quick overview */}
                <div className="border border-slate-150 p-4 rounded-2xl bg-slate-50 space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Help Center FAQ</span>
                  <div className="space-y-2 text-[11px] font-semibold text-slate-600 leading-normal max-h-[250px] overflow-y-auto pr-1">
                    <div className="cursor-pointer group" onClick={() => setActiveFaq(activeFaq === 0 ? null : 0)}>
                      <p className="flex items-center justify-between font-bold text-slate-750 group-hover:text-cyan-600">
                        Smart Dashboard
                        <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${activeFaq === 0 ? 'rotate-90' : ''}`} />
                      </p>
                      {activeFaq === 0 && <p className="text-[10px] text-slate-500 mt-1 font-medium bg-white p-2 rounded-xl border border-slate-100">Aggregates notices, events, active complaints, service requests, and quick action widgets on a role-based main page.</p>}
                    </div>

                    <div className="cursor-pointer group" onClick={() => setActiveFaq(activeFaq === 1 ? null : 1)}>
                      <p className="flex items-center justify-between font-bold text-slate-750 group-hover:text-cyan-600">
                        Notices & Events
                        <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${activeFaq === 1 ? 'rotate-90' : ''}`} />
                      </p>
                      {activeFaq === 1 && <p className="text-[10px] text-slate-500 mt-1 font-medium bg-white p-2 rounded-xl border border-slate-100">Browse official campus circulars, academic events, and announcements with AI summary features.</p>}
                    </div>

                    <div className="cursor-pointer group" onClick={() => setActiveFaq(activeFaq === 2 ? null : 2)}>
                      <p className="flex items-center justify-between font-bold text-slate-750 group-hover:text-cyan-600">
                        Complaints
                        <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${activeFaq === 2 ? 'rotate-90' : ''}`} />
                      </p>
                      {activeFaq === 2 && <p className="text-[10px] text-slate-500 mt-1 font-medium bg-white p-2 rounded-xl border border-slate-100">File tickets for Wi-Fi issues, hostel repairs, or classroom problems and track progress logs in real-time.</p>}
                    </div>

                    <div className="cursor-pointer group" onClick={() => setActiveFaq(activeFaq === 3 ? null : 3)}>
                      <p className="flex items-center justify-between font-bold text-slate-750 group-hover:text-cyan-600">
                        Lost & Found
                        <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${activeFaq === 3 ? 'rotate-90' : ''}`} />
                      </p>
                      {activeFaq === 3 && <p className="text-[10px] text-slate-500 mt-1 font-medium bg-white p-2 rounded-xl border border-slate-100">Post lost items or report found belongings. Claim owned objects securely by providing exact description proofs.</p>}
                    </div>

                    <div className="cursor-pointer group" onClick={() => setActiveFaq(activeFaq === 4 ? null : 4)}>
                      <p className="flex items-center justify-between font-bold text-slate-750 group-hover:text-cyan-600">
                        Resource Hub
                        <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${activeFaq === 4 ? 'rotate-90' : ''}`} />
                      </p>
                      {activeFaq === 4 && <p className="text-[10px] text-slate-500 mt-1 font-medium bg-white p-2 rounded-xl border border-slate-100">Access and download study notes, PDFs, course syllabus logs, and academic forms uploaded by staff.</p>}
                    </div>

                    <div className="cursor-pointer group" onClick={() => setActiveFaq(activeFaq === 5 ? null : 5)}>
                      <p className="flex items-center justify-between font-bold text-slate-750 group-hover:text-cyan-600">
                        Service Requests
                        <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${activeFaq === 5 ? 'rotate-90' : ''}`} />
                      </p>
                      {activeFaq === 5 && <p className="text-[10px] text-slate-500 mt-1 font-medium bg-white p-2 rounded-xl border border-slate-100">Apply for official credentials (Bonafide Certificates, ID cards, library registrations, or hostel passes).</p>}
                    </div>

                    <div className="cursor-pointer group" onClick={() => setActiveFaq(activeFaq === 6 ? null : 6)}>
                      <p className="flex items-center justify-between font-bold text-slate-750 group-hover:text-cyan-600">
                        Profile & Settings
                        <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${activeFaq === 6 ? 'rotate-90' : ''}`} />
                      </p>
                      {activeFaq === 6 && <p className="text-[10px] text-slate-500 mt-1 font-medium bg-white p-2 rounded-xl border border-slate-100">Update personal information, set display preferences, adjust notifications, and change security credentials.</p>}
                    </div>

                    <div className="cursor-pointer group" onClick={() => setActiveFaq(activeFaq === 7 ? null : 7)}>
                      <p className="flex items-center justify-between font-bold text-slate-750 group-hover:text-cyan-600">
                        Login & Account
                        <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${activeFaq === 7 ? 'rotate-90' : ''}`} />
                      </p>
                      {activeFaq === 7 && <p className="text-[10px] text-slate-500 mt-1 font-medium bg-white p-2 rounded-xl border border-slate-100">Access platform with registered credentials. Student (student@campus.edu/student123) or Admin (admin@campus.edu/admin123).</p>}
                    </div>

                    <div className="cursor-pointer group" onClick={() => setActiveFaq(activeFaq === 8 ? null : 8)}>
                      <p className="flex items-center justify-between font-bold text-slate-750 group-hover:text-cyan-600">
                        Admin Dashboard
                        <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${activeFaq === 8 ? 'rotate-90' : ''}`} />
                      </p>
                      {activeFaq === 8 && <p className="text-[10px] text-slate-500 mt-1 font-medium bg-white p-2 rounded-xl border border-slate-100">Administrative workspace to manage student lists, approve requests, resolve complaints, and post notices.</p>}
                    </div>

                    <div className="cursor-pointer group" onClick={() => setActiveFaq(activeFaq === 9 ? null : 9)}>
                      <p className="flex items-center justify-between font-bold text-slate-750 group-hover:text-cyan-600">
                        Analytics
                        <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${activeFaq === 9 ? 'rotate-90' : ''}`} />
                      </p>
                      {activeFaq === 9 && <p className="text-[10px] text-slate-500 mt-1 font-medium bg-white p-2 rounded-xl border border-slate-100">Consolidated analytics reports showing complaints categories, request speeds, and resolution charts for staff.</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Column */}
              <div className="md:col-span-7 border-l border-slate-150 md:pl-8">
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <h3 className="text-lg font-black text-slate-805 flex items-center gap-1.5">
                    <MessageSquare className="w-4.5 h-4.5 text-cyan-600" /> Message Form
                  </h3>
                  
                  <div>
                    <label htmlFor="contact-name" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="John Doe"
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Your Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="john@campus.edu"
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Message details
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={3}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Provide assistance query details here..."
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-xs font-medium resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="w-full flex justify-center items-center h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {contactLoading ? 'Sending Message...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* PREMIUM LOGIN MODAL */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="absolute inset-0 cursor-pointer" onClick={closeLoginModal} />
          
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-8 z-10 animate-slide-up relative flex flex-col gap-6">
            <button 
              onClick={closeLoginModal}
              className="absolute top-5 right-5 p-1.5 rounded-xl border border-slate-150 hover:bg-slate-50 text-slate-400 hover:text-slate-700 cursor-pointer transition-all"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="text-center mt-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 mb-4">
                <Lock className="w-5.5 h-5.5" />
              </div>
              <h2 className="text-2.5xl font-black tracking-tight text-slate-900 saas-heading">
                Welcome Back
              </h2>
              <p className="mt-2 text-sm text-slate-500 font-semibold leading-relaxed">
                Sign in to the <span className="bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent font-extrabold">Smart Campus Hub</span>
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div>
                <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  College Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@campus.edu"
                    className="block w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-3 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs font-bold mt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/20 w-4 h-4"
                  />
                  Remember Me
                </label>
                <button
                  type="button"
                  onClick={() => toast.info('Password recovery is managed by the College IT Desk. Please contact support@campus.edu.')}
                  className="text-cyan-650 hover:text-cyan-500 cursor-pointer transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full flex justify-center items-center h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold shadow-md shadow-cyan-500/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {loginLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            <div className="flex flex-col gap-4 items-center">
              <div className="text-xs text-slate-500 font-semibold">
                Don't have an account?{' '}
                <button 
                  onClick={switchToSignup}
                  className="text-cyan-600 hover:text-cyan-500 font-black cursor-pointer transition-colors"
                >
                  Sign Up
                </button>
              </div>

              <div className="border-t border-slate-100 w-full pt-4" />
              
              <div className="text-[11px] text-slate-400 bg-slate-50 border border-slate-100 p-3 rounded-2xl w-full">
                <span className="font-black text-slate-500 block mb-1 text-center uppercase tracking-wide">Demo Accounts</span>
                <div className="flex flex-col gap-1.5 font-medium">
                  <span className="flex justify-between items-center">
                    <span className="font-bold text-slate-500">Student:</span>
                    <code className="text-cyan-705 bg-cyan-500/5 px-1.5 py-0.5 rounded font-mono text-[10px]">student@123 / student123</code>
                  </span>
                  <span className="flex justify-between items-center">
                    <span className="font-bold text-slate-500">Admin:</span>
                    <code className="text-cyan-705 bg-cyan-500/5 px-1.5 py-0.5 rounded font-mono text-[10px]">admin@123 / admin123</code>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM SIGNUP MODAL */}
      {isSignupOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="absolute inset-0 cursor-pointer" onClick={closeSignupModal} />
          
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-8 z-10 animate-slide-up relative flex flex-col gap-5">
            <button 
              onClick={closeSignupModal}
              className="absolute top-5 right-5 p-1.5 rounded-xl border border-slate-150 hover:bg-slate-50 text-slate-400 hover:text-slate-700 cursor-pointer transition-all"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="text-center mt-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 mb-3">
                <User className="w-5.5 h-5.5" />
              </div>
              <h2 className="text-2.5xl font-black tracking-tight text-slate-900 saas-heading">
                Create Account
              </h2>
              <p className="mt-2 text-sm text-slate-500 font-semibold leading-relaxed">
                Join the <span className="bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent font-extrabold">Smart Campus Hub</span> today
              </p>
            </div>

            <form className="space-y-3.5" onSubmit={handleSignupSubmit}>
              <div>
                <label htmlFor="signup-name" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-name"
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="John Doe"
                    className="block w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  College Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="name@campus.edu"
                    className="block w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-password"
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="signup-confirm-password" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-confirm-password"
                    type="password"
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Register As
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-150 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setSignupRole('STUDENT')}
                    className={`py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      signupRole === 'STUDENT'
                        ? 'bg-cyan-500 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole('ADMIN')}
                    className={`py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      signupRole === 'ADMIN'
                        ? 'bg-cyan-500 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={signupLoading}
                className="w-full flex justify-center items-center h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold shadow-md shadow-cyan-500/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 mt-3"
              >
                {signupLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="text-center text-xs text-slate-500 font-semibold mt-1">
              Already have an account?{' '}
              <button 
                onClick={switchToLogin}
                className="text-cyan-600 hover:text-cyan-500 font-black cursor-pointer transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
