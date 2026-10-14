import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CivicReport, IssueCategory, SeverityLevel } from '../../types';
import { ISSUE_CATEGORIES, SEVERITY_LEVELS, REPORT_STATUSES, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../constants/config';
import { Maximize2, Navigation } from 'lucide-react';

interface CivicMapProps {
  reports: CivicReport[];
  selectedReportId?: string | null;
  onSelectReport?: (report: CivicReport) => void;
  height?: string;
  zoom?: number;
  center?: [number, number];
  interactive?: boolean;
  selectableLocation?: boolean;
  onLocationSelected?: (lat: number, lng: number) => void;
  selectedCoordinates?: [number, number] | null;
  className?: string;
}

// Generate distinct SVG icon for Leaflet DivIcon
function createCategoryPinIcon(category: IssueCategory, severity: SeverityLevel, isSelected: boolean) {
  const cat = ISSUE_CATEGORIES[category] || ISSUE_CATEGORIES.other;
  const sev = SEVERITY_LEVELS[severity] || SEVERITY_LEVELS.medium;

  const bgHex = cat.color;
  const ringColor = sev.color;
  const size = isSelected ? 44 : 36;
  const strokeWidth = isSelected ? 3 : 2;

  let symbolSvg = `<circle cx="12" cy="12" r="4" fill="white" />`;
  if (category === 'roads_potholes') {
    symbolSvg = `<path d="M12 4L3 20h18L12 4zm0 5v6m0 2h.01" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>`;
  } else if (category === 'footpaths') {
    symbolSvg = `<path d="M7 17v-4a4 4 0 0 1 8 0v4M12 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>`;
  } else if (category === 'streetlights') {
    symbolSvg = `<path d="M12 3v3m0 12v3M9 6a5 5 0 0 1 6 0c1.5 1 2 2.5 2 4a5 5 0 0 1-3 4.5V16h-4v-1.5A5 5 0 0 1 7 10c0-1.5.5-3 2-4z" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>`;
  } else if (category === 'water_leakage') {
    symbolSvg = `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>`;
  } else if (category === 'drainage') {
    symbolSvg = `<path d="M6 3v12a3 3 0 0 0 6 0V3M18 9v6a3 3 0 0 1-6 0" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>`;
  } else if (category === 'garbage') {
    symbolSvg = `<path d="M4 6h16M10 11v6M14 11v6M6 6v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>`;
  }

  const html = `
    <div class="custom-map-pin" style="position: relative; width: ${size}px; height: ${size + 8}px;">
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${bgHex};
        border: ${strokeWidth}px solid ${ringColor};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
        cursor: pointer;
      ">
        <svg viewBox="0 0 24 24" style="width: ${size * 0.52}px; height: ${size * 0.52}px; transform: rotate(45deg);">
          ${symbolSvg}
        </svg>
      </div>
      ${severity === 'critical' ? `<span style="position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; background: #dc2626; border: 2px solid white; border-radius: 50%; display: block;" class="animate-pulse"></span>` : ''}
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html,
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 6)]
  });
}

function createPickerIcon() {
  const html = `
    <div style="
      width: 34px;
      height: 34px;
      background: #0d9488;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 4px 14px rgba(13, 148, 136, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
    ">
      <div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-picker-pin',
    html,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
}

// Compute bounding box and optimal center based on report locations
function getReportsBoundsAndCenter(reports: CivicReport[], fallbackCenter: [number, number]): {
  bounds: L.LatLngBounds | null;
  center: [number, number];
} {
  const valid = reports.filter(r => typeof r.latitude === 'number' && typeof r.longitude === 'number' && !isNaN(r.latitude) && !isNaN(r.longitude));
  if (valid.length === 0) {
    return { bounds: null, center: fallbackCenter };
  }
  if (valid.length === 1) {
    return { bounds: null, center: [valid[0].latitude, valid[0].longitude] };
  }
  const lats = valid.map(r => r.latitude);
  const lngs = valid.map(r => r.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const bounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng]);
  const center: [number, number] = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
  return { bounds, center };
}

export const CivicMap: React.FC<CivicMapProps> = ({
  reports,
  selectedReportId,
  onSelectReport,
  height = '500px',
  zoom,
  center,
  interactive = true,
  selectableLocation = false,
  onLocationSelected,
  selectedCoordinates,
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Auto-fit function
  const fitToReports = () => {
    if (!mapInstanceRef.current) return;
    const { bounds, center: calculatedCenter } = getReportsBoundsAndCenter(reports, DEFAULT_MAP_CENTER);
    if (bounds) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
    } else {
      mapInstanceRef.current.setView(calculatedCenter, 15);
    }
  };

  // Initialize Map directly shaped by the reports' geographic footprint
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Calculate initial center & bounds based on reports
    const { bounds, center: initialCenter } = getReportsBoundsAndCenter(reports, center || DEFAULT_MAP_CENTER);

    const map = L.map(mapContainerRef.current, {
      center: center || initialCenter,
      zoom: zoom || (bounds ? 13 : 14),
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive
    });

    // High quality OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Handle map click in location picker mode
    if (selectableLocation && onLocationSelected) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onLocationSelected(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
      });
    }

    // Auto-fit bounds right on load
    if (bounds && !center && !selectableLocation) {
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Center update when props change
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom || 15);
      mapInstanceRef.current.invalidateSize();
    }
  }, [center?.[0], center?.[1], zoom]);

  // Update report markers and re-frame bounds dynamically
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    if (reports.length === 0) return;

    reports.forEach((report) => {
      if (typeof report.latitude !== 'number' || typeof report.longitude !== 'number') return;
      if (isNaN(report.latitude) || isNaN(report.longitude)) return;

      const isSelected = report.id === selectedReportId;
      const icon = createCategoryPinIcon(report.category, report.severity, isSelected);

      const marker = L.marker([report.latitude, report.longitude], { icon });

      const catInfo = ISSUE_CATEGORIES[report.category] || ISSUE_CATEGORIES.other;
      const sevInfo = SEVERITY_LEVELS[report.severity] || SEVERITY_LEVELS.medium;
      const statInfo = REPORT_STATUSES[report.status] || REPORT_STATUSES.reported;

      const popupHtml = `
        <div style="width: 270px; font-family: system-ui, -apple-system, sans-serif; background: #ffffff;">
          <div style="position: relative; height: 130px; background: #e2e8f0; overflow: hidden;">
            <img src="${report.imageUrl}" alt="${report.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&q=80'" />
            <div style="position: absolute; top: 8px; left: 8px; background: #0f172a; color: #2dd4bf; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; font-family: monospace;">
              ${report.complaintId || report.id}
            </div>
            <div style="position: absolute; bottom: 8px; right: 8px; background: ${sevInfo.color}; color: white; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              ${sevInfo.name}
            </div>
          </div>
          <div style="padding: 12px;">
            <div style="font-size: 10px; color: #0d9488; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
              ${catInfo.name}
            </div>
            <h4 style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
              ${report.title}
            </h4>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
              📍 ${report.locationName}
            </div>
            <div style="font-size: 10px; color: #334155; background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 6px; border-radius: 4px; margin-bottom: 8px;">
              🏢 <strong>Assigned:</strong> ${report.concernedDepartment ? report.concernedDepartment.split('(')[0] : catInfo.concernedDepartment.split('(')[0]}
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid #f1f5f9;">
              <span style="font-size: 11px; font-weight: 600; color: ${statInfo.color};">
                ● ${statInfo.name}
              </span>
              <button 
                id="popup-btn-${report.id}" 
                style="background: #0d9488; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 700; padding: 5px 10px; cursor: pointer;"
              >
                View Complaint →
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 290, closeButton: true });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${report.id}`);
        if (btn && onSelectReport) {
          btn.onclick = () => {
            onSelectReport(report);
          };
        }
      });

      marker.on('click', () => {
        if (onSelectReport) {
          onSelectReport(report);
        }
      });

      marker.addTo(layer);

      if (isSelected) {
        marker.openPopup();
      }
    });

    // Auto-fit map according to the location of reports whenever reports array changes
    if (!selectedReportId && !selectableLocation && !center) {
      fitToReports();
    }
  }, [reports, selectedReportId, onSelectReport, selectableLocation, center]);

  // Handle selectable location marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (selectableLocation && selectedCoordinates) {
      const [lat, lng] = selectedCoordinates;
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], {
          icon: createPickerIcon(),
          draggable: true
        }).addTo(mapInstanceRef.current);

        marker.on('dragend', (e) => {
          const newPos = (e.target as L.Marker).getLatLng();
          if (onLocationSelected) {
            onLocationSelected(Number(newPos.lat.toFixed(6)), Number(newPos.lng.toFixed(6)));
          }
        });

        pickerMarkerRef.current = marker;
      }

      mapInstanceRef.current.panTo([lat, lng]);
    } else if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }
  }, [selectableLocation, selectedCoordinates?.[0], selectedCoordinates?.[1], onLocationSelected]);

  return (
    <div 
      className={`relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm ${className}`}
      style={{ height }}
    >
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Dynamic Location Focus & Re-center Action */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        {interactive && reports.length > 1 && !selectableLocation && (
          <button
            onClick={fitToReports}
            className="bg-white/95 hover:bg-white text-slate-800 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-md border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Auto-fit viewport to encompass all reported issue locations"
          >
            <Maximize2 className="w-3 h-3 text-teal-600" />
            <span>Fit All Reports</span>
          </button>
        )}
      </div>

      {/* Map Attribution and Coordinates Watermark */}
      <div className="absolute bottom-2 left-2 z-10 pointer-events-none bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] font-medium text-slate-700 shadow-xs border border-slate-200">
        Let'sFix Spatial Grid · Geocoded on {reports.length} Verified Location{reports.length === 1 ? '' : 's'}
      </div>
    </div>
  );
};
