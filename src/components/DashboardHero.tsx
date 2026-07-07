import React from 'react';

interface DashboardHeroProps {
  title: React.ReactNode;
  description: string;
  icon: React.ComponentType<any>;
  gradientClass: string;
  pageType: 'overview' | 'notices' | 'complaints' | 'lost-found' | 'resources' | 'requests';
  extraHeader?: React.ReactNode;
  metadata?: React.ReactNode;
}

export function DashboardHero({
  title,
  description,
  icon: Icon,
  gradientClass,
  pageType,
  extraHeader,
  metadata
}: DashboardHeroProps) {
  // select SVG illustration based on pageType
  const getIllustration = () => {
    switch (pageType) {
      case 'overview':
        return (
          <svg className="w-44 h-44 text-white animate-pulse-slow" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15,80 L85,80 M20,80 L20,45 L80,45 L80,80 M30,80 L30,45 M43,80 L43,45 M57,80 L57,45 M70,80 L70,45" strokeLinecap="round" />
            <polygon points="15,45 50,22 85,45" fill="none" strokeLinejoin="round" />
            <circle cx="50" cy="22" r="3" fill="currentColor" />
            <path d="M50,12 C65,12 75,25 75,40" strokeDasharray="3 3" />
            <path d="M50,12 C35,12 25,25 25,40" strokeDasharray="3 3" />
            <ellipse cx="50" cy="50" rx="35" ry="12" transform="rotate(-15 50 50)" />
            <ellipse cx="50" cy="50" rx="35" ry="12" transform="rotate(15 50 50)" />
          </svg>
        );
      case 'notices':
        return (
          <svg className="w-40 h-40 text-white" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M25,40 L45,40 L65,25 L65,75 L45,60 L25,60 Z" fill="none" strokeLinejoin="round" />
            <path d="M65,45 C75,45 80,47 80,50 C80,53 75,55 65,55" />
            <path d="M73,35 C83,40 83,60 73,65" strokeWidth="2" strokeLinecap="round" />
            <path d="M80,25 C95,33 95,67 80,75" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2" />
          </svg>
        );
      case 'complaints':
        return (
          <svg className="w-40 h-40 text-white" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="25" y="25" width="50" height="55" rx="8" />
            <path d="M40,25 C40,20 60,20 60,25" strokeLinecap="round" />
            <path d="M35,45 L50,45 M35,55 L65,55 M35,65 L55,65" strokeLinecap="round" />
            <circle cx="75" cy="25" r="10" strokeWidth="2" fill="none" />
            <path d="M75,21 L75,26 M75,29 L75,30" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'lost-found':
        return (
          <svg className="w-40 h-40 text-white" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="20" y="35" width="45" height="45" rx="5" />
            <path d="M20,50 L65,50 M42.5,35 L42.5,80" strokeDasharray="3 3" />
            <circle cx="65" cy="40" r="15" strokeWidth="2" />
            <path d="M75,50 L90,65" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'resources':
        return (
          <svg className="w-40 h-40 text-white" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20,40 L40,40 L45,30 L75,30 A5,5 0 0 1 80,35 L80,75 A5,5 0 0 1 75,80 L20,80 A5,5 0 0 1 15,75 L15,45 A5,5 0 0 1 20,40 Z" />
            <path d="M25,25 L70,25 A5,5 0 0 1 75,30" strokeDasharray="3 3" />
            <path d="M30,52 L65,52 M30,62 L60,62" strokeLinecap="round" />
          </svg>
        );
      case 'requests':
        return (
          <svg className="w-40 h-40 text-white" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M25,25 H60 L75,40 V75 A5,5 0 0 1 70,80 H25 A5,5 0 0 1 20,75 V30 A5,5 0 0 1 25,25 Z" />
            <path d="M60,25 V40 H75" />
            <circle cx="48" cy="55" r="12" strokeWidth="1.5" />
            <path d="M43,55 L47,59 L54,51" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`bg-gradient-to-r ${gradientClass} rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-blue-500/5 border border-white/10`}>
      {/* Background Radial overlay for premium glassmorphism */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)]" />
      
      {/* Right side illustration wrapper */}
      <div className="absolute right-6 bottom-0 top-0 w-1/3 opacity-15 hidden lg:flex items-center justify-center select-none pointer-events-none">
        {getIllustration()}
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full gap-6">
        <div className="space-y-4.5">
          {extraHeader && (
            <div className="flex items-center gap-2">
              {extraHeader}
            </div>
          )}
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-md border border-white/10 text-white shadow-inner shrink-0 hidden sm:block">
              <Icon className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight flex items-center gap-2.5">
                {title}
              </h2>
              {metadata && (
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-blue-100 font-semibold text-xs mt-1">
                  {metadata}
                </div>
              )}
            </div>
          </div>
          
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed mt-2.5">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
