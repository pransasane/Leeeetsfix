import { CategoryInfo, IssueCategory, ReportStatus, SeverityInfo, SeverityLevel, StatusInfo } from '../types';

export const ISSUE_CATEGORIES: Record<IssueCategory, CategoryInfo> = {
  roads_potholes: {
    id: 'roads_potholes',
    name: 'Roads & Potholes',
    iconName: 'AlertTriangle',
    color: '#ea580c', // orange-600
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Crater potholes, asphalt deterioration, road subsidence, surface depressions.',
    concernedDepartment: 'Municipal Public Works Department (Road Infrastructure & Highways Division)',
    authorityDivision: 'Bureau of Road Surface Quality & Emergency Pavement Repair',
    slaHours: 24
  },
  footpaths: {
    id: 'footpaths',
    name: 'Footpaths & Pedestrians',
    iconName: 'Footprints',
    color: '#0284c7', // sky-600
    textColor: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    description: 'Damaged pavers, uneven sidewalks, missing curb ramps, tactile paving breaks.',
    concernedDepartment: 'Urban Pedestrian Safety & Sidewalk Infrastructure Directorate',
    authorityDivision: 'Civic Mobility & ADA Pedestrian Corridor Maintenance',
    slaHours: 48
  },
  streetlights: {
    id: 'streetlights',
    name: 'Streetlights & Electrical',
    iconName: 'Lightbulb',
    color: '#eab308', // yellow-500
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: 'Non-functional luminaires, exposed cables, damaged poles, flickering fixtures.',
    concernedDepartment: 'Municipal Corporation — Public Lighting & Electrical Grid Directorate',
    authorityDivision: 'Street Illumination & Night Safety Dispatch Unit',
    slaHours: 24
  },
  water_leakage: {
    id: 'water_leakage',
    name: 'Water Leakage',
    iconName: 'Droplets',
    color: '#0891b2', // cyan-600
    textColor: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    description: 'Burst pipelines, leaking valves, road water accumulation, supply pipe damage.',
    concernedDepartment: 'Metropolitan Water Supply & Sewerage Board',
    authorityDivision: 'Potable Water Distribution & Emergency Pipeline Repair Unit',
    slaHours: 12
  },
  drainage: {
    id: 'drainage',
    name: 'Drainage & Sewage',
    iconName: 'GitFork',
    color: '#0d9488', // teal-600
    textColor: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    description: 'Blocked stormwater drains, damaged manhole covers, overflow during rainfall.',
    concernedDepartment: 'Municipal Stormwater Drainage & Sanitation Engineering Dept',
    authorityDivision: 'Underground Sewerage & Catch Basin Emergency Response Desk',
    slaHours: 24
  },
  garbage: {
    id: 'garbage',
    name: 'Garbage & Waste',
    iconName: 'Trash2',
    color: '#65a30d', // lime-600
    textColor: 'text-emerald-800',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Overflowing community bins, illegal roadside dumping, debris piles.',
    concernedDepartment: 'Department of Municipal Solid Waste Management & Urban Hygiene',
    authorityDivision: 'Sanitation Enforcement & Special Bulk Clearance Wing',
    slaHours: 18
  },
  other: {
    id: 'other',
    name: 'Other Infrastructure',
    iconName: 'Building2',
    color: '#64748b', // slate-500
    textColor: 'text-slate-700',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
    description: 'Damaged guardrails, public signage, fallen branches, civic structures.',
    concernedDepartment: 'General Civic Asset Maintenance & Public Safety Authority',
    authorityDivision: 'Municipal Infrastructure Triage & Asset Protection Desk',
    slaHours: 48
  }
};

export const SEVERITY_LEVELS: Record<SeverityLevel, SeverityInfo> = {
  low: {
    id: 'low',
    name: 'Low',
    color: '#10b981', // emerald-500
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    order: 1
  },
  medium: {
    id: 'medium',
    name: 'Medium',
    color: '#f59e0b', // amber-500
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    order: 2
  },
  high: {
    id: 'high',
    name: 'High',
    color: '#ea580c', // orange-600
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    order: 3
  },
  critical: {
    id: 'critical',
    name: 'Critical',
    color: '#dc2626', // red-600
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    order: 4
  }
};

export const REPORT_STATUSES: Record<ReportStatus, StatusInfo> = {
  reported: {
    id: 'reported',
    name: 'Complaint Registered',
    description: 'Citizen complaint logged and dispatched to the municipal department.',
    color: '#64748b',
    textColor: 'text-slate-700',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    order: 1
  },
  under_verification: {
    id: 'under_verification',
    name: 'Field Verification Scheduled',
    description: 'Assigned ward surveyor/engineer is conducting on-site physical inspection.',
    color: '#3b82f6',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    order: 2
  },
  reported_to_authority: {
    id: 'reported_to_authority',
    name: 'Work Order Acknowledged by Authority',
    description: 'Concerned department has formally accepted the docket and assigned internal job order.',
    color: '#8b5cf6',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    order: 3
  },
  in_progress: {
    id: 'in_progress',
    name: 'Repair Work in Progress',
    description: 'Maintenance crew and machinery active on site carrying out corrective repairs.',
    color: '#f59e0b',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    order: 4
  },
  resolved: {
    id: 'resolved',
    name: 'Resolved & Audited',
    description: 'Repair work completed, field inspection verified, and site cleared.',
    color: '#10b981',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    order: 5
  },
  reopened: {
    id: 'reopened',
    name: 'Reopened for Review',
    description: 'Issue resurfaced or repair deemed incomplete upon citizen audit.',
    color: '#ef4444',
    textColor: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    order: 6
  }
};

export const DEFAULT_MAP_CENTER: [number, number] = [37.7749, -122.4194];
export const DEFAULT_MAP_ZOOM = 13;
