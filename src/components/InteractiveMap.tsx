import React, { useState } from 'react';
import { Property } from '../types';
import { MapPin, Navigation, Eye } from 'lucide-react';

interface InteractiveMapProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property) => void;
  hoveredPropertyId?: string | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
  hoveredPropertyId,
}) => {
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  // Hyderabad geographic boundaries for coordinate projection
  // Lat: 17.410 to 17.470, Lng: 78.330 to 78.440
  const latMin = 17.410;
  const latMax = 17.470;
  const lngMin = 78.330;
  const lngMax = 78.440;

  // Map sublocality labels coordinates (projected)
  const DISTRICTS = [
    { name: 'Financial District', lat: 17.4184, lng: 78.3392 },
    { name: 'Gachibowli', lat: 17.4401, lng: 78.3489 },
    { name: 'Kondapur', lat: 17.4622, lng: 78.3568 },
    { name: 'Madhapur', lat: 17.4483, lng: 78.3915 },
    { name: 'Jubilee Hills', lat: 17.4316, lng: 78.4016 },
    { name: 'Banjara Hills', lat: 17.4156, lng: 78.4347 },
  ];

  const getProjection = (lat: number, lng: number) => {
    // Map to percentage coordinates on a 100x100 grid
    const x = ((lng - lngMin) / (lngMax - lngMin)) * 100;
    const y = (1 - (lat - latMin) / (latMax - latMin)) * 100; // Invert Y for SVG space
    return { x: `${x}%`, y: `${y}%` };
  };

  const getPriceLabel = (p: Property) => {
    if (p.rentOrBuy === 'Rent') {
      return `₹${(p.price / 1000).toFixed(0)}K/mo`;
    } else {
      return `₹${(p.price / 10000000).toFixed(1)} Cr`;
    }
  };

  return (
    <div className="relative w-full h-[520px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-inner select-none flex flex-col font-sans">
      
      {/* Upper Map Utility HUD bar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-800 py-1.5 px-3.5 rounded-xl text-white">
        <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Hyderabad Live Vector Grid</span>
      </div>

      {/* Styled SVG grid background */}
      <div className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#475569" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* Outer Ring Road (ORR) connecting lines representational mockup */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
        {/* Draw highways connecting major sublocalities */}
        <path 
          d="M 10 90 Q 30 70 20 40 T 40 20 T 70 30 T 90 70" 
          fill="none" 
          stroke="#10b981" 
          strokeWidth="2" 
          strokeDasharray="5,5"
        />
        <path 
          d="M 20 40 L 70 30" 
          fill="none" 
          stroke="#0284c7" 
          strokeWidth="1" 
          strokeDasharray="2,4"
        />
      </svg>

      {/* Sublocality geographical sector labels */}
      {DISTRICTS.map((dist) => {
        const coords = getProjection(dist.lat, dist.lng);
        return (
          <div
            key={dist.name}
            style={{ left: coords.x, top: coords.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center gap-1 opacity-60"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700 border border-slate-600" />
            <span className="text-[8px] font-bold font-mono tracking-widest text-slate-400 uppercase text-center bg-slate-950/40 px-1 py-0.5 rounded-sm">
              {dist.name}
            </span>
          </div>
        );
      })}

      {/* Dynamic Property marker pins */}
      {properties.map((p) => {
        const coords = getProjection(p.latitude, p.longitude);
        const isSelected = selectedProperty?.id === p.id;
        const isHovered = hoveredPropertyId === p.id;
        const isTooltipActive = activeTooltipId === p.id;

        return (
          <div
            key={p.id}
            style={{ left: coords.x, top: coords.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
          >
            {/* Marker Node Pin */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTooltipId(isTooltipActive ? null : p.id);
              }}
              onDoubleClick={() => onSelectProperty(p)}
              className={`p-1 rounded-full border shadow-md transition-all duration-300 transform relative flex items-center justify-center cursor-pointer ${
                isSelected
                  ? 'bg-rose-500 border-white text-white scale-125 z-30'
                  : isHovered
                  ? 'bg-emerald-500 border-white text-white scale-115 z-30'
                  : 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-emerald-600 hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4" />
              {/* Floating micro price label */}
              <span className="absolute -top-7 bg-slate-950 border border-slate-800 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-xs pointer-events-none whitespace-nowrap">
                {getPriceLabel(p)}
              </span>
            </button>

            {/* Hover/Click Dynamic Tooltip Overlay Card */}
            {(isTooltipActive || isHovered) && (
              <div 
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-800 p-2.5 rounded-2xl w-48 shadow-2xl flex flex-col gap-1.5 pointer-events-auto cursor-default animate-scale-in text-white"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Thumbnail image */}
                <div className="relative h-20 rounded-xl overflow-hidden bg-slate-950">
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1 left-1 bg-emerald-600 font-mono text-[8px] px-1 py-0.5 rounded-sm">
                    {p.rentOrBuy}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-display font-bold text-[10px] truncate leading-tight text-white">
                    {p.title}
                  </h4>
                  <p className="text-[9px] font-mono text-emerald-400 font-bold">
                    {p.rentOrBuy === 'Rent' ? `₹${p.price.toLocaleString('en-IN')}/mo` : `₹${(p.price / 10000000).toFixed(2)} Cr`}
                  </p>
                  <p className="text-[8px] font-mono text-slate-400 truncate">
                    {p.location}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSelectProperty(p);
                    setActiveTooltipId(null);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] py-1 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Eye className="w-3 h-3" /> Inspect Details
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Map Compass HUD background indicator in bottom-right corner */}
      <div className="absolute bottom-4 right-4 bg-slate-950/60 p-2 rounded-2xl border border-slate-800 flex items-center gap-1.5 text-slate-500 text-[9px] font-mono">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        <span>GPS Locked (17.4° N, 78.3° E)</span>
      </div>

    </div>
  );
};
