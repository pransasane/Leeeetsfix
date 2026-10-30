import React, { useState, useEffect } from 'react';
import { CivicReport, ReportStatus, StatusHistoryItem, CitizenUser } from './types';
import { ReportStorageService } from './services/reportStorage';
import { SupabaseReportService } from './services/supabaseReportService';
import { AuthService } from './services/authService';
import { SupabaseAuthService } from './services/supabaseAuthService';
import { isSupabaseConfigured } from './lib/supabase';
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
  const [currentView, setCurrentView] = useState('home');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [statusHistories, setStatusHistories] = useState<StatusHistoryItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('letsfix_admin_logged_in') === 'true');
  const [currentUser, setCurrentUser] = useState<CitizenUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login'|'signup'>('login');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadReports = async () => {
    try { setReports(isSupabaseConfigured ? await SupabaseReportService.getReports() : ReportStorageService.getReports()); }
    catch (err) { console.error(err); setReports(ReportStorageService.getReports()); showToast('Database unavailable; showing local demo data.'); }
  };

  useEffect(() => {
    loadReports();
    if (isSupabaseConfigured) {
      SupabaseAuthService.getCurrentUser().then(setCurrentUser);
      return SupabaseAuthService.onAuthStateChange(setCurrentUser);
    }
    setCurrentUser(AuthService.getCurrentUser());
  }, []);

  useEffect(() => {
    if (!selectedReportId) { setStatusHistories([]); return; }
    const report = reports.find(r => r.id === selectedReportId);
    if (!report) return;
    if (isSupabaseConfigured) SupabaseReportService.getStatusHistories(report.id).then(setStatusHistories).catch(console.error);
    else setStatusHistories(ReportStorageService.getStatusHistories(report.id));
  }, [selectedReportId, reports]);

  const showToast = (msg: string) => { setToastMessage(msg); window.setTimeout(() => setToastMessage(null), 3500); };
  const handleOpenAuth = (mode: 'login'|'signup') => { setAuthModalMode(mode); setAuthModalOpen(true); };
  const handleAuthSuccess = (user: CitizenUser) => { setCurrentUser(user); showToast(`Welcome, ${user.name}!`); };
  const handleLogoutUser = async () => { try { if (isSupabaseConfigured) await SupabaseAuthService.logout(); else AuthService.logout(); setCurrentUser(null); showToast('You have been logged out.'); } catch (e) { showToast(e instanceof Error ? e.message : 'Logout failed.'); } };
  const handleNavigate = (view: string, reportId?: string) => { if (reportId) setSelectedReportId(reportId); setCurrentView(view); window.scrollTo({top:0,behavior:'smooth'}); };
  const handleSelectReport = (report: CivicReport) => { setSelectedReportId(report.id); setCurrentView('report-detail'); window.scrollTo({top:0,behavior:'smooth'}); };

  const handleCreateReport = async (newReport: Omit<CivicReport,'id'|'createdAt'|'updatedAt'|'status'>): Promise<CivicReport> => {
    const created = isSupabaseConfigured ? await SupabaseReportService.createReport(newReport) : ReportStorageService.createReport(newReport);
    await loadReports(); showToast(`Report ${created.id} logged successfully!`); return created;
  };
  const handleUpdateReport = async (id: string, updates: Partial<CivicReport>) => {
    if (isSupabaseConfigured) await SupabaseReportService.updateReport(id, updates); else ReportStorageService.updateReport(id, updates);
    await loadReports(); showToast(`Report ${id} updated.`); return reports.find(r=>r.id===id) || null;
  };
  const handleUpdateStatus = async (reportId: string, newStatus: ReportStatus, notes: string, changedBy: string) => {
    if (isSupabaseConfigured) await SupabaseReportService.updateReportStatus(reportId,newStatus,notes,changedBy); else ReportStorageService.updateReportStatus(reportId,newStatus,notes,changedBy);
    await loadReports(); showToast(`Status updated to ${newStatus}.`); return null;
  };
  const handleDeleteReport = async (id: string) => { if (isSupabaseConfigured) await SupabaseReportService.deleteReport(id); else ReportStorageService.deleteReport(id); await loadReports(); if(selectedReportId===id){setSelectedReportId(null);setCurrentView('reports');} showToast(`Report ${id} removed.`); };
  const handleResetDemo = () => { if (!isSupabaseConfigured) { ReportStorageService.resetToDemoData(); loadReports(); showToast('Sample dataset restored.'); } else showToast('Demo reset is disabled for the live Supabase database.'); };
  const handleExportData = () => { const data = JSON.stringify({version:'3.0',exportedAt:new Date().toISOString(),reports},null,2); const blob=new Blob([data],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`letsfix_civic_data_${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url); };
  const handleLoginAdmin = () => { setIsAdmin(true); localStorage.setItem('letsfix_admin_logged_in','true'); setCurrentView('admin'); showToast('Authenticated as Municipal Operations Officer.'); };
  const handleLogoutAdmin = () => { setIsAdmin(false); localStorage.removeItem('letsfix_admin_logged_in'); showToast('Logged out of Admin Portal.'); };
  const handleTrackComplaintId = (queryId: string) => { const clean=queryId.trim().toUpperCase(); const match=reports.find(r=>r.id.toUpperCase()===clean || r.complaintId?.toUpperCase()===clean || r.dispatchTicketNumber?.toUpperCase()===clean); if(match){setSelectedReportId(match.id);setCurrentView('report-detail');}else showToast(`Complaint ID "${queryId}" not found.`); };

  const selectedReport = selectedReportId ? reports.find(r=>r.id===selectedReportId) || null : null;
  return <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
    {toastMessage && <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl">{toastMessage}</div>}
    <Navbar currentView={currentView} onNavigate={handleNavigate} isAdmin={isAdmin} onToggleAdmin={()=>handleNavigate('admin')} onTrackComplaintId={handleTrackComplaintId} currentUser={currentUser} onOpenAuth={handleOpenAuth} onLogout={handleLogoutUser}/>
    <main className="flex-1">
      {currentView==='home' && <HomePage reports={reports} onNavigate={handleNavigate} onSelectReport={handleSelectReport} onTrackComplaintId={handleTrackComplaintId}/>} 
      {currentView==='map' && <ExploreMapPage reports={reports} onSelectReport={handleSelectReport} onNavigateToReport={id=>handleNavigate('report-detail',id)}/>} 
      {currentView==='reports' && <AllReportsPage reports={reports} onSelectReport={handleSelectReport} onNavigateToReport={id=>handleNavigate('report-detail',id)} onNavigateToNewReport={()=>handleNavigate('report-issue')} currentUser={currentUser} onOpenAuth={handleOpenAuth}/>} 
      {currentView==='report-issue' && <ReportIssuePage onSubmitReport={handleCreateReport} onNavigateToReport={id=>handleNavigate('report-detail',id)} onNavigate={handleNavigate} currentUser={currentUser} onOpenAuth={handleOpenAuth}/>} 
      {currentView==='report-detail' && (selectedReport ? <ReportDetailPage report={selectedReport} statusHistories={statusHistories} onBack={()=>handleNavigate('reports')} isAdmin={isAdmin} onUpdateStatus={handleUpdateStatus} onOpenAdminModal={()=>handleNavigate('admin')}/> : <div className="p-20 text-center">Report not found.</div>)}
      {currentView==='dashboard' && <AnalyticsDashboard reports={reports} onNavigateToCategory={()=>handleNavigate('map')}/>} 
      {currentView==='admin' && <AdminDashboard reports={reports} isAdmin={isAdmin} onLogin={handleLoginAdmin} onLogout={handleLogoutAdmin} onUpdateReport={handleUpdateReport} onUpdateReportStatus={handleUpdateStatus} onDeleteReport={handleDeleteReport} onNavigateToReport={id=>handleNavigate('report-detail',id)} onResetDemoData={handleResetDemo} onExportData={handleExportData}/>} 
      {currentView==='about' && <AboutPage onNavigate={handleNavigate}/>} 
    </main>
    <AuthModal isOpen={authModalOpen} initialMode={authModalMode} onClose={()=>setAuthModalOpen(false)} onSuccess={handleAuthSuccess}/>
    <Footer onNavigate={handleNavigate} onResetDemo={handleResetDemo} isAdmin={isAdmin} onOpenAdmin={()=>handleNavigate('admin')}/>
  </div>;
}
