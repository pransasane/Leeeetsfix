import { CivicReport, IssueCategory, ReportStatus, SeverityLevel, StatusHistoryItem } from '../types';
import { SAMPLE_REPORTS, SAMPLE_STATUS_HISTORIES } from '../data/sampleReports';
import { ISSUE_CATEGORIES } from '../constants/config';

const STORAGE_KEY_REPORTS = 'letsfix_reports_v2';
const STORAGE_KEY_HISTORIES = 'letsfix_histories_v2';

export class ReportStorageService {
  private static initStorage(): void {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEY_REPORTS)) {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(SAMPLE_REPORTS));
    }

    if (!localStorage.getItem(STORAGE_KEY_HISTORIES)) {
      localStorage.setItem(STORAGE_KEY_HISTORIES, JSON.stringify(SAMPLE_STATUS_HISTORIES));
    }
  }

  static getReports(): CivicReport[] {
    this.initStorage();
    try {
      const data = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (!data) return SAMPLE_REPORTS;
      let reports: CivicReport[] = JSON.parse(data);
      
      // Ensure authority metadata is backfilled if missing
      reports = reports.map(r => {
        const catInfo = ISSUE_CATEGORIES[r.category] || ISSUE_CATEGORIES.other;
        return {
          ...r,
          complaintId: r.complaintId || r.id,
          concernedDepartment: r.concernedDepartment || catInfo.concernedDepartment,
          dispatchTicketNumber: r.dispatchTicketNumber || `MUNI-DSP-${r.id.replace('LF-', '')}`,
          slaWindow: r.slaWindow || `${catInfo.slaHours} Hours`,
          assignedWard: r.assignedWard || 'Central Municipal Ward'
        };
      });

      return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.error('Failed to load reports from storage:', err);
      return SAMPLE_REPORTS;
    }
  }

  static getReportById(id: string): CivicReport | undefined {
    const reports = this.getReports();
    const cleanId = id.trim().toUpperCase();
    return reports.find(r => 
      r.id.toUpperCase() === cleanId || 
      (r.complaintId && r.complaintId.toUpperCase() === cleanId) ||
      (r.dispatchTicketNumber && r.dispatchTicketNumber.toUpperCase() === cleanId)
    );
  }

  static getStatusHistories(reportId: string): StatusHistoryItem[] {
    this.initStorage();
    try {
      const data = localStorage.getItem(STORAGE_KEY_HISTORIES);
      const allHistories: Record<string, StatusHistoryItem[]> = data ? JSON.parse(data) : SAMPLE_STATUS_HISTORIES;
      const list = allHistories[reportId] || [];
      return [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } catch (err) {
      console.error('Failed to load status histories:', err);
      return [];
    }
  }

  static createReport(newReport: Omit<CivicReport, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: ReportStatus }): CivicReport {
    this.initStorage();
    const reports = this.getReports();

    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `LF-${currentYear}-${randomSuffix}`;
    const timestamp = new Date().toISOString();
    const catInfo = ISSUE_CATEGORIES[newReport.category] || ISSUE_CATEGORIES.other;
    const ticketNum = `MUNI-DSP-${currentYear}-${randomSuffix}`;

    const createdReport: CivicReport = {
      ...newReport,
      id: newId,
      complaintId: newId,
      status: newReport.status || 'reported',
      createdAt: timestamp,
      updatedAt: timestamp,
      isSample: false,
      concernedDepartment: catInfo.concernedDepartment,
      dispatchTicketNumber: ticketNum,
      authorityAcknowledgmentDate: timestamp,
      slaWindow: `${catInfo.slaHours} Hours`,
      assignedWard: 'Ward 4 - Central Municipal Area'
    };

    const updatedReports = [createdReport, ...reports];
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(updatedReports));

    // Create official transmission history item
    const historyItem: StatusHistoryItem = {
      id: `sh-${Date.now()}`,
      reportId: newId,
      previousStatus: null,
      newStatus: createdReport.status,
      notes: `Citizen complaint officially registered. Transmitted & acknowledged by ${catInfo.concernedDepartment}. Municipal Dispatch Ticket #${ticketNum} generated with ${catInfo.slaHours}h response commitment.`,
      changedBy: 'Municipal Central Dispatch & Triage Gateway',
      createdAt: timestamp
    };

    try {
      const data = localStorage.getItem(STORAGE_KEY_HISTORIES);
      const allHistories: Record<string, StatusHistoryItem[]> = data ? JSON.parse(data) : {};
      allHistories[newId] = [historyItem];
      localStorage.setItem(STORAGE_KEY_HISTORIES, JSON.stringify(allHistories));
    } catch (err) {
      console.error('Failed to save initial history:', err);
    }

    return createdReport;
  }

  static updateReport(id: string, updates: Partial<CivicReport>): CivicReport | null {
    this.initStorage();
    const reports = this.getReports();
    const index = reports.findIndex(r => r.id === id);
    if (index === -1) return null;

    const existing = reports[index];
    const updated: CivicReport = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString()
    };

    reports[index] = updated;
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    return updated;
  }

  static updateReportStatus(
    reportId: string, 
    newStatus: ReportStatus, 
    notes: string, 
    changedBy: string
  ): { report: CivicReport | null; historyItem: StatusHistoryItem } | null {
    this.initStorage();
    const report = this.getReportById(reportId);
    if (!report) return null;

    const previousStatus = report.status;
    const timestamp = new Date().toISOString();

    const updatedReport = this.updateReport(reportId, {
      status: newStatus,
      updatedAt: timestamp
    });

    const historyItem: StatusHistoryItem = {
      id: `sh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      reportId,
      previousStatus,
      newStatus,
      notes: notes || `Official status updated from ${previousStatus} to ${newStatus}.`,
      changedBy: changedBy || 'Municipal Operations Staff',
      createdAt: timestamp
    };

    try {
      const data = localStorage.getItem(STORAGE_KEY_HISTORIES);
      const allHistories: Record<string, StatusHistoryItem[]> = data ? JSON.parse(data) : {};
      if (!allHistories[reportId]) {
        allHistories[reportId] = [];
      }
      allHistories[reportId].push(historyItem);
      localStorage.setItem(STORAGE_KEY_HISTORIES, JSON.stringify(allHistories));
    } catch (err) {
      console.error('Failed to record status update:', err);
    }

    return { report: updatedReport, historyItem };
  }

  static deleteReport(id: string): boolean {
    this.initStorage();
    const reports = this.getReports();
    const filtered = reports.filter(r => r.id !== id);
    if (filtered.length === reports.length) return false;

    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(filtered));

    try {
      const data = localStorage.getItem(STORAGE_KEY_HISTORIES);
      if (data) {
        const allHistories = JSON.parse(data);
        delete allHistories[id];
        localStorage.setItem(STORAGE_KEY_HISTORIES, JSON.stringify(allHistories));
      }
    } catch (err) {
      console.error('Failed to delete history for report:', err);
    }

    return true;
  }

  static resetToDemoData(): void {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(SAMPLE_REPORTS));
    localStorage.setItem(STORAGE_KEY_HISTORIES, JSON.stringify(SAMPLE_STATUS_HISTORIES));
  }

  static clearAllReports(): void {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_HISTORIES, JSON.stringify({}));
  }

  static exportDatabase(): string {
    const reports = this.getReports();
    const data = localStorage.getItem(STORAGE_KEY_HISTORIES);
    const histories = data ? JSON.parse(data) : {};
    return JSON.stringify({
      version: '2.0',
      exportedAt: new Date().toISOString(),
      reports,
      statusHistories: histories
    }, null, 2);
  }

  static getMetrics() {
    const reports = this.getReports();
    const totalIssues = reports.length;
    const criticalCount = reports.filter(r => r.severity === 'critical').length;
    const highCount = reports.filter(r => r.severity === 'high').length;
    const criticalAndHigh = criticalCount + highCount;
    
    const awaitingVerification = reports.filter(r => r.status === 'reported' || r.status === 'under_verification').length;
    const reportedToAuthority = reports.filter(r => r.status === 'reported_to_authority').length;
    const inProgress = reports.filter(r => r.status === 'in_progress').length;
    const resolved = reports.filter(r => r.status === 'resolved').length;
    const reopened = reports.filter(r => r.status === 'reopened').length;

    const categoryCounts: Record<IssueCategory, number> = {
      roads_potholes: 0,
      footpaths: 0,
      streetlights: 0,
      water_leakage: 0,
      drainage: 0,
      garbage: 0,
      other: 0
    };
    reports.forEach(r => {
      if (categoryCounts[r.category] !== undefined) {
        categoryCounts[r.category]++;
      }
    });

    const severityCounts: Record<SeverityLevel, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    reports.forEach(r => {
      if (severityCounts[r.severity] !== undefined) {
        severityCounts[r.severity]++;
      }
    });

    const localityCounts: Record<string, number> = {};
    reports.forEach(r => {
      const parts = r.locationName.split(',');
      const locality = parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim();
      localityCounts[locality] = (localityCounts[locality] || 0) + 1;
    });

    return {
      totalIssues,
      criticalAndHigh,
      awaitingVerification,
      reportedToAuthority,
      inProgress,
      resolved,
      reopened,
      categoryCounts,
      severityCounts,
      localityCounts,
      sampleRatio: reports.filter(r => r.isSample).length / (totalIssues || 1)
    };
  }
}
