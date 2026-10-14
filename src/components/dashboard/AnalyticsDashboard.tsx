import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Wrench, 
  MapPin, 
  Filter, 
  Info,
  Calendar
} from 'lucide-react';
import { CivicReport, IssueCategory } from '../../types';
import { ISSUE_CATEGORIES, SEVERITY_LEVELS, REPORT_STATUSES } from '../../constants/config';

interface AnalyticsDashboardProps {
  reports: CivicReport[];
  onNavigateToCategory?: (category: IssueCategory) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ reports }) => {
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<IssueCategory | 'all'>('all');
  const [selectedLocality, setSelectedLocality] = useState<string>('all');

  // Extract unique localities
  const allLocalities = useMemo(() => {
    const locSet = new Set<string>();
    reports.forEach(r => {
      const parts = r.locationName.split(',');
      const loc = parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim();
      if (loc) locSet.add(loc);
    });
    return Array.from(locSet);
  }, [reports]);

  // Apply filters to active dataset
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (selectedFilterCategory !== 'all' && r.category !== selectedFilterCategory) {
        return false;
      }
      if (selectedLocality !== 'all') {
        const parts = r.locationName.split(',');
        const loc = parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim();
        if (loc !== selectedLocality) return false;
      }
      return true;
    });
  }, [reports, selectedFilterCategory, selectedLocality]);

  // Metric Cards
  const totalIssues = filteredReports.length;
  const criticalAndHigh = filteredReports.filter(r => r.severity === 'critical' || r.severity === 'high').length;
  const awaitingVerification = filteredReports.filter(r => r.status === 'reported' || r.status === 'under_verification').length;
  const reportedToAuthorities = filteredReports.filter(r => r.status === 'reported_to_authority').length;
  const underRepair = filteredReports.filter(r => r.status === 'in_progress').length;
  const resolvedIssues = filteredReports.filter(r => r.status === 'resolved').length;

  // Chart 1: Issues by Category
  const categoryChartData = useMemo(() => {
    return Object.entries(ISSUE_CATEGORIES).map(([key, cat]) => {
      const count = filteredReports.filter(r => r.category === key).length;
      return {
        name: cat.name,
        count,
        color: cat.color
      };
    }).filter(item => item.count > 0 || selectedFilterCategory === 'all');
  }, [filteredReports, selectedFilterCategory]);

  // Chart 2: Issues by Severity
  const severityChartData = useMemo(() => {
    const counts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    filteredReports.forEach(r => {
      const sev = SEVERITY_LEVELS[r.severity]?.name || 'Medium';
      counts[sev] = (counts[sev] || 0) + 1;
    });
    return [
      { name: 'Critical', value: counts['Critical'], color: '#dc2626' },
      { name: 'High', value: counts['High'], color: '#ea580c' },
      { name: 'Medium', value: counts['Medium'], color: '#f59e0b' },
      { name: 'Low', value: counts['Low'], color: '#10b981' }
    ].filter(item => item.value > 0);
  }, [filteredReports]);

  // Chart 3: Issues by Locality
  const localityChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredReports.forEach(r => {
      const parts = r.locationName.split(',');
      const loc = parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim();
      counts[loc] = (counts[loc] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [filteredReports]);

  // Chart 4: Reported vs Resolved Status Flow
  const statusFlowData = useMemo(() => {
    return [
      { name: 'Reported', count: filteredReports.filter(r => r.status === 'reported').length, color: '#64748b' },
      { name: 'Under Verification', count: filteredReports.filter(r => r.status === 'under_verification').length, color: '#3b82f6' },
      { name: 'To Authority', count: filteredReports.filter(r => r.status === 'reported_to_authority').length, color: '#8b5cf6' },
      { name: 'In Progress', count: filteredReports.filter(r => r.status === 'in_progress').length, color: '#f59e0b' },
      { name: 'Resolved', count: filteredReports.filter(r => r.status === 'resolved').length, color: '#10b981' },
      { name: 'Reopened', count: filteredReports.filter(r => r.status === 'reopened').length, color: '#ef4444' }
    ].filter(item => item.count > 0);
  }, [filteredReports]);

  // Chart 5: Monthly Reporting Trends (from actual dates observed)
  const monthlyTrendData = useMemo(() => {
    const monthCounts: Record<string, { reported: number; resolved: number }> = {};
    
    filteredReports.forEach(r => {
      const d = new Date(r.createdAt);
      const key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
      if (!monthCounts[key]) {
        monthCounts[key] = { reported: 0, resolved: 0 };
      }
      monthCounts[key].reported++;
      if (r.status === 'resolved') {
        monthCounts[key].resolved++;
      }
    });

    return Object.entries(monthCounts).map(([month, stats]) => ({
      month,
      reported: stats.reported,
      resolved: stats.resolved
    }));
  }, [filteredReports]);

  const hasSampleRecords = reports.some(r => r.isSample);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Civic Infrastructure Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry and reporting metrics generated directly from active infrastructure logs.
          </p>
        </div>

        {/* Locality & Category Slicers */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedFilterCategory}
            onChange={(e) => setSelectedFilterCategory(e.target.value as any)}
            className="py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
          >
            <option value="all">All Categories</option>
            {Object.entries(ISSUE_CATEGORIES).map(([key, info]) => (
              <option key={key} value={key}>{info.name}</option>
            ))}
          </select>

          <select
            value={selectedLocality}
            onChange={(e) => setSelectedLocality(e.target.value)}
            className="py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
          >
            <option value="all">All Wards / Localities</option>
            {allLocalities.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Demonstration Data Transparency Notice */}
      {hasSampleRecords && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Transparent Demonstration Notice: </span>
            <span>
              The statistics below reflect actual database records, including realistic sample demonstrations for demonstration purposes. Reset or clear records anytime via the footer.
            </span>
          </div>
        </div>
      )}

      {/* 6 Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Total Issues */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Issues</span>
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalIssues}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Recorded incidents</p>
        </div>

        {/* Critical & High */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-rose-700 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Critical / High</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700">{criticalAndHigh}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Safety hazard alerts</p>
        </div>

        {/* Awaiting Verification */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-blue-700 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">In Triage</span>
            <Clock className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-700">{awaitingVerification}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Pending site audit</p>
        </div>

        {/* Reported to Authority */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-purple-700 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">To Authority</span>
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-700">{reportedToAuthorities}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Forwarded to city</p>
        </div>

        {/* Under Repair */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-700 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Under Repair</span>
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700">{underRepair}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Active crew assigned</p>
        </div>

        {/* Resolved */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-700 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Resolved</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">{resolvedIssues}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Audited & fixed</p>
        </div>

      </div>

      {/* Row 1 Charts: Category Breakdown & Severity Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Breakdown (Bar) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Issues by Infrastructure Category
            </h3>
            <span className="text-xs text-slate-500">Incident Distribution</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution (Pie) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Hazard Severity Proportions
            </h3>
            <span className="text-xs text-slate-500">Urgency Triage</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {severityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {severityChartData.map((entry, index) => (
                      <Cell key={`sev-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    formatter={(val) => <span className="text-xs text-slate-700">{val}</span>} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No data available</p>
            )}
          </div>
        </div>

      </div>

      {/* Row 2 Charts: Locality Distribution & Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Locality Distribution */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Top Incident Hotspots by Locality
            </h3>
            <span className="text-xs text-slate-500">Geographic Density</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={localityChartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: '#334155' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Transition Pipeline */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Civic Resolution Pipeline Status
            </h3>
            <span className="text-xs text-slate-500">Stage Progress</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusFlowData.map((entry, index) => (
                    <Cell key={`status-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
