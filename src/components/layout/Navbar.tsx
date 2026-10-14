import React, { useState, useRef, useEffect } from 'react';
import { 
  PlusCircle, 
  BarChart3, 
  Map as MapIcon, 
  FileText, 
  Menu, 
  X, 
  ShieldCheck, 
  Info,
  Search,
  CheckCircle2,
  ArrowRight,
  Hash,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  User,
  MapPin,
  Sparkles
} from 'lucide-react';
import { CitizenUser } from '../../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, reportId?: string) => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onTrackComplaintId?: (id: string) => void;
  currentUser: CitizenUser | null;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isAdmin,
  onToggleAdmin,
  onTrackComplaintId,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [trackInput, setTrackInput] = useState('');
  const [trackError, setTrackError] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  const navItems = [
    { id: 'home', label: 'Home', icon: MapIcon },
    { id: 'map', label: 'Explore Map', icon: MapIcon },
    { id: 'reports', label: 'All Complaints', icon: FileText },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = trackInput.trim().toUpperCase();
    if (!clean) {
      setTrackError('Please enter your Complaint ID (e.g. LF-2026-0101)');
      return;
    }
    if (onTrackComplaintId) {
      onTrackComplaintId(clean);
    } else {
      onNavigate('report-detail', clean);
    }
    setTrackModalOpen(false);
    setTrackInput('');
    setTrackError('');
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Let'sFix Logo & Tagline */}
            <div 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
            >
              {/* Geometric Brand Emblem */}
              <div className="w-10 h-10 rounded-xl bg-slate-900 group-hover:bg-slate-800 transition-all shadow-md flex items-center justify-center p-2 relative overflow-hidden">
                <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
                  <circle cx="16" cy="16" r="14" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
                  <path 
                    d="M16 3C10.477 3 6 7.477 6 13C6 20.5 16 29 16 29C16 29 26 20.5 26 13C26 7.477 21.523 3 16 3Z" 
                    fill="url(#pinGrad)" 
                  />
                  <path 
                    d="M12 13.5L14.5 16L20 10.5" 
                    stroke="#ffffff" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  <defs>
                    <linearGradient id="pinGrad" x1="6" y1="3" x2="26" y2="29" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#0d9488" />
                      <stop offset="1" stopColor="#0284c7" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Wordmark with "Identify. Report.Improve" */}
              <div className="flex flex-col">
                <div className="flex items-baseline font-black tracking-tight text-2xl leading-none">
                  <span className="text-slate-900">Let's</span>
                  <span className="text-teal-600">Fix</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 ml-0.5"></span>
                </div>
                <span className="text-[10px] font-bold text-teal-600 tracking-wide mt-0.5 flex items-center gap-0.5">
                  Identify. Report.Improve
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      isActive
                        ? 'border-teal-600 text-slate-900 font-bold'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Area - Desktop & Laptop */}
            <div className="hidden md:flex items-center gap-2 lg:gap-2.5">
              
              {/* Track Complaint Button */}
              <button
                onClick={() => setTrackModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                title="Track real-time status of your complaint with Complaint ID"
              >
                <Search className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden xl:inline">Track</span>
                <span className="xl:hidden">Track</span>
                <span className="hidden xl:inline">Complaint</span>
              </button>

              {/* AUTH STATE: LOGGED OUT vs LOGGED IN */}
              {!currentUser ? (
                /* When NOT logged in: Show Login & Sign Up buttons */
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 bg-white"
                  >
                    <LogIn className="w-3.5 h-3.5 text-teal-600" />
                    <span>Login</span>
                  </button>

                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer shadow-2xs"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-teal-700" />
                    <span>SignUp</span>
                  </button>
                </div>
              ) : (
                /* When LOGGED IN: Changes occur - show Citizen Profile Control */
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-teal-200 bg-teal-50/80 hover:bg-teal-100/80 text-slate-900 transition-colors cursor-pointer shadow-2xs"
                    title={`Signed in as ${currentUser.name}`}
                  >
                    {currentUser.avatar ? (
                      <img 
                        src={currentUser.avatar} 
                        alt={currentUser.name} 
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-teal-500" 
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-900 leading-none truncate max-w-[100px]">
                        {currentUser.name.split(' ')[0]}
                      </span>
                      <span className="text-[9px] text-teal-700 font-semibold leading-tight mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                        Citizen
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* Citizen Profile Dropdown */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          {currentUser.avatar ? (
                            <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-teal-500" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                              {currentUser.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                          <span className="truncate">{currentUser.ward || 'Registered Citizen'}</span>
                        </div>
                      </div>

                      <div className="py-1 text-xs">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleNavClick('reports');
                          }}
                          className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-600" />
                          <span>View All Complaints</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleNavClick('report-issue');
                          }}
                          className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-teal-600" />
                          <span>File New Complaint</span>
                        </button>
                      </div>

                      <div className="pt-1 border-t border-slate-100 px-2">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Municipal Officer Portal Toggle */}
              <button
                onClick={() => {
                  if (!isAdmin) {
                    onToggleAdmin();
                  } else {
                    handleNavClick('admin');
                  }
                }}
                title={isAdmin ? "Logged in as Municipal Officer (Click to open Admin Panel)" : "Log in as Municipal Officer"}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  isAdmin
                    ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{isAdmin ? 'Officer Mode' : 'Officer Login'}</span>
              </button>

              {/* Prominent File a Complaint Button */}
              <button
                onClick={() => handleNavClick('report-issue')}
                className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>File Complaint</span>
              </button>
            </div>

            {/* Mobile Header Actions */}
            <div className="flex md:hidden items-center gap-1.5">
              {/* Track Complaint Quick Button */}
              <button
                onClick={() => setTrackModalOpen(true)}
                className="p-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs"
                title="Track Complaint by ID"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Mobile Auth Button (When logged out) */}
              {!currentUser ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="px-2 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="px-2 py-1 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg"
                  >
                    SignUp
                  </button>
                </div>
              ) : (
                /* Mobile User Avatar (When logged in) */
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="flex items-center gap-1 p-1 rounded-lg border border-teal-200 bg-teal-50"
                  title={currentUser.name}
                >
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-6 h-6 rounded-full object-cover ring-1 ring-teal-500" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </button>
              )}

              {/* Fast Report Button */}
              <button
                onClick={() => handleNavClick('report-issue')}
                className="bg-teal-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Report</span>
              </button>

              {/* Mobile Hamburger Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
            
            {/* Tagline display in mobile drawer */}
            <div className="px-2 py-1 flex items-center justify-between text-xs border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-teal-600">
                Identify. Report.Improve
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Civic Portal
              </span>
            </div>

            {/* Mobile Auth Section */}
            {!currentUser ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <p className="text-[11px] font-semibold text-slate-600">
                  Citizen Account Access:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('login');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-50"
                  >
                    <LogIn className="w-3.5 h-3.5 text-teal-600" />
                    <span>Login</span>
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('signup');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-teal-900 bg-teal-100 hover:bg-teal-200 border border-teal-300 rounded-lg shadow-2xs"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-teal-700" />
                    <span>SignUp</span>
                  </button>
                </div>
              </div>
            ) : (
              /* When logged in: Profile Banner with Sign Out */
              <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-xl space-y-2.5">
                <div className="flex items-center gap-3">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <p className="text-[10px] text-teal-700 font-medium truncate mt-0.5">
                      {currentUser.ward || 'Citizen Contributor'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-teal-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Citizen Session</span>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1 bg-white border border-rose-200 rounded-md"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}

            {/* Track Complaint Link */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setTrackModalOpen(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-teal-800 bg-teal-50 mb-2 border border-teal-200"
            >
              <Search className="w-4 h-4 text-teal-600" />
              <span>Track Complaint Status by ID</span>
            </button>

            {/* Navigation Items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            {/* Municipal Officer Portal Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  if (!isAdmin) {
                    onToggleAdmin();
                  } else {
                    handleNavClick('admin');
                  }
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>{isAdmin ? 'Officer Mode (Active)' : 'Municipal Officer Access'}</span>
                </span>
                {isAdmin && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Track Complaint Modal */}
      {trackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Track Complaint Status
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Get real-time updates on your registered civic complaint
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTrackModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTrackSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Enter Your Complaint ID or Ticket Number:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={trackInput}
                    onChange={(e) => {
                      setTrackInput(e.target.value);
                      setTrackError('');
                    }}
                    placeholder="e.g. LF-2026-0101 or LF-2026-XXXX"
                    className="w-full py-2.5 pl-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase tracking-wider"
                    autoFocus
                  />
                  <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                </div>
                {trackError && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{trackError}</p>
                )}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                <span className="font-semibold text-slate-800">Quick Demo Test IDs:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['LF-2026-0101', 'LF-2026-0102', 'LF-2026-0104'].map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTrackInput(id)}
                      className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono hover:bg-teal-50 hover:border-teal-400 hover:text-teal-800 cursor-pointer"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTrackModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Fetch Official Docket</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
