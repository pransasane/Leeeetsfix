import React, { useState } from 'react';
import { 
  Upload, 
  MapPin, 
  Navigation2, 
  Camera, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw,
  Info,
  Calendar,
  Sparkles,
  ShieldCheck,
  Building2,
  Copy,
  Check,
  Printer,
  Clock,
  Send,
  FileCheck2
} from 'lucide-react';
import { CivicReport, IssueCategory, SeverityLevel, CitizenUser } from '../../types';
import { ISSUE_CATEGORIES, SEVERITY_LEVELS } from '../../constants/config';
import { CivicMap } from '../map/CivicMap';

interface ReportIssuePageProps {
  onSubmitReport: (newReport: Omit<CivicReport, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => CivicReport;
  onNavigateToReport: (reportId: string) => void;
  onNavigate: (view: string) => void;
  currentUser?: CitizenUser | null;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
}

export const ReportIssuePage: React.FC<ReportIssuePageProps> = ({
  onSubmitReport,
  onNavigateToReport,
  onNavigate,
  currentUser,
  onOpenAuth
}) => {
  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IssueCategory>('roads_potholes');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number>(37.7749);
  const [longitude, setLongitude] = useState<number>(-122.4194);
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [description, setDescription] = useState('');
  const [suggestedSolution, setSuggestedSolution] = useState('');
  const [dateObserved, setDateObserved] = useState(new Date().toISOString().split('T')[0]);
  const [reporterName, setReporterName] = useState(currentUser?.name || '');

  // Keep reporter name synced when user logs in or out
  React.useEffect(() => {
    if (currentUser?.name) {
      setReporterName(currentUser.name);
    }
  }, [currentUser]);
  
  // Photo states
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  
  // Validation & Submission
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<CivicReport | null>(null);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const selectedCategoryInfo = ISSUE_CATEGORIES[category] || ISSUE_CATEGORIES.other;

  // Sample presets for quick testing
  const samplePresets: Record<IssueCategory, { title: string; image: string; location: string; desc: string; sol: string }> = {
    roads_potholes: {
      title: 'Deep Rim-Bending Pothole on Right Lane',
      image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
      location: 'Mission St & 22nd St, Mission District',
      desc: 'A significant crater pothole roughly 50cm in diameter with jagged asphalt edges. Vehicles swerve abruptly to avoid axle damage.',
      sol: 'Milling of damaged asphalt section and hot-mix bituminous infill compaction.'
    },
    footpaths: {
      title: 'Dislodged Concrete Sidewalk Flags near School',
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
      location: '1420 14th Avenue, Sunset District',
      desc: 'Multiple concrete footpath pavers shifted by mature tree roots, resulting in trip ledges over 4cm. Dangerous for students and wheelchairs.',
      sol: 'Excavate buckled concrete, shave surface root, install root barrier and relevel with permeable paving.'
    },
    streetlights: {
      title: 'Non-Functional LED Mast Light at Bus Stop',
      image: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1200&q=80',
      location: 'Geary Blvd & Park Presidio Blvd',
      desc: 'Luminaires on Pole #P-109 have been completely dark for over 10 days, leaving bus commuters in darkness.',
      sol: 'Test photocell and replace driver capacitor module.'
    },
    water_leakage: {
      title: 'Subsurface Water Leak Escaping onto Pavement',
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
      location: 'Bryant St near 6th St, SoMa',
      desc: 'Continuous clean water escaping between the curb gutter and asphalt, eroding road subgrade layers.',
      sol: 'Acoustic leak detection inspection and sleeve collar repair on municipal water main line.'
    },
    drainage: {
      title: 'Debris-Choked Stormwater Inlet and Basin',
      image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=80',
      location: 'Oak St & Laguna St, Hayes Valley',
      desc: 'Storm drain clogged with plastic debris, bottles, and decomposed wet leaves causing localized standing pool.',
      sol: 'Vacuum truck sump cleaning and mechanical silt trap clearing.'
    },
    garbage: {
      title: 'Overflowing Municipal Waste Receptacles and Illegal Dumping',
      image: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=1200&q=80',
      location: 'Natoma St Alleyway, South of Market',
      desc: 'Cardboard bundles, broken wooden pallets, and overflowing public trash bin attracting rodents.',
      sol: 'Emergency sanitation bulk clearance and placement of tamper-resistant high-capacity compacting bin.'
    },
    other: {
      title: 'Bent Steel Crash Barrier with Exposed Bolts',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      location: 'Portola Dr & Woodside Ave Curve',
      desc: 'Highway guardrail sheared off base post following minor vehicle scrape. Exposed steel flange poses hazard to pedestrians.',
      sol: 'Replace guardrail section W-beam and recalibrate shock absorbing end cap.'
    }
  };

  const handleApplyPreset = () => {
    const preset = samplePresets[category];
    if (preset) {
      setTitle(preset.title);
      setImagePreview(preset.image);
      setImageFileName('sample_photo.jpg');
      setLocationName(preset.location);
      setDescription(preset.desc);
      setSuggestedSolution(preset.sol);
      setErrors({});
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: 'Please upload a valid image file (JPEG, PNG, or WebP)' }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image size must be smaller than 10MB' }));
      return;
    }

    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.image;
        return copy;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoMessage('Browser geolocation is not supported on this device.');
      return;
    }

    setGeoLocating(true);
    setGeoMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        setGeoLocating(false);
        setGeoMessage(`GPS locked: ${lat}, ${lng} (Accuracy: ±${Math.round(position.coords.accuracy)}m)`);
        if (!locationName) {
          setLocationName(`Coordinates ${lat.toFixed(3)}, ${lng.toFixed(3)}`);
        }
      },
      (error) => {
        setGeoLocating(false);
        setGeoMessage(`Geolocation error: ${error.message}. Please click on the map to set location.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setGeoMessage(`Coordinates selected on map: ${lat}, ${lng}`);
    if (!locationName) {
      setLocationName(`Coordinates ${lat}, ${lng}`);
    }
  };

  const handleCopyComplaintId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Complaint title is required.';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters.';
    }

    if (!imagePreview) {
      newErrors.image = 'A photograph of the defect is required for authority verification.';
    }

    if (!locationName.trim()) {
      newErrors.locationName = 'Location name or street address is required.';
    }

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      newErrors.latitude = 'Valid latitude (-90 to 90) is required.';
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      newErrors.longitude = 'Valid longitude (-180 to 180) is required.';
    }

    if (!description.trim()) {
      newErrors.description = 'Detailed description is required.';
    } else if (description.trim().length < 15) {
      newErrors.description = 'Please provide at least 15 characters describing the problem.';
    }

    if (!suggestedSolution.trim()) {
      newErrors.suggestedSolution = 'Please specify the recommended corrective action for the department.';
    }

    if (!dateObserved) {
      newErrors.dateObserved = 'Observation date is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const created = onSubmitReport({
        title: title.trim(),
        category,
        locationName: locationName.trim(),
        latitude,
        longitude,
        severity,
        description: description.trim(),
        suggestedSolution: suggestedSolution.trim(),
        dateObserved,
        imageUrl: imagePreview,
        reporterName: reporterName.trim() || 'Anonymous Citizen'
      });

      setSubmittedReport(created);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to submit complaint:', err);
      setIsSubmitting(false);
      setErrors({ form: 'An error occurred while saving the complaint. Please retry.' });
    }
  };

  // -------------------------------------------------------------
  // CONFIRMATION SCREEN: OFFICIAL COMPLAINT RECEIPT & DOCKET
  // -------------------------------------------------------------
  if (submittedReport) {
    const cat = ISSUE_CATEGORIES[submittedReport.category] || ISSUE_CATEGORIES.other;
    const sev = SEVERITY_LEVELS[submittedReport.severity] || SEVERITY_LEVELS.medium;
    const complaintId = submittedReport.complaintId || submittedReport.id;
    const ticketNo = submittedReport.dispatchTicketNumber || `MUNI-DSP-2026-${complaintId.replace('LF-', '')}`;
    const departmentName = submittedReport.concernedDepartment || cat.concernedDepartment;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        
        {/* Official Transmission Banner */}
        <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-xl overflow-hidden">
          
          {/* Header Seal */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white mx-auto flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-9 h-9 text-emerald-300" />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/40 text-emerald-100 text-xs font-bold uppercase tracking-wider border border-emerald-400/30">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Forwarded to Concerned Authority</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Complaint Registered Successfully
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto leading-relaxed">
              Your report has been verified and directly transmitted to the responsible municipal department for immediate site inspection.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* PROMINENT COMPLAINT ID DISPLAY */}
            <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 text-center space-y-2 relative overflow-hidden">
              <div className="text-[11px] font-bold text-teal-400 uppercase tracking-widest">
                Official Citizen Complaint ID
              </div>
              
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-wider">
                  {complaintId}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyComplaintId(complaintId)}
                  className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Copy Complaint ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                <strong className="text-slate-200">Save this Complaint ID:</strong> You can use it anytime in the top search bar to check live updates, officer notes, and work order progress.
              </p>
            </div>

            {/* AUTHORITY DISPATCH DETAILS CARD */}
            <div className="border border-slate-200 rounded-xl bg-slate-50/70 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Concerned Municipal Authority Details
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                  Status: Transmitted
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Concerned Department:</span>
                  <span className="font-bold text-slate-900 leading-snug">{departmentName}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Municipal Dispatch Ticket:</span>
                  <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {ticketNo}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Official SLA Commitment:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Inspection within {cat.slaHours} Hours</span>
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Intake Timestamp:</span>
                  <span className="font-medium text-slate-800">{new Date(submittedReport.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate"><strong>Logged Location:</strong> {submittedReport.locationName}</span>
              </div>
            </div>

            {/* PREVIEW OF SUBMITTED EVIDENCE */}
            <div className="flex gap-4 items-center p-3 bg-white border border-slate-200 rounded-xl">
              <img
                src={submittedReport.imageUrl}
                alt={submittedReport.title}
                className="w-20 h-20 rounded-lg object-cover bg-slate-100 flex-shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-1 text-xs">
                <div className="font-bold text-slate-900 text-sm truncate">{submittedReport.title}</div>
                <p className="text-slate-500 line-clamp-1">{submittedReport.description}</p>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-600 font-medium">{cat.name}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-bold uppercase text-[10px]" style={{ color: sev.color }}>
                    {sev.name} Severity
                  </span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => onNavigateToReport(complaintId)}
                className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold text-center cursor-pointer shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Track Complaint Status Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold text-center cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Acknowledgment Slip</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubmittedReport(null);
                  setTitle('');
                  setImagePreview('');
                  setDescription('');
                  setSuggestedSolution('');
                  setLocationName('');
                }}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold text-center cursor-pointer transition-colors"
              >
                File Another
              </button>
            </div>

          </div>
        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // COMPLAINT REGISTRATION FORM
  // -------------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Official Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                Official Municipal Civic Grievance System
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              File a Civic Infrastructure Complaint
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Document infrastructure defects with verified photographic evidence and GPS coordinates for direct dispatch to municipal authorities.
            </p>
          </div>

          <button
            type="button"
            onClick={handleApplyPreset}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-teal-50 text-slate-800 hover:text-teal-800 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            title="Auto-fill with sample demonstration complaint for quick testing"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Fill Demo Complaint</span>
          </button>
        </div>
      </div>

      {/* AUTHORITY DISPATCH PREVIEW BANNER */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-4 border border-slate-700 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-teal-300 tracking-wider">
              Designated Municipal Authority
            </div>
            <div className="text-xs font-bold text-white">
              {selectedCategoryInfo.concernedDepartment}
            </div>
            <div className="text-[11px] text-slate-300">
              Guaranteed Response Window: {selectedCategoryInfo.slaHours} hours SLA
            </div>
          </div>
        </div>

        <div className="text-[11px] bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 self-stretch sm:self-auto text-center">
          ⚡ Direct Intake Gateway
        </div>
      </div>

      {/* Global Form Error Notice */}
      {errors.form && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* Main Complaint Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-8">
        
        {/* SECTION 1: Photograph Upload */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Photographic Evidence <span className="text-rose-600">*</span>
            </label>
            <span className="text-[11px] text-slate-500">
              Required for municipal engineering verification (JPG, PNG up to 10MB)
            </span>
          </div>

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 group max-w-lg">
              <img
                src={imagePreview}
                alt="Uploaded evidence"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <label className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-semibold cursor-pointer shadow-md hover:bg-slate-100">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    setImageFileName('');
                  }}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md hover:bg-rose-700"
                >
                  Remove
                </button>
              </div>
              <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded">
                {imageFileName || 'Attached Evidence'}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-8 text-center transition-colors bg-slate-50/50">
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  Click to upload or capture defect photo
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  Drag and drop photo or tap to open camera
                </span>
              </label>
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-center gap-2">
                <span className="text-[11px] text-slate-500">Testing on desktop?</span>
                <button
                  type="button"
                  onClick={handleApplyPreset}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 underline cursor-pointer"
                >
                  Load sample {selectedCategoryInfo.name} photo
                </button>
              </div>
            </div>
          )}

          {errors.image && (
            <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.image}</span>
            </p>
          )}
        </div>

        {/* SECTION 2: Category & Authority Routing */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            2. Defect Classification & Severity <span className="text-rose-600">*</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Infrastructure Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IssueCategory)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {Object.entries(ISSUE_CATEGORIES).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Severity Assessment
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="low">Low (Cosmetic, minor wear)</option>
                <option value="medium">Medium (Moderate wear, pedestrian impact)</option>
                <option value="high">High (Active hazard to pedestrians/vehicles)</option>
                <option value="critical">Critical (Immediate danger of severe injury/damage)</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Complaint Subject / Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hazardous Road Pothole near School Crossing"
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {errors.title && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* Observation Date & Citizen Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Date Observed <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                value={dateObserved}
                onChange={(e) => setDateObserved(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.dateObserved && (
                <p className="text-xs text-rose-600 mt-1">{errors.dateObserved}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">
                  Complainant Name / Identity (Optional)
                </label>
                {currentUser && (
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Verified Citizen Account
                  </span>
                )}
              </div>

              {currentUser ? (
                <div className="mb-2 p-2 bg-teal-50/70 border border-teal-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center">
                      {currentUser.name.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-slate-900">
                      Linking report to: <span className="font-bold text-teal-800">{currentUser.name}</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{currentUser.ward}</span>
                </div>
              ) : (
                onOpenAuth && (
                  <div className="mb-2 p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-[11px] text-slate-600">
                    <span>Have an account? Link this complaint to your profile:</span>
                    <button
                      type="button"
                      onClick={() => onOpenAuth('login')}
                      className="font-bold text-teal-700 hover:underline cursor-pointer"
                    >
                      Login / SignUp
                    </button>
                  </div>
                )
              )}

              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="e.g. Elena R. or Leave Blank for Anonymous"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Geographic Coordinates & Map */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              3. Defect Location & GPS Coordinates <span className="text-rose-600">*</span>
            </label>

            <button
              type="button"
              onClick={handleGeolocation}
              disabled={geoLocating}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 cursor-pointer disabled:opacity-50"
            >
              <Navigation2 className="w-3.5 h-3.5 text-teal-600" />
              <span>{geoLocating ? 'Acquiring GPS...' : 'Auto-Detect via GPS'}</span>
            </button>
          </div>

          {geoMessage && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
              <span>{geoMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Street Address / Landmark <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Near 450 Valencia St, between 15th & 16th St"
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {errors.locationName && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.locationName}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Click anywhere on map to position pin</span>
              <span>Latitude: {latitude}, Longitude: {longitude}</span>
            </div>

            <CivicMap
              reports={[]}
              selectableLocation={true}
              selectedCoordinates={[latitude, longitude]}
              onLocationSelected={handleMapLocationSelect}
              center={[latitude, longitude]}
              zoom={14}
              height="280px"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Latitude (°N)
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Longitude (°W)
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Description & Proposed Action */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            4. Problem Narrative & Action Required <span className="text-rose-600">*</span>
          </label>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Factual Defect Description <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State dimensions, traffic/pedestrian risks, duration of problem, and safety hazards..."
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
            />
            {errors.description && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Recommended Municipal Action <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={3}
              value={suggestedSolution}
              onChange={(e) => setSuggestedSolution(e.target.value)}
              placeholder="Specify recommended fix (e.g. asphalt patching, ballast replacement, pipe clamp, manhole casting)"
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
            />
            {errors.suggestedSolution && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.suggestedSolution}</span>
              </p>
            )}
          </div>
        </div>

        {/* Form Submission */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            <span>Official submission will generate a unique Complaint ID and Municipal Dispatch Ticket.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Transmitting to Authority...' : 'Submit Official Complaint'}</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
