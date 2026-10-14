import React from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  Users, 
  Database, 
  Lock, 
  CheckCircle2, 
  Heart, 
  Globe2, 
  FileCode2, 
  ArrowRight,
  Building2,
  Navigation2
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (view: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Hero / Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
          <span>Civic-Tech Transparency Manifesto</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Empowering Communities to Fix What Matters
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Let'sFix is an open, evidence-based civic infrastructure reporting platform designed to transform how citizens, field surveyors, and public works authorities identify, prioritise, and solve neighbourhood defects.
        </p>
      </div>

      {/* Core Mission & Tagline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="text-xs font-bold text-teal-600 uppercase tracking-wider">
            Our Tagline
          </div>
          <div className="text-2xl font-black text-slate-900">
            Identify. Report. Improve.
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            A continuous community loop where localized defects are made visible before they cause accidents or major asset decay.
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="text-xs font-bold text-teal-600 uppercase tracking-wider">
            The Mission
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            Empower citizens to identify, document, map, and monitor civic infrastructure problems in their neighbourhoods through transparent, location-based reporting. We replace opaque complaint phone trees with transparent geospatial records, auditable inspection logs, and verifiable repair histories.
          </p>
        </div>
      </div>

      {/* 4 Pillars of Let'sFix */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center">
          Civic-Tech Architectural Principles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Pillar 1 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Navigation2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              1. Spatial Accuracy & GPS Integrity
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every reported issue includes verifiable latitude and longitude coordinates. Rather than vague street names, municipal maintenance teams receive exact spatial pins on OpenStreetMap, eliminating wasted travel time.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              2. Separation of Proposal & Official Action
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We strictly distinguish between citizen suggestions and verified municipal work orders. No report is claimed as fixed or forwarded to a department without transparent status audit trails and logged officer credentials.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              3. Privacy by Design & Zero Doxxing
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Reporting civic defects should never compromise personal privacy. Submissions support anonymous reporting, personal contact information is never published in public feeds, and photographic evidence is focused strictly on public infrastructure.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              4. Open Data & Civic Interoperability
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Infrastructure data belongs to the public. All report metadata, geo-coordinates, and resolution timelines can be exported directly to standard JSON / GeoJSON for analysis by urban planners, researchers, and local advocates.
            </p>
          </div>

        </div>
      </div>

      {/* Field Surveyor Guidelines */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 space-y-6">
        <h3 className="text-xl font-bold tracking-tight">
          Field Documentation Guidelines for Citizens
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="space-y-2">
            <div className="font-bold text-teal-400">1. Safe Photographing</div>
            <p>Never step into active vehicular traffic or unbarricaded construction zones to capture a photo. Use zoom if necessary and ensure you are standing on safe ground.</p>
          </div>
          <div className="space-y-2">
            <div className="font-bold text-teal-400">2. Objective Assessment</div>
            <p>Document what you see: estimated width/depth of a pothole, extent of water leakage, or lamp pole numbering. Factual descriptions help engineers dispatch the right equipment.</p>
          </div>
          <div className="space-y-2">
            <div className="font-bold text-teal-400">3. Verification & Follow-Through</div>
            <p>Keep your unique report ID (e.g. LF-2026-XXXX). When crews complete repairs, review the site and confirm whether the hazard has been permanently resolved.</p>
          </div>
        </div>
      </div>

      {/* Municipal Integration Callout */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700">
            <Building2 className="w-4 h-4" />
            <span>For Municipalities & Public Works Authorities</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Integrate Let'sFix with Your City's Work Order Dispatch
          </h3>
          <p className="text-xs text-slate-600 max-w-xl">
            Our schema matches standard 311 Open311 and OpenStreetMap defect taxonomies. Connect our REST API directly to CityWorks, Cartegraph, or custom municipal CRM systems.
          </p>
        </div>

        <button
          onClick={() => onNavigate('report-issue')}
          className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs flex-shrink-0"
        >
          Submit First Incident →
        </button>
      </div>

    </div>
  );
};
