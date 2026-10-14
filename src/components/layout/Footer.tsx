import React from 'react';
import { MapPin, ShieldCheck, Database, RefreshCw, ExternalLink, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onResetDemo: () => void;
  isAdmin: boolean;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onResetDemo,
  isAdmin,
  onOpenAdmin
}) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center p-1.5">
                <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
                  <path d="M16 3C10.477 3 6 7.477 6 13C6 20.5 16 29 16 29C16 29 26 20.5 26 13C26 7.477 21.523 3 16 3Z" fill="#14b8a6" />
                  <path d="M12 13.5L14.5 16L20 10.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Let's<span className="text-teal-400">Fix</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering citizens to identify, document, map, and monitor civic infrastructure problems in their neighbourhoods through transparent, location-based reporting.
            </p>
            <div className="pt-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-400">Tagline:</span> Identify. Report. Improve.
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('map')} className="hover:text-white transition-colors">
                  Interactive Spatial Map
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('reports')} className="hover:text-white transition-colors">
                  All Civic Reports
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('report-issue')} className="hover:text-white transition-colors text-teal-400 font-medium">
                  + Submit New Issue
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors">
                  Analytics & Trends
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  About & Methodology
                </button>
              </li>
            </ul>
          </div>

          {/* Civic Infrastructure Focus */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Civic Infrastructure
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Roads, Asphalt Cracks & Potholes</li>
              <li>Footpaths & Pedestrian Access</li>
              <li>Streetlights & Night Safety</li>
              <li>Water Main Leakages & Supply</li>
              <li>Stormwater Drainage & Manholes</li>
              <li>Waste Management & Dumping</li>
            </ul>
          </div>

          {/* Data Transparency & Demo Controls */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Governance & Data
            </h4>
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-teal-300 font-medium">
                <Database className="w-3.5 h-3.5" />
                <span>Transparent Public Ledger</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                All coordinates, photographs, and status logs are publicly auditable. Includes realistic demonstration records.
              </p>
              <div className="pt-2 flex flex-col gap-1.5">
                <button
                  onClick={onResetDemo}
                  className="inline-flex items-center justify-center gap-1.5 w-full px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[11px] font-medium transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Sample Reports</span>
                </button>
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center justify-center gap-1.5 w-full px-2.5 py-1.5 bg-purple-900/40 hover:bg-purple-900/60 text-purple-200 border border-purple-800/60 rounded text-[11px] font-medium transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3 text-purple-400" />
                  <span>{isAdmin ? 'Admin Console' : 'Municipal Officer Login'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Let'sFix Civic-Tech Initiative. Open community infrastructure reporting.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer" onClick={() => onNavigate('about')}>Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer" onClick={() => onNavigate('about')}>Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer" onClick={() => onNavigate('about')}>Civic API Specs</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
