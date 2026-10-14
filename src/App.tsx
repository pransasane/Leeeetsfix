/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CivicReport, ReportStatus, StatusHistoryItem, CitizenUser } from './types';
import { ReportStorageService } from './services/reportStorage';
import { AuthService } from './services/authService';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/home/HomePage';
import { ExploreMapPage } from './components/map/ExploreMapPage';
import { AllReportsPage } from './components/reports/AllReportsPage';
import { ReportIssuePage } from './components/reports/ReportIssuePage';
import { ReportDetailPage } from './components/reports/ReportDetailPage';
import { AnalyticsDashboard } from './components/dashboard/AnalyticsDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AboutPage } from './components/about/AboutPage';
import { AuthModal } from './components/auth/AuthModal';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('letsfix_admin_logged_in') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<CitizenUser | null>(() => {
    return AuthService.getCurrentUser();
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load reports from persistent store on mount
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const data = ReportStorageService.getReports();
    setReports(data);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: CitizenUser) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name}! You are now signed in.`);
  };

  const handleLogoutUser = () => {
    AuthService.logout();
    setCurrentUser(null);
    showToast('You have been logged out of your Citizen account.');
  };

  const handleNavigate = (view: string, reportId?: string) => {
    if (reportId) {
      setSelectedReportId(reportId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectReport = (report: CivicReport) => {
    setSelectedReportId(report.id);
    setCurrentView('report-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateReport = (newReport: Omit<CivicReport, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const created = ReportStorageService.createReport(newReport);
    loadReports();
    showToast(`Report ${created.id} logged successfully!`);
    return created;
  };

  const handleUpdateReport = (id: string, updates: Partial<CivicReport>) => {
    const updated = ReportStorageService.updateReport(id, updates);
    loadReports();
    showToast(`Report ${id} updated.`);
    return updated;
  };

  const handleUpdateStatus = (reportId: string, newStatus: ReportStatus, notes: string, changedBy: string) => {
    const result = ReportStorageService.updateReportStatus(reportId, newStatus, notes, changedBy);
    loadReports();
    showToast(`Status updated to ${newStatus}.`);
    return result;
  };

  const handleDeleteReport = (id: string) => {
    ReportStorageService.deleteReport(id);
    loadReports();
    if (selectedReportId === id) {
      setSelectedReportId(null);
      setCurrentView('reports');
    }
    showToast(`Report ${id} removed.`);
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all civic reports back to initial demonstration dataset?')) {
      ReportStorageService.resetToDemoData();
      loadReports();
      showToast('Sample dataset restored.');
    }
  };

  const handleExportData = () => {
    const jsonStr = ReportStorageService.exportDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `letsfix_civic_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Civic data exported as JSON.');
  };

  const handleLoginAdmin = () => {
    setIsAdmin(true);
    localStorage.setItem('letsfix_admin_logged_in', 'true');
    setCurrentView('admin');
    showToast('Authenticated as Municipal Operations Officer.');
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('letsfix_admin_logged_in');
    showToast('Logged out of Admin Portal.');
  };

  const handleTrackComplaintId = (queryId: string) => {
    const clean = queryId.trim();
    const match = ReportStorageService.getReportById(clean);
    if (match) {
      setSelectedReportId(match.id);
      setCurrentView('report-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast(`Complaint Docket ${match.complaintId || match.id} retrieved.`);
    } else {
      showToast(`Complaint ID "${queryId}" not found. Please verify the ID.`);
    }
  };

  // Find selected report for detail view (lookup by ID, complaintId, or ticket number)
  const selectedReport = selectedReportId ? (ReportStorageService.getReportById(selectedReportId) || reports.find(r => r.id === selectedReportId)) : null;
  const statusHistories: StatusHistoryItem[] = selectedReportId ? ReportStorageService.getStatusHistories(selectedReport ? selectedReport.id : selectedReportId) : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-teal-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        isAdmin={isAdmin}
        onToggleAdmin={() => {
          handleNavigate('admin');
        }}
        onTrackComplaintId={handleTrackComplaintId}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogoutUser}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            reports={reports}
            onNavigate={handleNavigate}
            onSelectReport={handleSelectReport}
            onTrackComplaintId={handleTrackComplaintId}
          />
        )}

        {currentView === 'map' && (
          <ExploreMapPage
            reports={reports}
            onSelectReport={handleSelectReport}
            onNavigateToReport={(reportId) => handleNavigate('report-detail', reportId)}
          />
        )}

        {currentView === 'reports' && (
          <AllReportsPage
            reports={reports}
            onSelectReport={handleSelectReport}
            onNavigateToReport={(reportId) => handleNavigate('report-detail', reportId)}
            onNavigateToNewReport={() => handleNavigate('report-issue')}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'report-issue' && (
          <ReportIssuePage
            onSubmitReport={handleCreateReport}
            onNavigateToReport={(reportId) => handleNavigate('report-detail', reportId)}
            onNavigate={handleNavigate}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'report-detail' && (
          selectedReport ? (
            <ReportDetailPage
              report={selectedReport}
              statusHistories={statusHistories}
              onBack={() => handleNavigate('reports')}
              isAdmin={isAdmin}
              onUpdateStatus={handleUpdateStatus}
              onOpenAdminModal={() => handleNavigate('admin')}
            />
          ) : (
            <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
              <h2 className="text-xl font-bold text-slate-800">Report Not Found</h2>
              <p className="text-xs text-slate-500">
                The requested civic infrastructure report was not found or has been removed.
              </p>
              <button
                onClick={() => handleNavigate('reports')}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Return to All Reports
              </button>
            </div>
          )
        )}

        {currentView === 'dashboard' && (
          <AnalyticsDashboard
            reports={reports}
            onNavigateToCategory={() => handleNavigate('map')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            reports={reports}
            isAdmin={isAdmin}
            onLogin={handleLoginAdmin}
            onLogout={handleLogoutAdmin}
            onUpdateReport={handleUpdateReport}
            onUpdateReportStatus={handleUpdateStatus}
            onDeleteReport={handleDeleteReport}
            onNavigateToReport={(reportId) => handleNavigate('report-detail', reportId)}
            onResetDemoData={handleResetDemo}
            onExportData={handleExportData}
          />
        )}

        {currentView === 'about' && (
          <AboutPage
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Authentication Modal (Login / Sign Up) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Global Civic Footer */}
      <Footer
        onNavigate={handleNavigate}
        onResetDemo={handleResetDemo}
        isAdmin={isAdmin}
        onOpenAdmin={() => handleNavigate('admin')}
      />

    </div>
  );
}
