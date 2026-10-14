import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  ExternalLink, 
  Share2, 
  Printer, 
  Check, 
  Wrench, 
  HelpCircle, 
  Edit3,
  Building2,
  FileCheck2,
  Hash,
  Send
} from 'lucide-react';
import { CivicReport, ReportStatus, StatusHistoryItem } from '../../types';
import { ISSUE_CATEGORIES, SEVERITY_LEVELS, REPORT_STATUSES } from '../../constants/config';
import { CivicMap } from '../map/CivicMap';

interface ReportDetailPageProps {
  report: CivicReport;
  statusHistories: StatusHistoryItem[];
  onBack: () => void;
  isAdmin: boolean;
  onUpdateStatus: (reportId: string, newStatus: ReportStatus, notes: string, changedBy: string) => void;
  onOpenAdminModal?: () => void;
}

export const ReportDetailPage: React.FC<ReportDetailPageProps> = ({
  report,
  statusHistories,
  onBack,
  isAdmin,
  onUpdateStatus
}) => {
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<ReportStatus>(report.status);
  const [statusNotes, setStatusNotes] = useState('');
  const [changedBy, setChangedBy] = useState('Senior Operations Officer');

  const cat = ISSUE_CATEGORIES[report.category] || ISSUE_CATEGORIES.other;
  const sev = SEVERITY_LEVELS[report.severity] || SEVERITY_LEVELS.medium;
  const stat = REPORT_STATUSES[report.status] || REPORT_STATUSES.reported;

  const complaintId = report.complaintId || report.id;
  const ticketNo = report.dispatchTicketNumber || `MUNI-DSP-2026-${complaintId.replace('LF-', '')}`;
  const departmentName = report.concernedDepartment || cat.concernedDepartment;
  const slaText = report.slaWindow || `${cat.slaHours} Hours`;

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${report.latitude}, ${report.longitude}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleCopyComplaintId = () => {
    navigator.clipboard.writeText(complaintId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStatus === report.status && !statusNotes.trim()) {
      setShowStatusModal(false);
      return;
    }
    onUpdateStatus(
      report.id, 
      newStatus, 
      statusNotes.trim() || `Official status updated to ${REPORT_STATUSES[newStatus].name}`, 
      changedBy.trim() || 'Municipal Operations Officer'
    );
    setShowStatusModal(false);
    setStatusNotes('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints Directory</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Docket Receipt</span>
          </button>

          {isAdmin ? (
            <button
              onClick={() => setShowStatusModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Update Status (Officer)</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-500 italic">
              Official status logs authenticated by Municipal Dispatch
            </span>
          )}
        </div>
      </div>

      {/* AUTHORITY DISPATCH STATUS CALLOUT BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-6 border border-slate-700 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Official Municipal Transmission Acknowledged
              </span>
            </div>
            
            <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span>Assigned Authority: {departmentName}</span>
            </div>

            <p className="text-xs text-slate-300">
              Docket Ticket: <strong className="text-teal-300 font-mono">{ticketNo}</strong> · Standard Service Guarantee: <strong className="text-slate-200">{slaText} Inspection SLA</strong>
            </p>
          </div>

          {/* Quick Copy Complaint ID Pill */}
          <div className="bg-slate-800/90 border border-slate-600 p-3 rounded-xl flex items-center gap-3">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Complaint ID</div>
              <div className="font-mono text-base font-black text-teal-400">{complaintId}</div>
            </div>
            <button
              onClick={handleCopyComplaintId}
              className="p-2 bg-slate-700 hover:bg-teal-600 text-white rounded-lg transition-colors cursor-pointer"
              title="Copy Complaint ID to track later"
            >
              {copiedId ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Complaint Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
            Docket: {complaintId}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-slate-800">{cat.name}</span>
          <span aria-hidden="true">·</span>
          <span>Reported: {new Date(report.createdAt).toLocaleDateString()}</span>
          <span aria-hidden="true">·</span>
          <span>By: {report.reporterName || 'Citizen Grievant'}</span>
          {report.isSample && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-semibold">Demo Record</span>
            </>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
          {report.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          <span className="flex items-center gap-1.5 text-slate-700 font-medium">
            <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>{report.locationName}</span>
          </span>

          <span 
            className="text-[11px] font-bold px-2.5 py-0.5 rounded text-white uppercase tracking-wider shadow-xs"
            style={{ backgroundColor: sev.color }}
          >
            {sev.name} Severity
          </span>

          <span 
            className="font-bold flex items-center gap-1.5 px-3 py-1 rounded text-xs shadow-xs"
            style={{ backgroundColor: stat.bgColor, color: stat.color, border: `1px solid ${stat.color}40` }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }}></span>
            <span>Current Status: {stat.name}</span>
          </span>
        </div>
      </div>

      {/* Primary Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Photograph, Full Description, Proposed vs Resolved Action */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Photo Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="relative h-80 sm:h-96 bg-slate-100">
              <img
                src={report.imageUrl}
                alt={report.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-2">
                <FileCheck2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Verified Field Evidence · Geographic Metadata Attached</span>
              </div>
            </div>

            {report.additionalImages && report.additionalImages.length > 0 && (
              <div className="p-4 border-t border-slate-100 flex gap-3 overflow-x-auto">
                {report.additionalImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Additional photo ${idx + 1}`}
                    className="w-24 h-20 object-cover rounded-lg border border-slate-200"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Full Problem Description */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span>Defect Narrative & Physical Observations</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {report.description}
            </p>
          </div>

          {/* Two-Tier Action Comparison: Citizen Recommended vs Municipal Resolved */}
          <div className="space-y-4">
            
            {/* Citizen Recommended Corrective Action */}
            <div className="bg-blue-50/60 rounded-xl border border-blue-200 p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-blue-700" />
                <span>Recommended Corrective Action (From Citizen Grievance)</span>
              </div>
              <p className="text-xs text-blue-950 leading-relaxed">
                {report.suggestedSolution || 'No specific technical action was specified.'}
              </p>
              <div className="text-[11px] text-blue-700 italic pt-1">
                * Note: Transmitted to municipal engineers to assist in work-order material planning.
              </div>
            </div>

            {/* Official Municipal Resolution Notes */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Wrench className="w-4 h-4 text-teal-600" />
                  <span>Official Municipal Resolution & Crew Field Logs</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  {report.resolutionNotes ? 'Work Verified' : 'Triage in Progress'}
                </span>
              </div>

              {report.resolutionNotes ? (
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs text-emerald-950 leading-relaxed">
                  {report.resolutionNotes}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">
                    Awaiting On-Site Completion Sign-Off
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Once the maintenance contractor executes repair work orders on site, official completion notes and inspection photos will be posted directly to this docket.
                  </p>
                </div>
              )}

              {report.verificationNotes && (
                <div className="pt-3 border-t border-slate-100 text-xs text-slate-700">
                  <strong className="text-slate-900">Ward Inspector Findings: </strong>
                  <span>{report.verificationNotes}</span>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: Citizen Tracking Card, Map & Status Timeline */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* CITIZEN HOW-TO-TRACK DOCKET CARD */}
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-900 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-teal-700" />
              <span>How to Track Updates on this Complaint</span>
            </div>
            
            <p className="text-xs text-teal-950 leading-relaxed">
              Use your Complaint ID <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-teal-300 text-teal-800">{complaintId}</strong> to track progress at any time:
            </p>

            <ul className="text-[11px] text-teal-900 space-y-1.5 list-disc list-inside">
              <li>Click <strong>"Track Complaint"</strong> in the top menu and enter your ID.</li>
              <li>Bookmark or share this direct URL for live updates.</li>
              <li>Updates are authenticated directly by municipal dispatchers.</li>
            </ul>

            <button
              onClick={handleCopyComplaintId}
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId ? 'Complaint ID Copied!' : 'Copy Complaint ID'}</span>
            </button>
          </div>

          {/* Exact Geographic Coordinates Map */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Geographic Incident Location
              </h2>
              <button
                onClick={handleCopyCoords}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
              >
                {copiedCoords ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCoords ? 'Copied!' : 'Copy GPS'}</span>
              </button>
            </div>

            <CivicMap
              reports={[report]}
              selectedReportId={report.id}
              center={[report.latitude, report.longitude]}
              zoom={16}
              height="220px"
              interactive={true}
            />

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Address:</span>
                <span className="font-medium text-slate-900 text-right max-w-[220px] truncate">{report.locationName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Latitude:</span>
                <span className="font-mono text-slate-900">{report.latitude}° N</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Longitude:</span>
                <span className="font-mono text-slate-900">{report.longitude}° W</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Ward Jurisdiction:</span>
                <span className="font-medium text-slate-900">{report.assignedWard || 'Central Ward'}</span>
              </div>
            </div>

            <a
              href={`https://www.openstreetmap.org/?mlat=${report.latitude}&mlon=${report.longitude}#map=17/${report.latitude}/${report.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
            >
              <span>Verify on OpenStreetMap</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>

          {/* Audited Status Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Official Transmission & Audit Log
              </h2>
              <span className="text-[11px] text-slate-500">
                {statusHistories.length} Recorded Milestone{statusHistories.length === 1 ? '' : 's'}
              </span>
            </div>

            {statusHistories.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No milestones logged yet.</p>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 py-2">
                {statusHistories.map((item, idx) => {
                  const sInfo = REPORT_STATUSES[item.newStatus] || REPORT_STATUSES.reported;
                  const isLatest = idx === statusHistories.length - 1;

                  return (
                    <div key={item.id} className="relative pl-6">
                      <div 
                        className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                          isLatest ? 'ring-2 ring-teal-400' : ''
                        }`}
                        style={{ backgroundColor: sInfo.color }}
                      />

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-xs" style={{ color: sInfo.color }}>
                            {sInfo.name}
                          </span>
                          {isLatest && (
                            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded">
                              Current Stage
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-700 leading-normal">
                          {item.notes}
                        </p>

                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                          <span>{item.changedBy}</span>
                          <span aria-hidden="true">·</span>
                          <span>{new Date(item.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Admin Status Transition Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Update Official Complaint Status
                </h3>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Official Status:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {Object.entries(REPORT_STATUSES).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.name} — {info.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Transition Reason / Action Notes:
                </label>
                <textarea
                  rows={3}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="e.g. Field inspection completed. Work order #PW-8821 dispatched to site."
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Authorized Officer Signature:
                </label>
                <input
                  type="text"
                  value={changedBy}
                  onChange={(e) => setChangedBy(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Record Official Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
