import React from 'react';
import { 
  MapPin, 
  PlusCircle, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Footprints, 
  Lightbulb, 
  Droplets, 
  GitFork, 
  Trash2, 
  Building2,
  Camera,
  FileCheck2,
  Navigation2,
  Search
} from 'lucide-react';
import { CivicReport, IssueCategory } from '../../types';
import { ISSUE_CATEGORIES, SEVERITY_LEVELS, REPORT_STATUSES } from '../../constants/config';
import { CivicMap } from '../map/CivicMap';

interface HomePageProps {
  reports: CivicReport[];
  onNavigate: (view: string, reportId?: string) => void;
  onSelectReport: (report: CivicReport) => void;
  onTrackComplaintId?: (id: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  reports,
  onNavigate,
  onSelectReport,
  onTrackComplaintId
}) => {
  // Compute dynamic statistics from actual report records
  const totalReported = reports.length;
  const highAndCritical = reports.filter(r => r.severity === 'high' || r.severity === 'critical').length;
  const underReview = reports.filter(r => r.status === 'reported' || r.status === 'under_verification').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  const recentReports = reports.slice(0, 4);

  const categoryCards: Array<{
    id: IssueCategory;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
    desc: string;
  }> = [
    {
      id: 'roads_potholes',
      name: 'Roads & Potholes',
      icon: AlertTriangle,
      count: reports.filter(r => r.category === 'roads_potholes').length,
      desc: 'Crater potholes, asphalt subsidence, eroded surfacing'
    },
    {
      id: 'footpaths',
      name: 'Footpaths & Safety',
      icon: Footprints,
      count: reports.filter(r => r.category === 'footpaths').length,
      desc: 'Broken slabs, root heave, missing wheelchair kerb ramps'
    },
    {
      id: 'streetlights',
      name: 'Streetlights',
      icon: Lightbulb,
      count: reports.filter(r => r.category === 'streetlights').length,
      desc: 'Outages, damaged poles, exposed wires, dark intersections'
    },
    {
      id: 'water_leakage',
      name: 'Water Leakage',
      icon: Droplets,
      count: reports.filter(r => r.category === 'water_leakage').length,
      desc: 'Potable supply line fractures, pooling, pressure loss'
    },
    {
      id: 'drainage',
      name: 'Drainage & Sewage',
      icon: GitFork,
      count: reports.filter(r => r.category === 'drainage').length,
      desc: 'Blocked stormwater inlets, displaced manholes, overflowing gutters'
    },
    {
      id: 'garbage',
      name: 'Garbage & Waste',
      icon: Trash2,
      count: reports.filter(r => r.category === 'garbage').length,
      desc: 'Overflowing dumpsters, roadside debris, hazardous dumping'
    },
    {
      id: 'other',
      name: 'Other Infrastructure',
      icon: Building2,
      count: reports.filter(r => r.category === 'other').length,
      desc: 'Guardrail impacts, broken signage, structural road hazards'
    }
  ];

  return (
    <div className="space-y-16 py-8">
      
      {/* HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            <span>Civic Infrastructure Transparency Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            Let's Fix What's Broken.
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Discover civic infrastructure problems, explore your neighbourhood, and help build safer, cleaner, better-connected communities.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('map')}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <Navigation2 className="w-5 h-5 text-teal-400" />
              <span>Explore the Map</span>
            </button>

            <button
              onClick={() => onNavigate('report-issue')}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Report an Issue</span>
            </button>
          </div>

          {/* Quick Track Complaint Bar */}
          <div className="pt-2 max-w-lg mx-auto">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem('homeComplaintInput') as HTMLInputElement;
                if (input && input.value.trim()) {
                  if (onTrackComplaintId) {
                    onTrackComplaintId(input.value.trim().toUpperCase());
                  } else {
                    onNavigate('report-detail', input.value.trim().toUpperCase());
                  }
                }
              }}
              className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500 transition-all"
            >
              <div className="pl-2 text-slate-400">
                <Search className="w-4 h-4 text-teal-600" />
              </div>
              <input
                type="text"
                name="homeComplaintInput"
                placeholder="Track Complaint: Enter ID (e.g. LF-2026-0101)..."
                className="flex-1 py-1 px-1 bg-transparent text-xs font-mono font-bold text-slate-900 focus:outline-none uppercase placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer flex-shrink-0"
              >
                Track Status
              </button>
            </form>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Forwarded to Concerned Authority
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-blue-600" /> Verified Evidence
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-600" /> SLA Response Guarantee
            </span>
          </div>

        </div>

        {/* Hero Interactive Map Preview Box */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-2 sm:p-4 shadow-xl">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>Live Neighbourhood Incident Map</span>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Full Interactive Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <CivicMap
            reports={reports}
            onSelectReport={onSelectReport}
            height="400px"
          />
        </div>
      </section>

      {/* DYNAMIC STATISTICS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-slate-200 pt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Current Infrastructure Status</h2>
              <p className="text-xs text-slate-500">Live dynamic metrics aggregated from active incident database</p>
            </div>
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Stat 1 */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Reports</span>
                <span className="p-2 rounded-lg bg-slate-100 text-slate-700">
                  <MapPin className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {totalReported}
              </div>
              <p className="text-xs text-slate-500 mt-1">Documented across all districts</p>
            </div>

            {/* Stat 2 */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High & Critical</span>
                <span className="p-2 rounded-lg bg-rose-50 text-rose-700">
                  <ShieldAlert className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-rose-700 tracking-tight">
                {highAndCritical}
              </div>
              <p className="text-xs text-slate-500 mt-1">Immediate public safety hazards</p>
            </div>

            {/* Stat 3 */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Under Review</span>
                <span className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-blue-700 tracking-tight">
                {underReview}
              </div>
              <p className="text-xs text-slate-500 mt-1">In triage or field inspection</p>
            </div>

            {/* Stat 4 */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Issues Resolved</span>
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-emerald-700 tracking-tight">
                {resolvedCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">Repairs completed & audited</p>
            </div>

          </div>
        </div>
      </section>

      {/* RECENT REPORTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recent Infrastructure Reports</h2>
            <p className="text-xs text-slate-500 mt-1">Latest photographic submissions from local residents and surveyors</p>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Browse All {reports.length} Reports</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentReports.map((report) => {
            const cat = ISSUE_CATEGORIES[report.category] || ISSUE_CATEGORIES.other;
            const sev = SEVERITY_LEVELS[report.severity] || SEVERITY_LEVELS.medium;
            const stat = REPORT_STATUSES[report.status] || REPORT_STATUSES.reported;

            return (
              <div 
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col group"
              >
                {/* Photo Header */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={report.imageUrl}
                    alt={report.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-mono font-medium px-2 py-0.5 rounded">
                    {report.id}
                  </div>
                  {report.isSample && (
                    <div className="absolute top-2.5 right-2.5 bg-amber-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                      Demo Record
                    </div>
                  )}
                  <div className="absolute bottom-2.5 left-2.5">
                    <span 
                      className="text-[11px] font-bold px-2 py-0.5 rounded text-white shadow-xs uppercase tracking-wider"
                      style={{ backgroundColor: sev.color }}
                    >
                      {sev.name}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Unboxed metadata line with typographic separator */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                      <span className="font-semibold text-slate-700">{cat.name}</span>
                      <span aria-hidden="true">·</span>
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2 group-hover:text-teal-700 transition-colors">
                      {report.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                      {report.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium" style={{ color: stat.color }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }}></span>
                      <span>{stat.name}</span>
                    </span>
                    <span className="font-semibold text-teal-700 group-hover:translate-x-0.5 transition-transform">
                      View →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ISSUE CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-slate-200 pt-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Civic Issue Classifications</h2>
            <p className="text-sm text-slate-500 mt-2">
              Our systematic categorization follows municipal public works and urban safety standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  onClick={() => onNavigate('map')}
                  className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-teal-700 group-hover:bg-teal-50 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {card.count} {card.count === 1 ? 'Report' : 'Reports'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">
                    {card.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW LET'SFIX WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-semibold text-teal-400 tracking-widest uppercase mb-2">
              Civic Action Protocol
            </div>
            <h2 className="text-3xl font-bold tracking-tight">How Let'sFix Works</h2>
            <p className="text-slate-400 text-sm mt-2">
              Four streamlined steps from local observation to accountable municipal resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-teal-400 font-extrabold text-lg flex items-center justify-center shadow-xs">
                1
              </div>
              <h3 className="font-bold text-base text-white">Identify a Civic Problem</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Notice a broken streetlight, dangerous road pothole, damaged sidewalk, or water leakage in your daily walk.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-teal-400 font-extrabold text-lg flex items-center justify-center shadow-xs">
                2
              </div>
              <h3 className="font-bold text-base text-white">Photograph & Document</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Snap clear photographic evidence, assess the severity level, and describe the hazard and suggested solution.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-teal-400 font-extrabold text-lg flex items-center justify-center shadow-xs">
                3
              </div>
              <h3 className="font-bold text-base text-white">Locate on the Map</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pin precise geographic coordinates via your browser's GPS or drop a pin directly onto the interactive map.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-teal-400 font-extrabold text-lg flex items-center justify-center shadow-xs">
                4
              </div>
              <h3 className="font-bold text-base text-white">Track Progress to Fix</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monitor verifiable inspection stages, municipal work orders, field contractor updates, and completion audits.
              </p>
            </div>

          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 text-center">
            <button
              onClick={() => onNavigate('report-issue')}
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all cursor-pointer shadow-md"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Submit a Report in Your Neighbourhood</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
