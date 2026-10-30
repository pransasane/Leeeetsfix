import type { CivicReport, StatusHistoryItem, ReportStatus } from '../types';
import { ISSUE_CATEGORIES } from '../constants/config';
import { supabase } from '../lib/supabase';

type ReportRow = {
  id: string; complaint_id: string; title: string; category: CivicReport['category']; description: string;
  image_url: string; additional_images: string[] | null; location_name: string; latitude: number; longitude: number;
  severity: CivicReport['severity']; suggested_solution: string; status: ReportStatus; date_observed: string;
  created_at: string; updated_at: string; verification_notes: string | null; resolution_notes: string | null;
  reporter_name: string | null; is_sample: boolean; concerned_department: string | null;
  dispatch_ticket_number: string | null; authority_acknowledgment_date: string | null; sla_window: string | null;
  assigned_ward: string | null;
};

function fromRow(row: ReportRow): CivicReport {
  const categoryInfo = ISSUE_CATEGORIES[row.category] || ISSUE_CATEGORIES.other;
  return {
    id: row.id, complaintId: row.complaint_id, title: row.title, category: row.category,
    description: row.description, imageUrl: row.image_url, additionalImages: row.additional_images || [],
    locationName: row.location_name, latitude: Number(row.latitude), longitude: Number(row.longitude),
    severity: row.severity, suggestedSolution: row.suggested_solution, status: row.status,
    dateObserved: row.date_observed, createdAt: row.created_at, updatedAt: row.updated_at,
    verificationNotes: row.verification_notes || undefined, resolutionNotes: row.resolution_notes || undefined,
    reporterName: row.reporter_name || undefined, isSample: row.is_sample,
    concernedDepartment: row.concerned_department || categoryInfo.concernedDepartment,
    dispatchTicketNumber: row.dispatch_ticket_number || undefined,
    authorityAcknowledgmentDate: row.authority_acknowledgment_date || undefined,
    slaWindow: row.sla_window || undefined, assignedWard: row.assigned_ward || undefined
  };
}

function toRow(report: CivicReport) {
  return {
    id: report.id, complaint_id: report.complaintId || report.id, title: report.title, category: report.category,
    description: report.description, image_url: report.imageUrl, additional_images: report.additionalImages || [],
    location_name: report.locationName, latitude: report.latitude, longitude: report.longitude,
    severity: report.severity, suggested_solution: report.suggestedSolution, status: report.status,
    date_observed: report.dateObserved, created_at: report.createdAt, updated_at: report.updatedAt,
    verification_notes: report.verificationNotes || null, resolution_notes: report.resolutionNotes || null,
    reporter_name: report.reporterName || null, is_sample: report.isSample ?? false,
    concerned_department: report.concernedDepartment || null, dispatch_ticket_number: report.dispatchTicketNumber || null,
    authority_acknowledgment_date: report.authorityAcknowledgmentDate || null, sla_window: report.slaWindow || null,
    assigned_ward: report.assignedWard || null
  };
}

export class SupabaseReportService {
  static isConfigured(): boolean { return Boolean(supabase); }

  static async getReports(): Promise<CivicReport[]> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.from('civic_reports').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return ((data || []) as ReportRow[]).map(fromRow);
  }

  static async createReport(newReport: Omit<CivicReport, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: ReportStatus }): Promise<CivicReport> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const year = new Date().getFullYear();
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const id = `LF-${year}-${suffix}`;
    const now = new Date().toISOString();
    const categoryInfo = ISSUE_CATEGORIES[newReport.category] || ISSUE_CATEGORIES.other;
    const ticket = `MUNI-DSP-${year}-${suffix}`;
    const report: CivicReport = {
      ...newReport, id, complaintId: id, status: newReport.status || 'reported', createdAt: now, updatedAt: now,
      isSample: false, concernedDepartment: categoryInfo.concernedDepartment, dispatchTicketNumber: ticket,
      authorityAcknowledgmentDate: now, slaWindow: `${categoryInfo.slaHours} Hours`, assignedWard: 'Ward 4 - Central Municipal Area'
    };
    const { error } = await supabase.from('civic_reports').insert(toRow(report));
    if (error) throw error;
    const history: StatusHistoryItem = {
      id: `sh-${Date.now()}`, reportId: id, previousStatus: null, newStatus: report.status,
      notes: `Citizen complaint registered. Municipal Dispatch Ticket #${ticket} generated with ${categoryInfo.slaHours}h response commitment.`,
      changedBy: 'Municipal Central Dispatch & Triage Gateway', createdAt: now
    };
    const { error: historyError } = await supabase.from('civic_report_history').insert({
      id: history.id, report_id: history.reportId, previous_status: history.previousStatus,
      new_status: history.newStatus, notes: history.notes, changed_by: history.changedBy, created_at: history.createdAt
    });
    if (historyError) throw historyError;
    return report;
  }

  static async updateReport(id: string, updates: Partial<CivicReport>): Promise<void> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const existing = await supabase.from('civic_reports').select('*').eq('id', id).single();
    if (existing.error) throw existing.error;
    const current = fromRow(existing.data as ReportRow);
    const updated = { ...current, ...updates, id, updatedAt: new Date().toISOString() };
    const { error } = await supabase.from('civic_reports').update(toRow(updated)).eq('id', id);
    if (error) throw error;
  }

  static async updateReportStatus(reportId: string, newStatus: ReportStatus, notes: string, changedBy: string): Promise<void> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.from('civic_reports').select('status').eq('id', reportId).single();
    if (error) throw error;
    const timestamp = new Date().toISOString();
    const { error: updateError } = await supabase.from('civic_reports').update({ status: newStatus, updated_at: timestamp }).eq('id', reportId);
    if (updateError) throw updateError;
    const { error: historyError } = await supabase.from('civic_report_history').insert({
      id: `sh-${Date.now()}-${Math.floor(Math.random() * 1000)}`, report_id: reportId,
      previous_status: data.status, new_status: newStatus,
      notes: notes || `Official status updated from ${data.status} to ${newStatus}.`,
      changed_by: changedBy || 'Municipal Operations Staff', created_at: timestamp
    });
    if (historyError) throw historyError;
  }

  static async deleteReport(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.from('civic_reports').delete().eq('id', id);
    if (error) throw error;
  }

  static async getStatusHistories(reportId: string): Promise<StatusHistoryItem[]> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.from('civic_report_history').select('*').eq('report_id', reportId).order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id, reportId: row.report_id, previousStatus: row.previous_status,
      newStatus: row.new_status, notes: row.notes, changedBy: row.changed_by, createdAt: row.created_at
    }));
  }
}
