import React, { useState, useEffect } from 'react';
import { Camera, Navigation2, Send, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { CivicReport, IssueCategory, SeverityLevel } from '../../types';
import { ISSUE_CATEGORIES } from '../../constants/config';
import { CivicMap } from '../map/CivicMap';

interface ReportIssuePageProps {
  onSubmitReport: (newReport: Omit<CivicReport, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<CivicReport>;
  onNavigateToReport: (reportId: string) => void;
  onNavigate: (view: string) => void;
  currentUser?: any;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
}

export const ReportIssuePage: React.FC<ReportIssuePageProps> = ({ onSubmitReport, onNavigateToReport, onNavigate, currentUser }) => {
  const [title, setTitle] = useState(''); const [category, setCategory] = useState<IssueCategory>('roads_potholes'); const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [description, setDescription] = useState(''); const [suggestedSolution, setSuggestedSolution] = useState(''); const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState(19.0760); const [longitude, setLongitude] = useState(72.8777); const [dateObserved, setDateObserved] = useState(new Date().toISOString().split('T')[0]);
  const [reporterName, setReporterName] = useState(''); const [imagePreview, setImagePreview] = useState(''); const [geoLocating, setGeoLocating] = useState(false); const [geoMessage, setGeoMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({}); const [isSubmitting, setIsSubmitting] = useState(false); const [submittedReport, setSubmittedReport] = useState<CivicReport | null>(null);
  const selectedCategoryInfo = ISSUE_CATEGORIES[category] || ISSUE_CATEGORIES.other;
  useEffect(() => { if (currentUser) setReporterName(currentUser.name || ''); }, [currentUser]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setImagePreview(String(reader.result)); reader.readAsDataURL(file); };
  const handleApplyPreset = () => { setTitle('Hazardous Road Pothole near School Crossing'); setCategory('roads_potholes'); setSeverity('high'); setDescription('A large pothole is creating a safety hazard for vehicles and pedestrians.'); setSuggestedSolution('Repair and resurface the damaged road section.'); setLocationName('Main Road, Central Ward'); setImagePreview('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80'); };
  const handleGeolocation = () => { if (!navigator.geolocation) { setGeoMessage('Geolocation is not supported.'); return; } setGeoLocating(true); navigator.geolocation.getCurrentPosition(p => { setLatitude(Number(p.coords.latitude.toFixed(6))); setLongitude(Number(p.coords.longitude.toFixed(6))); setGeoLocating(false); setGeoMessage('GPS location detected.'); }, () => { setGeoLocating(false); setGeoMessage('Unable to detect GPS location.'); }); };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); const newErrors: Record<string,string> = {};
    if (!title.trim() || title.trim().length < 5) newErrors.title = 'Complaint title must be at least 5 characters.';
    if (!imagePreview) newErrors.image = 'A photograph of the defect is required.';
    if (!locationName.trim()) newErrors.locationName = 'Location is required.';
    if (!description.trim() || description.trim().length < 15) newErrors.description = 'Description must be at least 15 characters.';
    if (!suggestedSolution.trim()) newErrors.suggestedSolution = 'Recommended action is required.';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setIsSubmitting(true); setErrors({});
    try { const created = await onSubmitReport({ title: title.trim(), category, locationName: locationName.trim(), latitude, longitude, severity, description: description.trim(), suggestedSolution: suggestedSolution.trim(), dateObserved, imageUrl: imagePreview, reporterName: reporterName.trim() || 'Anonymous Citizen' }); setSubmittedReport(created); }
    catch (err) { setErrors({ form: err instanceof Error ? err.message : 'Could not save the complaint.' }); }
    finally { setIsSubmitting(false); }
  };

  if (submittedReport) return <div className="max-w-3xl mx-auto px-4 py-10"><div className="bg-white rounded-2xl border p-8 text-center"><CheckCircle2 className="mx-auto w-12 h-12 text-emerald-600" /><h2 className="text-2xl font-bold mt-3">Complaint Submitted</h2><p className="text-sm text-slate-500 mt-2">Your complaint is now stored in the civic database.</p><div className="mt-6 p-4 bg-slate-50 rounded-xl"><div className="text-[10px] uppercase font-bold text-slate-500">Complaint ID</div><div className="font-mono font-bold mt-1">{submittedReport.complaintId || submittedReport.id}</div></div><button onClick={() => onNavigateToReport(submittedReport.id)} className="mt-6 w-full py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold">View Complaint</button></div></div>;

  return <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
    <div className="flex justify-between items-center"><div><h1 className="text-2xl font-extrabold">Report Civic Issue</h1><p className="text-xs text-slate-500">Submit a location-based infrastructure complaint.</p></div><button type="button" onClick={handleApplyPreset} className="px-3 py-1.5 bg-slate-100 border rounded-lg text-xs font-semibold"><Sparkles className="inline w-3.5 h-3.5 mr-1" />Demo</button></div>
    <div className="bg-slate-900 text-white rounded-xl p-4"><div className="text-[10px] uppercase font-bold text-teal-300">Municipal Authority</div><div className="text-xs font-bold mt-1">{selectedCategoryInfo.concernedDepartment}</div></div>
    {errors.form && <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700"><AlertCircle className="inline w-4 h-4 mr-2" />{errors.form}</div>}
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-6 sm:p-8 space-y-6">
      <div><label className="block text-xs font-bold uppercase mb-2">Photographic Evidence *</label>{imagePreview ? <div className="relative"><img src={imagePreview} alt="Evidence" className="w-full max-w-lg h-64 object-cover rounded-xl" /><button type="button" onClick={() => setImagePreview('')} className="absolute top-2 right-2 bg-rose-600 text-white px-3 py-1 rounded-lg text-xs">Remove</button></div> : <div className="border-2 border-dashed rounded-xl p-8 text-center"><input id="photo" type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" /><label htmlFor="photo" className="cursor-pointer"><Camera className="mx-auto w-8 h-8 text-teal-600" /><span className="text-xs font-bold">Upload or capture photo</span></label></div>}{errors.image && <p className="text-xs text-rose-600 mt-1">{errors.image}</p>}</div>
      <div className="grid sm:grid-cols-2 gap-4"><select value={category} onChange={e=>setCategory(e.target.value as IssueCategory)} className="w-full py-2.5 px-3 bg-slate-50 border rounded-lg text-xs">{Object.entries(ISSUE_CATEGORIES).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}</select><select value={severity} onChange={e=>setSeverity(e.target.value as SeverityLevel)} className="w-full py-2.5 px-3 bg-slate-50 border rounded-lg text-xs"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Complaint title" className="w-full py-2.5 px-3 bg-slate-50 border rounded-lg text-xs" />{errors.title && <p className="text-xs text-rose-600">{errors.title}</p>}
      <button type="button" onClick={handleGeolocation} disabled={geoLocating} className="text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg"><Navigation2 className="inline w-3.5 h-3.5 mr-1" />{geoLocating?'Acquiring GPS...':'Auto-Detect GPS'}</button>{geoMessage && <div className="text-xs text-slate-600">{geoMessage}</div>}
      <input value={locationName} onChange={e=>setLocationName(e.target.value)} placeholder="Street address / landmark" className="w-full py-2.5 px-3 bg-slate-50 border rounded-lg text-xs" />{errors.locationName && <p className="text-xs text-rose-600">{errors.locationName}</p>}
      <CivicMap reports={[]} selectableLocation selectedCoordinates={[latitude,longitude]} onLocationSelected={(lat,lng)=>{setLatitude(lat);setLongitude(lng)}} center={[latitude,longitude]} zoom={14} height="280px" />
      <div className="grid grid-cols-2 gap-4"><input type="number" step="any" value={latitude} onChange={e=>setLatitude(parseFloat(e.target.value)||0)} className="w-full py-2 px-3 bg-slate-50 border rounded-lg text-xs" /><input type="number" step="any" value={longitude} onChange={e=>setLongitude(parseFloat(e.target.value)||0)} className="w-full py-2 px-3 bg-slate-50 border rounded-lg text-xs" /></div>
      <input type="date" value={dateObserved} onChange={e=>setDateObserved(e.target.value)} className="w-full py-2.5 px-3 bg-slate-50 border rounded-lg text-xs" />
      <textarea rows={4} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe the problem" className="w-full py-2.5 px-3 bg-slate-50 border rounded-lg text-xs" />{errors.description && <p className="text-xs text-rose-600">{errors.description}</p>}
      <textarea rows={3} value={suggestedSolution} onChange={e=>setSuggestedSolution(e.target.value)} placeholder="Recommended municipal action" className="w-full py-2.5 px-3 bg-slate-50 border rounded-lg text-xs" />{errors.suggestedSolution && <p className="text-xs text-rose-600">{errors.suggestedSolution}</p>}
      <input value={reporterName} onChange={e=>setReporterName(e.target.value)} placeholder="Reporter name (optional)" className="w-full py-2.5 px-3 bg-slate-50 border rounded-lg text-xs" />
      <div className="flex justify-end gap-3"><button type="button" onClick={()=>onNavigate('home')} className="px-4 py-2.5 border rounded-xl text-xs font-semibold">Cancel</button><button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold disabled:opacity-50"><Send className="inline w-3.5 h-3.5 mr-2" />{isSubmitting?'Saving...':'Submit Complaint'}</button></div>
    </form>
  </div>;
};
