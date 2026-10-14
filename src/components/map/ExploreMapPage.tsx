import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Map as MapIcon, 
  List, 
  X, 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  ArrowRight,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { CivicReport, IssueCategory, ReportStatus, SeverityLevel } from '../../types';
import { ISSUE_CATEGORIES, SEVERITY_LEVELS, REPORT_STATUSES } from '../../constants/config';
import { CivicMap } from './CivicMap';

interface ExploreMapPageProps {
  reports: CivicReport[];
  onSelectReport: (report: CivicReport) => void;
  onNavigateToReport: (reportId: string) => void;
}

export const ExploreMapPage: React.FC<ExploreMapPageProps> = ({
  reports,
  onSelectReport,
  onNavigateToReport
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'map' | 'split'>('map');
  const [activeReport, setActiveReport] = useState<CivicReport | null>(null);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // Search matches title, location, description, or id
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = report.title.toLowerCase().includes(query);
        const matchesLocation = report.locationName.toLowerCase().includes(query);
        const matchesDesc = report.description.toLowerCase().includes(query);
        const matchesId = report.id.toLowerCase().includes(query);
        if (!matchesTitle && !matchesLocation && !matchesDesc && !matchesId) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && report.category !== selectedCategory) {
        return false;
      }

      // Severity filter
      if (selectedSeverity !== 'all' && report.severity !== selectedSeverity) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && report.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [reports, searchQuery, selectedCategory, selectedSeverity, selectedStatus]);

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || selectedSeverity !== 'all' || selectedStatus !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSeverity('all');
    setSelectedStatus('all');
  };

  const handleMarkerOrCardClick = (report: CivicReport) => {
    setActiveReport(report);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      
      {/* Title & Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Civic Infrastructure Map
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Displaying <strong className="text-slate-800">{filteredReports.length}</strong> of {reports.length} geo-tagged public infrastructure reports
          </p>
        </div>

        {/* View Mode Toggle: Map vs Split List */}
        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-100 rounded-lg flex items-center border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Full Map</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Map & List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by street, neighbourhood, or issue keyword..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {Object.entries(ISSUE_CATEGORIES).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.name}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {Object.entries(REPORT_STATUSES).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Filter Summary & Reset Button */}
        <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Showing {filteredReports.length} results</span>
            {hasActiveFilters && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-teal-700 font-medium">Filters Applied</span>
              </>
            )}
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Map View Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Map Canvas */}
        <div className={`${viewMode === 'split' ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all duration-200`}>
          <div className="relative">
            <CivicMap
              reports={filteredReports}
              selectedReportId={activeReport?.id}
              onSelectReport={handleMarkerOrCardClick}
              height={viewMode === 'split' ? '680px' : '650px'}
            />

            {/* Map Pin Legend Overlay */}
            <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-md max-w-xs hidden sm:block">
              <div className="text-[11px] font-bold text-slate-800 mb-2 uppercase tracking-wider">
                Severity Pin Legend
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-600 border border-red-700 inline-block"></span>
                  <span className="font-medium text-slate-700">Critical</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-orange-600 border border-orange-700 inline-block"></span>
                  <span className="font-medium text-slate-700">High</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-600 inline-block"></span>
                  <span className="font-medium text-slate-700">Medium</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600 inline-block"></span>
                  <span className="font-medium text-slate-700">Low</span>
                </div>
              </div>
            </div>

            {/* Empty State when zero reports match filter */}
            {filteredReports.length === 0 && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/85 backdrop-blur-xs p-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg text-center max-w-md">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-3">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">No Matching Reports Found</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    No civic infrastructure incidents match your search query and active filters. Try broadening your criteria.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel or Split View List */}
        {viewMode === 'split' ? (
          <div className="lg:col-span-5 h-[680px] flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Reports List ({filteredReports.length})
              </span>
              <span className="text-[11px] text-slate-500">
                Click item to inspect
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
              {filteredReports.map((report) => {
                const cat = ISSUE_CATEGORIES[report.category] || ISSUE_CATEGORIES.other;
                const sev = SEVERITY_LEVELS[report.severity] || SEVERITY_LEVELS.medium;
                const stat = REPORT_STATUSES[report.status] || REPORT_STATUSES.reported;
                const isSelected = activeReport?.id === report.id;

                return (
                  <div
                    key={report.id}
                    onClick={() => handleMarkerOrCardClick(report)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex gap-3 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <img
                      src={report.imageUrl}
                      alt={report.title}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0 bg-slate-100"
                      loading="lazy"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                        <span className="font-semibold text-slate-700">{cat.name}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-bold uppercase text-[10px]" style={{ color: sev.color }}>
                          {sev.name}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 leading-snug truncate">
                        {report.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        📍 {report.locationName}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="font-semibold" style={{ color: stat.color }}>
                          ● {stat.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToReport(report.id);
                          }}
                          className="text-teal-700 hover:text-teal-800 font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Floating / Bottom Inspector card when marker is clicked in full map view */
          activeReport && (
            <div className="lg:col-span-12 bg-white rounded-xl border border-slate-200 p-4 shadow-lg flex flex-col md:flex-row gap-5 items-start">
              <img
                src={activeReport.imageUrl}
                alt={activeReport.title}
                className="w-full md:w-56 h-40 rounded-lg object-cover bg-slate-100"
              />

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-semibold text-slate-800">{activeReport.id}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-700">
                      {ISSUE_CATEGORIES[activeReport.category]?.name}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Observed: {activeReport.dateObserved}</span>
                  </div>
                  <button
                    onClick={() => setActiveReport(null)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {activeReport.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {activeReport.description}
                </p>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Concerned Authority:</span>
                    <span className="font-mono text-teal-700 font-bold">Ticket #{activeReport.dispatchTicketNumber || `MUNI-${activeReport.id.replace('LF-', '')}`}</span>
                  </div>
                  <div className="font-bold text-slate-800 text-[11px]">
                    🏢 {activeReport.concernedDepartment || ISSUE_CATEGORIES[activeReport.category]?.concernedDepartment}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                  <span className="text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activeReport.locationName}</span>
                  </span>
                  <span className="font-semibold" style={{ color: REPORT_STATUSES[activeReport.status]?.color }}>
                    ● Status: {REPORT_STATUSES[activeReport.status]?.name}
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    onClick={() => onNavigateToReport(activeReport.id)}
                    className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-xs"
                  >
                    <span>View Official Complaint Docket</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )
        )}

      </div>

    </div>
  );
};
