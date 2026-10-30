import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Navigation2, Send, AlertCircle, Info, Building2, Sparkles } from 'lucide-react';
import { CivicReport, IssueCategory, SeverityLevel } from '../../types';
import { ISSUE_CATEGORIES, SEVERITY_LEVELS } from '../../constants/config';
import { CivicMap } from '../map/CivicMap';

interface ReportIssuePageProps {
  onSubmitReport: (newReport: Omit<CivicReport, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<CivicReport>;
  onNavigateToReport: (reportId: string) => void;
  onNavigate: (view: string) => void;
  currentUser?: any;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
}

export const ReportIssuePage: React.FC<ReportIssuePageProps> = ({ onSubmitReport, onNavigateToReport, onNavigate, currentUser, onOpenAuth }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IssueCategory>('roads_potholes');
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [description, setDescription] = useState('');
  const [suggestedSolution, setSuggestedSolution] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState(19.0760);
  const [longitude, setLongitude] = useState(72.8777);
  const [dateObserved, setDateObserved] = useState(new Date().toISOString().split('T')[0]);
  const [reporterName, setReporterName] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoMessage, setGeoMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<CivicReport | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const selectedCategoryInfo = ISSUE_CATEGORIES[category] || ISSUE_CATEGORIES.other;

  useEffect(() => { if (currentUser) setReporterName(currentUser.name || ''); }, [currentUser]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = () => {
    setTitle('Hazardous Road Pothole near School Crossing');
    setCategory('roads_potholes'); setSeverity('high');
    setDescription('A large pothole is creating a safety hazard for vehicles and pedestrians.');
    setSuggestedSolution('Repair and resurface the damaged road section.');
    setLocationName('Main Road, Central Ward');
    setImagePreview('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80');
    setImageFileName('demo-pothole.jpg');
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) { setGeoMessage('Geolocation is not supported by this browser.'); return; }
    setGeoLocating(true); setGeoMessage('Acquiring GPS location...');
    navigator.geolocation.getCurrentPosition(
      pos => { setLatitude(Number(pos.coords.latitude.toFixed(6))); setLongitude(Number(pos.coords.longitude.toFixed(6))); setGeoLocating(false); setGeoMessage('GPS location detected successfully.'); },
      () => { setGeoLocating(false); setGeoMessage('Unable to detect your location. Please select the point on the map.'); }
    );
  };

  const handleMapLocationSelect = (lat: number, lng: number) => { setLatitude(lat); setLongitude(lng); setGeoMessage(`Coordinates selected on map: ${lat}, ${lng}`); };
  const handleCopyComplaintId = (id: string) => { navigator.clipboard.writeText(id); setCopiedId(true); setTimeout(() => setCopiedId(false), 2000); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 5) newErrors.title = 'Complaint title is required and must be at least 5 characters.';
    if (!imagePreview) newErrors.image = 'A photograph of the defect is required for authority verification.';
    if (!locationName.trim()) newErrors.locationName = 'Location name or street address is required.';
    if (isNaN(latitude) || latitude < -90 || latitude > 90) newErrors.latitude = 'Valid latitude is required.';
    if (isNaN(longitude) || longitude < -180 || longitude > 180) newErrors.longitude = 'Valid longitude is required.';
    if (!description.trim() || description.trim().length < 15) newErrors.description = 'Please provide at least 15 characters describing the problem.';
    if (!suggestedSolution.trim()) newErrors.suggestedSolution = 'Please specify the recommended corrective action.';
    if (!dateObserved) newErrors.dateObserved = 'Observation date is required.';
    if (Object.keys(newErrors).length) { setErrors(newErrors); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setIsSubmitting(true); setErrors({});
    try {
      const created = await onSubmitReport({ title: title.trim(), category, locationName: locationName.trim(), latitude, longitude, severity, description: description.trim(), suggestedSolution: suggestedSolution.trim(), dateObserved, imageUrl: imagePreview, reporterName: reporterName.trim() || 'Anonymous Citizen' });
      setSubmittedReport(created); window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { console.error(err); setErrors({ form: err instanceof Error ? err.message : 'An error occurred while saving the complaint. Please retry.' }); }
    finally { setIsSubmitting(false); }
  };

  if (submittedReport) {
    const cat = ISSUE_CATEGORIES[submittedReport.category] || ISSUE_CATEGORIES.other;
    const complaintId = submittedReport.complaintId || submittedReport.id;
    const ticketNo = submittedReport.dispatchTicketNumber || `MUNI-DSP-${complaintId.replace('LF-', '')}`;
    return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6"><div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8"><div className="text-center"><div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4"><CheckCircle2 className="w-8 h-8" /></div><h2 className="text-2xl font-bold">Complaint Submitted Successfully</h2><p className="text-sm text-slate-500 mt-2">Your complaint has been saved to the Let'sFix civic database.</p></div><div className="mt-8 grid sm:grid-cols-2 gap-4"><div className="p-4 rounded-xl bg-slate-50"><div className="text-[10px] uppercase font-bold text-slate-500">Complaint ID</div><div className="font-mono font-bold mt-1">{complaintId}</div><button onClick={() => handleCopyComplaintId(complaintId)} className="text-xs text-teal-700 mt-2">{copiedId ? 'Copied' : 'Copy ID'}</button></div><div className="p-4 rounded-xl bg-slate-50"><div className="text-[10px] uppercase font-bold text-slate-500">Dispatch Ticket</div><div className="font-mono font-bold mt-1">{ticketNo}</div></div></div><div className="mt-6 p-4 rounded-xl border border-teal-100 bg-teal-50"><div className="text-xs font-bold text-teal-900">{cat.concernedDepartment}</div><div className="text-xs text-teal-800 mt-1">Response window: {cat.slaHours} hours</div></div><div className="mt-6 flex gap-3"><button onClick={() => onNavigateToReport(submittedReport.id)} className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold">View Complaint</button><button onClick={() => onNavigate('home')} className="px-5 py-2.5 border rounded-xl text-xs font-bold">Home</button></div></div></div>;
  }

  return <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h1 className="text-2xl font-extrabold">Report Civic Issue</h1><p className="text-xs text-slate-500 mt-1">Submit a location-based infrastructure complaint.</p></div><button type="button" onClick={handleApplyPreset} className="self-start px-3 py-1.5 bg-slate-100 border rounded-lg text-xs font-semibold"><Sparkles className="inline w-3.5 h-3.5 mr-1" />Fill Demo Complaint</button></div>
    <div className="bg-slate-900 text-white rounded-xl p-4"><div className="text-[10px] uppercase font-bold text-teal-300">Designated Municipal Authority</div><div className="text-xs font-bold mt-1">{selectedCategoryInfo.concernedDepartment}</div><div className="text-[11px] text-slate-300 mt-1">Guaranteed Response Window: {selectedCategoryInfo.slaHours} hours SLA</div></div>
    {errors.form && <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700"><AlertCircle className="inline w-4 h-4 mr-2" />{errors.form}</div>}
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
      <div><label className="block text-xs font-bold uppercase mb-3">1. Photographic Evidence *</label>{imagePreview ? <div className="relative max-w-lg"><img src={imagePreview} alt="Evidence" className="w-full h-64 object-cover rounded-xl" /><button type="button" onClick={() => { setImagePreview(''); setImageFileName(''); }} className="absolute top-2 right-2 bg-rose-600 text-white px-3 py-1 rounded-lg text-xs">Remove</button></div> : <div className="border-2 border-dashed rounded-xl p-8 text-center"><input id="photo-upload" type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" /><label htmlFor="photo-upload" className="cursor-pointer block"><Camera className="mx-auto w-8 h-8 text-teal-600 mb-2" /><span className="text-xs font-bold">Click to upload or capture defect photo</span></label></div>}{errors.image && <p className="text-xs text-rose-600 mt-2">{errors.image}</p>}</div>
      <div className="space-y-4"><label className="block text-xs font-bold uppercase">2. Defect Classification & Severity *</label><div className="grid sm:grid-cols-2 gap-4"><select value={category} onChange={e => setCategory(e.target.value as IssueCategory)} className="w-full py-2.5 px-3 bg-slate-50 border rounded-lg text-xs">{Object.entries(ISSUE_CATEGORIES).map(([key, info]) => <option key={key} value={key}>{info.name}</option>)}</select><select value={severity} onChange={e => setSeverity(e.target.value as SeverityLevel)} className="w-full py-2.5 px-3 bg-slate-50 border rounded-lg text-xs"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Complaint subject / title" className="w-full py-2.5 px-3 bg-slate-50 border rounded-lg text-xs" />{errors.title && <p className="text-xs text-rose-600">{errors.title}</p>}</div>
      <div className="space-y-4"><label className="block text-xs font-bold uppercase">3. Defect Location & GPS Coordinates *</label><button type="button" onClick={handleGeolocation} disabled={geoLocating} className="text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg"><Navigation2 className="inline w-3.5 h-3.5 mr-1" />{geoLocating ? 'Acquiring GPS...' : 'Auto-Detect via GPS'}</button>{geoMessage && <div className="text-xs text-slate-600">{geoMessage}</div>}<input value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="Street address / landmark" className="w-full py-2.5 px-3 bg-slate-50 border rounded-lg text-xs" />{errors.locationName && <p className="text-xs text-rose-600">{errors.locationName}</p>}<CivicMap reports={[]} selectableLocation selectedCoordinates={[latitude, longitude]} onLocationSelected={handleMapLocationSelect} center={[latitude, longitude]} zoom={14} height="280px" /><div className="grid grid-cols-2 gap-4"><input type="number" step="any" value={latitude} onChange={e => setLatitude(parseFloat(e.target.value) || 0)} className="w-full py-2 px-3 bg-slate-50 border rounded-lg text-xs" /><input type="number" step="any" value={longitude} onChange={e => setLongitude(parseFloat(e.target.value) || 0)} className="w-full py-2 px-3 bg-slate-50 border rounded-lg text-xs" /></div></div>
      <div className="space-y-4"><label className="block text-xs font-bold uppercase">4. Problem Narrative & Action Required *</label><input type="date" value={dateObserved} onChange={e => setDateObserved(e.target.value)} className="w-full py-2.5 px-3 bg-slate-50 border rounded-lg text-xs" /><textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the problem" className="w-full py-2.5 px-3 bg-slate-50 border rounded-lg text-xs" />{errors.description && <p className="text-xs text-rose-600">{errors.description}</p>}<textarea rows={3} value={suggestedSolution} onChange={e => setSuggestedSolution(e.target.value)} placeholder="Recommended municipal action" className="w-full py-2.5 px-3 bg-slate-50 border rounded-lg text-xs" />{errors.suggestedSolution && <p className="text-xs text-rose-600">{errors.suggestedSolution}</p>}<input value={reporterName} onChange={e => setReporterName(e.target.value)} placeholder="Reporter name (optional)" className="w-full py-2.5 px-3 bg-slate-50 border rounded-lg text-xs" /></div>
      <div className="pt-6 border-t flex justify-end gap-3"><button type="button" onClick={() => onNavigate('home')} className="px-4 py-2.5 border rounded-xl text-xs font-semibold">Cancel</button><button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold disabled:opacity-50"><Send className="inline w-3.5 h-3.5 mr-2" />{isSubmitting ? 'Saving...' : 'Submit Official Complaint'}</button></div>
    </form>
  </div>;
};
