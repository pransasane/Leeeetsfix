import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Copy, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  RefreshCw, 
  Lock, 
  LogOut, 
  Layers, 
  Eye, 
  Plus, 
  X,
  FileCheck
} from 'lucide-react';
import { CivicReport, IssueCategory, ReportStatus, SeverityLevel } from '../../types';
import { ISSUE_CATEGORIES, SEVERITY_LEVELS, REPORT_STATUSES } from '../../constants/config';

interface AdminDashboardProps {
  reports: CivicReport[];
  isAdmin: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onUpdateReport: (id: string, updates: Partial<CivicReport>) => void;
  onUpdateReportStatus: (id: string, status: ReportStatus, notes: string, changedBy: string) => void;
  onDeleteReport: (id: string) => void;
  onNavigateToReport: (reportId: string) => void;
  onResetDemoData: () => void;
  onExportData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  reports,
  isAdmin,
  onLogin,
  onLogout,
  onUpdateReport,
  onUpdateReportStatus,
  onDeleteReport,
  onNavigateToReport,
  onResetDemoData,
  onExportData
}) => {
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Table search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<IssueCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | 'all'>('all');
  
  // Active Edit Modal
  const [editingReport, setEditingReport] = useState<CivicReport | null>(null);
  const [editCategory, setEditCategory] = useState<IssueCategory>('roads_potholes');
  const [editSeverity, setEditSeverity] = useState<SeverityLevel>('medium');
  const [editStatus, setEditStatus] = useState<ReportStatus>('reported');
  const [editDescription, setEditDescription] = useState('');
  const [editVerificationNotes, setEditVerificationNotes] = useState('');
  const [editResolutionNotes, setEditResolutionNotes] = useState('');
  const [editStatusNote, setEditStatusNote] = useState('');
  const [officerName, setOfficerName] = useState('Officer J. Vance (Public Works)');

  // Duplicate Finder State
  const [showDuplicateFinder, setShowDuplicateFinder] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default acceptable demo passcode or quick login
    if (passcode === 'admin123' || passcode === 'letfix2026' || passcode === 'civic') {
      onLogin();
      setAuthError('');
    } else {
      setAuthError('Invalid municipal authentication passcode. Use "admin123" for demo officer access.');
    }
  };

  const handleOpenEdit = (report: CivicReport) => {
    setEditingReport(report);
    setEditCategory(report.category);
    setEditSeverity(report.severity);
    setEditStatus(report.status);
    setEditDescription(report.description);
    setEditVerificationNotes(report.verificationNotes || '');
    setEditResolutionNotes(report.resolutionNotes || '');
    setEditStatusNote('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;

    // Check if status changed
    const statusChanged = editStatus !== editingReport.status;

    // Update details
    onUpdateReport(editingReport.id, {
      category: editCategory,
      severity: editSeverity,
      description: editDescription,
      verificationNotes: editVerificationNotes,
      resolutionNotes: editResolutionNotes
    });

    // If status changed or status note provided, record status transition
    if (statusChanged || editStatusNote.trim()) {
      onUpdateReportStatus(
        editingReport.id,
        editStatus,
        editStatusNote.trim() || `Administrative modification by ${officerName}. Status: ${editStatus}`,
        officerName
      );
    }

    setEditingReport(null);
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchLoc = r.locationName.toLowerCase().includes(q);
      const matchId = r.id.toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchId) return false;
    }
    if (filterCategory !== 'all' && r.category !== filterCategory) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterSeverity !== 'all' && r.severity !== filterSeverity) return false;
    return true;
  });

  // Duplicate analysis (reports within ~200m or identical address)
  const potentialDuplicates = reports.filter((r, i) => {
    return reports.some((other, j) => {
      if (i === j) return false;
      const sameCategory = r.category === other.category;
      const latDiff = Math.abs(r.latitude - other.latitude);
      const lngDiff = Math.abs(r.longitude - other.longitude);
      const isGeographicallyClose = latDiff < 0.002 && lngDiff < 0.002;
      return sameCategory && isGeographicallyClose;
    });
  });

  // If not logged in as Admin, show login screen
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 mx-auto flex items-center justify-center border border-purple-200 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Municipal Officer Login
            </h1>
            <p className="text-xs text-slate-500">
              Restricted portal for municipal staff, ward inspectors, and public works dispatchers.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {authError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authorization Passcode:
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter officer key (e.g. admin123)"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Authenticate & Unlock Officer Tools
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => onLogin()}
              className="text-xs text-purple-700 hover:text-purple-800 font-semibold cursor-pointer underline"
            >
              Demo Quick-Access (One-Click Sign In)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Municipal Operations & Triage Console
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authenticated as Municipal Operations Officer · Public Works Bureau
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDuplicateFinder(!showDuplicateFinder)}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Duplicate Audit ({potentialDuplicates.length})</span>
          </button>

          <button
            onClick={onExportData}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Duplicate Finder Alert Banner */}
      {showDuplicateFinder && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Potential Geographic Proximity Duplicates ({potentialDuplicates.length} reports)</span>
            </div>
            <button
              onClick={() => setShowDuplicateFinder(false)}
              className="text-amber-700 hover:text-amber-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-amber-800 leading-normal">
            These reports share identical infrastructure categories within 200m radius of each other. Verify if they represent the same defect to merge or prune duplicates:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {potentialDuplicates.map((dup) => (
              <span 
                key={dup.id} 
                onClick={() => onNavigateToReport(dup.id)}
                className="bg-white border border-amber-300 text-amber-900 text-xs px-2.5 py-1 rounded cursor-pointer hover:bg-amber-100 font-mono"
              >
                {dup.id} · {dup.title.slice(0, 30)}...
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report ID, title, address..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Categories</option>
            {Object.entries(ISSUE_CATEGORIES).map(([key, info]) => (
              <option key={key} value={key}>{info.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Statuses</option>
            {Object.entries(REPORT_STATUSES).map(([key, info]) => (
              <option key={key} value={key}>{info.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as any)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Main Admin Reports Management Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Title & Location</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map((report) => {
                const cat = ISSUE_CATEGORIES[report.category] || ISSUE_CATEGORIES.other;
                const sev = SEVERITY_LEVELS[report.severity] || SEVERITY_LEVELS.medium;
                const stat = REPORT_STATUSES[report.status] || REPORT_STATUSES.reported;

                return (
                  <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* ID */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {report.id}
                      {report.isSample && (
                        <span className="block text-[10px] text-amber-600 font-sans font-normal">
                          Demo
                        </span>
                      )}
                    </td>

                    {/* Title & Location */}
                    <td className="py-3 px-4 min-w-[200px]">
                      <div className="font-bold text-slate-900 line-clamp-1">{report.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">📍 {report.locationName}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-700">
                      {cat.name}
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded text-white uppercase"
                        style={{ backgroundColor: sev.color }}
                      >
                        {sev.name}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-xs" style={{ color: stat.color }}>
                        ● {stat.name}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {report.dateObserved}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigateToReport(report.id)}
                          title="View Public Report"
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(report)}
                          title="Edit Details & Status"
                          className="p-1.5 text-purple-600 hover:text-purple-800 rounded hover:bg-purple-50"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete report ${report.id}?`)) {
                              onDeleteReport(report.id);
                            }
                          }}
                          title="Delete Report"
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500">
            No reports match the current admin search criteria.
          </div>
        )}
      </div>

      {/* Report Editing & Triage Modal */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs text-purple-700 font-bold">{editingReport.id}</span>
                <h3 className="font-bold text-slate-900 text-lg">
                  Edit & Triage Civic Report
                </h3>
              </div>
              <button
                onClick={() => setEditingReport(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category:
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as IssueCategory)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    {Object.entries(ISSUE_CATEGORIES).map(([key, info]) => (
                      <option key={key} value={key}>{info.name}</option>
                    ))}
                  </select>
                </div>

                {/* Severity */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Severity Level:
                  </label>
                  <select
                    value={editSeverity}
                    onChange={(e) => setEditSeverity(e.target.value as SeverityLevel)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Status Update */}
              <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-purple-900 uppercase tracking-wider text-[11px]">
                    Reporting & Work Order Status
                  </label>
                  <span className="text-slate-500 font-medium text-[11px]">
                    Current: {REPORT_STATUSES[editingReport.status]?.name}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      New Status:
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as ReportStatus)}
                      className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg font-semibold text-slate-900"
                    >
                      {Object.entries(REPORT_STATUSES).map(([key, info]) => (
                        <option key={key} value={key}>{info.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Officer Signature / Title:
                    </label>
                    <input
                      type="text"
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Status Transition Reason / Action Logged:
                  </label>
                  <input
                    type="text"
                    value={editStatusNote}
                    onChange={(e) => setEditStatusNote(e.target.value)}
                    placeholder="e.g. Work crew dispatched with asphalt compactor."
                    className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Report Description:
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              {/* Verification Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Field Verification Notes (Inspector findings):
                </label>
                <textarea
                  rows={2}
                  value={editVerificationNotes}
                  onChange={(e) => setEditVerificationNotes(e.target.value)}
                  placeholder="e.g. Depth verified at 12cm. Barricades placed."
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              {/* Resolution Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Resolution Notes (When repair is concluded):
                </label>
                <textarea
                  rows={2}
                  value={editResolutionNotes}
                  onChange={(e) => setEditResolutionNotes(e.target.value)}
                  placeholder="e.g. Bituminous asphalt laid, rolled, and site inspected by supervisor."
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Save Changes & Record Log
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
