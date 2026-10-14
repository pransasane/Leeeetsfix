import React, { useState, useMemo } from 'react';
import { 
  Search, 
  RotateCcw, 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { CivicReport, IssueCategory, ReportStatus, SeverityLevel, CitizenUser } from '../../types';
import { ISSUE_CATEGORIES, SEVERITY_LEVELS, REPORT_STATUSES } from '../../constants/config';

interface AllReportsPageProps {
  reports: CivicReport[];
  onSelectReport: (report: CivicReport) => void;
  onNavigateToReport: (reportId: string) => void;
  onNavigateToNewReport: () => void;
  currentUser?: CitizenUser | null;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
}

export const AllReportsPage: React.FC<AllReportsPageProps> = ({
  reports,
  onSelectReport,
  onNavigateToReport,
  onNavigateToNewReport,
  currentUser,
  onOpenAuth
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'severity' | 'title'>('newest');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [filterOnlyMine, setFilterOnlyMine] = useState(false);

  const myReportsCount = useMemo(() => {
    if (!currentUser) return 0;
    const nameLower = currentUser.name.toLowerCase();
    return reports.filter(r => r.reporterName && r.reporterName.toLowerCase().includes(nameLower)).length;
  }, [reports, currentUser]);

  const filteredAndSortedReports = useMemo(() => {
    let result = reports.filter((report) => {
      // Filter only current user's reports if toggled
      if (filterOnlyMine && currentUser) {
        const nameLower = currentUser.name.toLowerCase();
        if (!report.reporterName || !report.reporterName.toLowerCase().includes(nameLower)) {
          return false;
        }
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = report.title.toLowerCase().includes(q);
        const matchesLocation = report.locationName.toLowerCase().includes(q);
        const matchesDesc = report.description.toLowerCase().includes(q);
        const matchesId = report.id.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLocation && !matchesDesc && !matchesId) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'all' && report.category !== selectedCategory) {
        return false;
      }

      // Severity
      if (selectedSeverity !== 'all' && report.severity !== selectedSeverity) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all' && report.status !== selectedStatus) {
        return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'severity') {
        const sevOrder: Record<SeverityLevel, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        return sevOrder[b.severity] - sevOrder[a.severity];
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [reports, searchQuery, selectedCategory, selectedSeverity, selectedStatus, sortBy]);

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || selectedSeverity !== 'all' || selectedStatus !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSeverity('all');
    setSelectedStatus('all');
    setSortBy('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Civic Infrastructure Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Auditable index of verified public safety reports, repair logs, and ongoing civic complaints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToNewReport}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            + Report New Issue
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        
        {/* User Specific Tabs / Notice */}
        {currentUser ? (
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterOnlyMine(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  !filterOnlyMine 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Civic Complaints ({reports.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterOnlyMine(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterOnlyMine 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
                }`}
              >
                <span>My Filed Complaints</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterOnlyMine ? 'bg-teal-700 text-white' : 'bg-teal-200 text-teal-900'}`}>
                  {myReportsCount}
                </span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Signed in as <strong className="text-slate-800">{currentUser.name}</strong></span>
            </div>
          </div>
        ) : onOpenAuth ? (
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs flex-wrap gap-2">
            <span className="text-slate-600">
              Viewing all community complaints. Want to track your personal complaints in one place?
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
              >
                Login
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </div>
        ) : null}

        {/* Top filter row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          
          {/* Search box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or locations..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(ISSUE_CATEGORIES).map(([key, info]) => (
                <option key={key} value={key}>{info.name}</option>
              ))}
            </select>
          </div>

          {/* Severity filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Statuses</option>
              {Object.entries(REPORT_STATUSES).map(([key, info]) => (
                <option key={key} value={key}>{info.name}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="severity">Sort: By Severity</option>
              <option value="title">Sort: Title (A-Z)</option>
            </select>
          </div>

        </div>

        {/* View Switcher and Active Filter Summary */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3 text-slate-500">
            <span>
              Showing <strong className="text-slate-800 font-bold">{filteredAndSortedReports.length}</strong> reports
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setLayoutMode('grid')}
              title="Grid View"
              className={`p-1.5 rounded cursor-pointer transition-colors ${
                layoutMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('list')}
              title="List View"
              className={`p-1.5 rounded cursor-pointer transition-colors ${
                layoutMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Reports Display: Grid or List */}
      {filteredAndSortedReports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No Matching Reports</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            There are currently no reports that meet the active search and filter constraints.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : layoutMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedReports.map((report) => {
            const cat = ISSUE_CATEGORIES[report.category] || ISSUE_CATEGORIES.other;
            const sev = SEVERITY_LEVELS[report.severity] || SEVERITY_LEVELS.medium;
            const stat = REPORT_STATUSES[report.status] || REPORT_STATUSES.reported;

            return (
              <div
                key={report.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={report.imageUrl}
                      alt={report.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded font-bold border border-slate-700">
                      ID: {report.complaintId || report.id}
                    </div>
                    {report.isSample && (
                      <div className="absolute top-3 right-3 bg-amber-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                        Demo
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3">
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded text-white shadow-xs uppercase tracking-wider"
                        style={{ backgroundColor: sev.color }}
                      >
                        {sev.name} Severity
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    {/* Unboxed metadata line */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                      <span className="font-semibold text-slate-800">{cat.name}</span>
                      <span aria-hidden="true">·</span>
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
                      {report.title}
                    </h3>

                    {/* Department badge */}
                    <div className="mt-2 text-[11px] text-teal-800 bg-teal-50/80 border border-teal-200/80 px-2 py-1 rounded truncate">
                      🏢 <strong>Routed to:</strong> {report.concernedDepartment ? report.concernedDepartment.split('(')[0] : cat.concernedDepartment.split('(')[0]}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                      {report.description}
                    </p>

                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{report.locationName}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold flex items-center gap-1.5" style={{ color: stat.color }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }}></span>
                    <span>{stat.name}</span>
                  </span>

                  <button
                    onClick={() => onNavigateToReport(report.id)}
                    className="inline-flex items-center gap-1 font-bold text-teal-700 hover:text-teal-800 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {filteredAndSortedReports.map((report) => {
            const cat = ISSUE_CATEGORIES[report.category] || ISSUE_CATEGORIES.other;
            const sev = SEVERITY_LEVELS[report.severity] || SEVERITY_LEVELS.medium;
            const stat = REPORT_STATUSES[report.status] || REPORT_STATUSES.reported;

            return (
              <div
                key={report.id}
                className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <img
                    src={report.imageUrl}
                    alt={report.title}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0 bg-slate-100"
                    loading="lazy"
                  />

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-semibold text-slate-800">{report.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-slate-700">{cat.name}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-bold text-[10px] uppercase" style={{ color: sev.color }}>
                        {sev.name}
                      </span>
                      {report.isSample && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[10px] text-amber-600 font-semibold">Demo Record</span>
                        </>
                      )}
                    </div>

                    <h3 
                      onClick={() => onNavigateToReport(report.id)}
                      className="font-bold text-sm text-slate-900 hover:text-teal-700 cursor-pointer transition-colors"
                    >
                      {report.title}
                    </h3>

                    <p className="text-xs text-slate-500 truncate">
                      📍 {report.locationName}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <span className="font-semibold text-xs" style={{ color: stat.color }}>
                    ● {stat.name}
                  </span>
                  <button
                    onClick={() => onNavigateToReport(report.id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 text-slate-800 hover:text-teal-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
