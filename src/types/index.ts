export type IssueCategory = 
  | 'roads_potholes'
  | 'footpaths'
  | 'streetlights'
  | 'water_leakage'
  | 'drainage'
  | 'garbage'
  | 'other';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type ReportStatus = 
  | 'reported'
  | 'under_verification'
  | 'reported_to_authority'
  | 'in_progress'
  | 'resolved'
  | 'reopened';

export interface StatusHistoryItem {
  id: string;
  reportId: string;
  previousStatus: ReportStatus | null;
  newStatus: ReportStatus;
  notes: string;
  changedBy: string;
  createdAt: string;
}

export interface CivicReport {
  id: string; // Official Complaint ID (e.g. LF-2026-1042)
  complaintId?: string; // Formatted Complaint ID
  title: string;
  category: IssueCategory;
  description: string;
  imageUrl: string;
  additionalImages?: string[];
  locationName: string;
  latitude: number;
  longitude: number;
  severity: SeverityLevel;
  suggestedSolution: string;
  status: ReportStatus;
  dateObserved: string;
  createdAt: string;
  updatedAt: string;
  verificationNotes?: string;
  resolutionNotes?: string;
  reporterName?: string;
  isSample?: boolean;
  
  // Official Authority Dispatch Metadata
  concernedDepartment?: string;
  dispatchTicketNumber?: string;
  authorityAcknowledgmentDate?: string;
  slaWindow?: string;
  assignedWard?: string;
}

export interface CategoryInfo {
  id: IssueCategory;
  name: string;
  iconName: string;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  description: string;
  concernedDepartment: string;
  authorityDivision: string;
  slaHours: number;
}

export interface SeverityInfo {
  id: SeverityLevel;
  name: string;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  order: number;
}

export interface StatusInfo {
  id: ReportStatus;
  name: string;
  description: string;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  order: number;
}

export * from './auth';
