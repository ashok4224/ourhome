/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Property } from '../types';
import { 
  Search, SlidersHorizontal, Grid, Map as MapIcon, 
  Bed, Square, Compass, Heart, Eye, ArrowRight, X, Sparkles,
  ArrowUpDown, CheckCircle2, Info, Check, BadgePercent, ShieldAlert, ShieldCheck
} from 'lucide-react';

interface ListingsPageViewProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  initialFilters?: { type?: 'Rent' | 'Buy'; search?: string; subLocality?: string };
  savedIds: string[];
  onToggleSave: (id: string) => void;
}

export const ListingsPageView: React.FC<ListingsPageViewProps> = ({
  properties,
  onSelectProperty,
  initialFilters,
  savedIds,
  onToggleSave,
}) => {
  // Filters State
  const [rentOrBuy, setRentOrBuy] = useState<'Any' | 'Buy' | 'Rent'>(
    initialFilters?.type || 'Any'
  );
  const [searchQuery, setSearchQuery] = useState(initialFilters?.search || '');
  const [subLocality, setSubLocality] = useState(initialFilters?.subLocality || 'Any');
  const [bhkCount, setBhkCount] = useState<number | 'Any'>('Any');
  const [maxPrice, setMaxPrice] = useState<number>(60000000); // Max 6 Crores

  // Advanced Portal Toggles (Real Estate comparison models)
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [zeroBrokerageOnly, setZeroBrokerageOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'size-high' | 'value-sqft'>('popular');

  // Property Comparison states
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // View Layout State (Grid vs Split Map View)
  const [viewMode, setViewMode] = useState<'Grid' | 'Map'>('Grid');

  // Selected property on the Map marker
  const [selectedMapPropId, setSelectedMapPropId] = useState<string | null>('prop-1');

  // Sync changed filters from parent (e.g., when clicking preview)
  React.useEffect(() => {
    if (initialFilters) {
      if (initialFilters.type) setRentOrBuy(initialFilters.type);
      if (initialFilters.search !== undefined) setSearchQuery(initialFilters.search);
      if (initialFilters.subLocality) setSubLocality(initialFilters.subLocality);
    }
  }, [initialFilters]);

  // Filter and Sort logic (with NoBroker & Magicbricks metrics: verified, brokerage, pricing)
  const filteredProperties = useMemo(() => {
    let result = properties.filter((p) => {
      // Must be approved status
      if (p.status !== 'Approved') return false;

      // Buy/Rent Type filter
      if (rentOrBuy !== 'Any' && p.rentOrBuy !== rentOrBuy) return false;

      // Sub-locality filter
      if (subLocality !== 'Any' && p.subLocality !== subLocality) return false;

      // BHK filter
      if (bhkCount !== 'Any' && p.bedrooms !== bhkCount) return false;

      // Max Price filter - Handle different scaling for Rent vs Buy
      if (rentOrBuy === 'Rent') {
        if (p.price > 150000) return false; // Default rent check
      } else {
        if (p.price > maxPrice) return false;
      }

      // Proportional verified filter (representing 99acres)
      // Gachibowli or Arjun-supported listings count as fully verified
      if (verifiedOnly && p.id !== 'prop-1' && p.id !== 'prop-2' && p.id !== 'prop-4' && !p.title.toLowerCase().includes('ashok')) {
        return false;
      }

      // Zero brokerage filter (representing NoBroker)
      // Let special direct owner properties count as direct listings (0 broker fees)
      if (zeroBrokerageOnly && p.id !== 'prop-1' && p.id !== 'prop-3' && p.id !== 'prop-5' && !p.title.toLowerCase().includes('ashok')) {
        return false;
      }

      // Keyword queries matching title, location, description, subLocality, amenities
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesLoc = p.location.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        const matchesAmenity = p.amenities.some((a) => a.toLowerCase().includes(query));
        if (!matchesTitle && !matchesLoc && !matchesDesc && !matchesAmenity) return false;
      }

      return true;
    });

    // Apply Sorting (replicate Magicbricks sorting)
    return [...result].sort((a, b) => {
      if (sortBy === 'price-low') {
        return a.price - b.price;
      } else if (sortBy === 'price-high') {
        return b.price - a.price;
      } else if (sortBy === 'size-high') {
        return b.sizeSqFt - a.sizeSqFt;
      } else if (sortBy === 'value-sqft') {
        const valueA = a.price / a.sizeSqFt;
        const valueB = b.price / b.sizeSqFt;
        return valueA - valueB;
      } else {
        // 'popular'
        return (b.views || 0) - (a.views || 0);
      }
    });
  }, [properties, rentOrBuy, subLocality, bhkCount, maxPrice, searchQuery, verifiedOnly, zeroBrokerageOnly, sortBy]);

  const handleResetFilters = () => {
    setRentOrBuy('Any');
    setSearchQuery('');
    setSubLocality('Any');
    setBhkCount('Any');
    setMaxPrice(60000000);
    setVerifiedOnly(false);
    setZeroBrokerageOnly(false);
    setSortBy('popular');
  };

  const getPriceLabel = (p: Property) => {
    if (p.rentOrBuy === 'Rent') {
      return `₹${p.price.toLocaleString('en-IN')} / mo`;
    } else {
      const crVal = p.price / 10000000;
      return `₹${crVal.toFixed(2)} Cr`;
    }
  };

  // Mock Map Markers layout. Coordinate map ranges for standard SVG container dimensions (e.g. 500x400)
  const mapCoordinates: { [key: string]: { x: number; y: number; name: string } } = {
    'prop-1': { x: 180, y: 260, name: 'Gachibowli' },
    'prop-2': { x: 380, y: 150, name: 'Jubilee Hills' },
    'prop-3': { x: 310, y: 190, name: 'Madhapur' },
    'prop-4': { x: 120, y: 310, name: 'Financial District' },
    'prop-5': { x: 250, y: 110, name: 'Kondapur' },
    'prop-6': { x: 440, y: 210, name: 'Banjara Hills' },
  };

  const selectedMapProperty = properties.find((p) => p.id === selectedMapPropId);

  return (
    <div id="listings-view" className="space-y-8 animate-fade-in text-slate-800">
      {/* Search and view switcher strip */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            OurHome Listings
          </h1>
          <p className="text-xs text-slate-450">
            Found {filteredProperties.length} vetted real estate matches in Hyderabad
          </p>
        </div>

        {/* Outer view toggle segment switches */}
        <div className="flex items-center gap-3">
          {/* Grid Map layout segmented controllers */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              id="view-grid-btn"
              type="button"
              onClick={() => setViewMode('Grid')}
              className={`flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg font-medium transition-all ${
                viewMode === 'Grid'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Grid View
            </button>
            <button
              id="view-map-btn"
              type="button"
              onClick={() => setViewMode('Map')}
              className={`flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg font-medium transition-all ${
                viewMode === 'Map'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" /> Split Map
            </button>
          </div>
        </div>
      </div>

      {/* Main Structural Layout (Filters + Listings Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Dynamic Left Sidebar Controls */}
        <div id="listings-filters-sidebar" className="bg-white border border-slate-200 rounded-2xl p-5 space-y-6 self-start">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-display font-semibold text-sm text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" /> Filters
            </h3>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[10px] font-mono text-slate-400 hover:text-slate-800 underline uppercase"
            >
              Reset All
            </button>
          </div>

          {/* Segmented Buy/Rent controls */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Acquisition Mode</label>
            <div className="bg-slate-100 p-1 rounded-xl flex border border-slate-200">
              {(['Any', 'Buy', 'Rent'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRentOrBuy(type)}
                  className={`flex-1 text-xs text-center py-1.5 rounded-lg transition-all ${
                    rentOrBuy === type
                      ? 'bg-white text-emerald-600 font-semibold shadow-xs'
                      : 'text-slate-550 hover:text-slate-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Location Dropdown selector */}
          <div className="space-y-1.5">
            <label htmlFor="location-select" className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Sublocality</label>
            <select
              id="location-select"
              value={subLocality}
              onChange={(e) => setSubLocality(e.target.value)}
              className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 outline-none text-slate-800 focus:border-emerald-500 bg-white"
            >
              <option value="Any">Any Location</option>
              <option value="Gachibowli">Gachibowli</option>
              <option value="Madhapur">Madhapur</option>
              <option value="Jubilee Hills">Jubilee Hills</option>
              <option value="Financial District">Financial District</option>
              <option value="Kondapur">Kondapur</option>
              <option value="Banjara Hills">Banjara Hills</option>
            </select>
          </div>

          {/* BHK selector chips */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Beds (BHK)</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Any', 2, 3, 4] as const).map((bhk) => (
                <button
                  key={bhk}
                  type="button"
                  onClick={() => setBhkCount(bhk === 'Any' ? 'Any' : bhk)}
                  className={`text-xs py-1.5 rounded-xl border text-center transition-all ${
                    (bhk === 'Any' && bhkCount === 'Any') || (bhk !== 'Any' && bhkCount === bhk)
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350'
                  }`}
                >
                  {bhk} {bhk !== 'Any' ? 'B' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Slider price filter (Only relevant for Buy, for Rent we show automated budget block) */}
          {rentOrBuy !== 'Rent' && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-450 uppercase tracking-wider">Max Price Valuation</span>
                <span className="font-bold text-slate-800">
                  ₹{(maxPrice / 10000000).toFixed(2)} Cr
                </span>
              </div>
              <input
                type="range"
                min={10000000} // Minimum 1 Cr
                max={60000000} // Maximum 6 Cr
                step={2500000} // Step 25 Lakhs
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>₹1.00 Cr</span>
                <span>₹6.00 Cr</span>
              </div>
            </div>
          )}

          {rentOrBuy === 'Rent' && (
            <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl">
              <p className="text-[10px] font-mono text-sky-700 font-semibold tracking-wider">RENT DEALS ACTIVE</p>
              <p className="text-[11px] text-sky-650 mt-1 leading-relaxed">Lease listings currently range within ₹40K to ₹1.2L per month in active high street communities.</p>
            </div>
          )}

          {/* Quick Search Key Input */}
          <div className="space-y-1.5">
            <label htmlFor="filter-query" className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Keyword Queries</label>
            <div className="relative flex items-center bg-slate-50 px-3 py-2 border border-slate-200 rounded-xl">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                id="filter-query"
                type="text"
                value={searchQuery}
                placeholder="Pool, automation..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs ml-2 bg-transparent outline-none border-none text-slate-800 placeholder-slate-400 focus:ring-0"
              />
            </div>
          </div>

          {/* Premium Real Estate Sort Filter */}
          <div className="space-y-1.5 pt-2 border-t border-slate-150">
            <label htmlFor="sort-select" className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-neutral-400" /> Sort Results
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2.5 outline-none text-slate-850 focus:border-emerald-550 bg-white shadow-3xs"
            >
              <option value="popular">Best Match (Most Popular)</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="size-high">Area: Largest Space</option>
              <option value="value-sqft">Best Value (Lowest ₹/SqFt)</option>
            </select>
          </div>

          {/* Real Estate Portal Brand Badges Checkboxes (NoBroker & 99acres & Magicbricks models) */}
          <div className="space-y-3.5 pt-3 border-t border-slate-150">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Portal Features</span>
            
            <label className="flex items-start gap-2.5 cursor-pointer group text-xs text-neutral-700 select-none">
              <input
                type="checkbox"
                checked={zeroBrokerageOnly}
                onChange={(e) => setZeroBrokerageOnly(e.target.checked)}
                className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 mt-0.5 accent-emerald-600"
              />
              <span className="space-y-0.5">
                <span className="font-bold flex items-center gap-1 group-hover:text-amber-600 transition-colors">
                  Zero Brokerage <span className="bg-amber-100 text-amber-800 font-mono text-[8.5px] px-1 py-0.2 rounded-sm uppercase tracking-wider font-bold">No-Broker</span>
                </span>
                <span className="text-[10px] text-neutral-400 block leading-tight">Direct builder/owner deals, zero brokerage fees</span>
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer group text-xs text-neutral-700 select-none">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 mt-0.5 accent-emerald-600"
              />
              <span className="space-y-0.5">
                <span className="font-bold flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                  RERA Registered <span className="bg-indigo-50 text-indigo-700 font-mono text-[8.5px] px-1 py-0.2 rounded-sm uppercase tracking-wider font-bold">99acres</span>
                </span>
                <span className="text-[10px] text-neutral-400 block leading-tight">Verified certifications & RERA registered projects only</span>
              </span>
            </label>
          </div>
        </div>

        {/* Listings Display Block (Grid or Split Map Views) */}
        <div className="lg:col-span-3">
          {viewMode === 'Grid' ? (
            /* SIMPLE GRID SECTION */
            filteredProperties.length === 0 ? (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-12 text-center space-y-4">
                <p className="text-sm text-slate-400">No properties matching your specific filters were discovered.</p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-750 font-bold text-xs py-2 px-4 rounded-xl"
                >
                  Clear Active Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((p) => {
                  const isSaved = savedIds.includes(p.id);
                  return (
                    <div
                      id={`listings-card-${p.id}`}
                      key={p.id}
                      className="group bg-white border border-slate-100 hover:border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col"
                    >
                      <div className="relative h-48 overflow-hidden bg-slate-50">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                          <span className="bg-emerald-600 text-white font-mono text-[9px] font-bold py-0.5 px-1.5 rounded-sm uppercase shadow-xs">
                            {p.rentOrBuy === 'Buy' ? 'Buy' : 'Rent'}
                          </span>
                          <span className="bg-slate-950/85 text-amber-350 border border-amber-500/20 font-mono text-[8px] font-extrabold py-0.5 px-1.5 rounded-sm uppercase shrink-0">
                            0 Brokerage
                          </span>
                          {(p.id === 'prop-1' || p.id === 'prop-2' || p.id === 'prop-4' || p.title.toLowerCase().includes('ashok')) && (
                            <span className="bg-neutral-900/90 text-emerald-300 border border-emerald-500/20 font-mono text-[8px] font-extrabold py-0.5 px-1.5 rounded-sm uppercase shrink-0 flex items-center gap-0.5">
                              ✓ RERA Approved
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSave(p.id);
                          }}
                          className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md border shadow-xs ${
                            isSaved 
                              ? 'bg-rose-50 border-rose-100 text-rose-500' 
                              : 'bg-white/70 border-white/10 text-slate-600 hover:text-rose-500'
                          }`}
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <div className="absolute bottom-3 left-3 bg-slate-900/65 backdrop-blur-xs text-white text-[10px] font-mono py-0.5 px-1.5 rounded-md">
                          {p.subLocality}
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start gap-1">
                            <h3 className="font-display font-medium text-slate-900 text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">
                              {p.title}
                            </h3>
                            <span className="font-display font-bold text-slate-900 text-xs shrink-0 pt-0.5">
                              {getPriceLabel(p)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{p.location}</p>
                          <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-slate-500">
                            <span>{p.bedrooms} BHK</span>
                            <span>•</span>
                            <span>{p.sizeSqFt} SQFT</span>
                            <span>•</span>
                            <span>{p.facing}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-2 border-t border-slate-50 flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => onSelectProperty(p)}
                            className="font-bold text-emerald-700 hover:text-emerald-600 inline-flex items-center gap-1 group bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-100 hover:border-neutral-250 transition-all cursor-pointer"
                          >
                            Explore <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </button>

                          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-mono font-bold text-neutral-500 select-none hover:text-slate-900 bg-neutral-50 hover:bg-neutral-100 px-2.5 py-1.5 rounded-xl border border-neutral-100 transition-all">
                            <input
                              type="checkbox"
                              checked={compareIds.includes(p.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (e.target.checked) {
                                  if (compareIds.length >= 3) {
                                    alert("Premium real estate comparison is limited to max 3 items.");
                                    return;
                                  }
                                  setCompareIds([...compareIds, p.id]);
                                } else {
                                  setCompareIds(compareIds.filter(id => id !== p.id));
                                }
                              }}
                              className="rounded border-neutral-300 text-emerald-650 focus:ring-emerald-500 w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
                            />
                            <span>{compareIds.includes(p.id) ? 'Compared' : 'Compare'}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* SPLIT DESKTOP VIEW WITH VECTOR WEB-MAP CHART */
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[500px]">
              
              {/* Left Column list (Vertical compact list) */}
              <div className="lg:col-span-2 overflow-y-auto pr-1 h-full space-y-3">
                {filteredProperties.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-xl text-center">
                    <p className="text-xs text-slate-400">No properties matching scope.</p>
                  </div>
                ) : (
                  filteredProperties.map((p) => {
                    const isSelectedOnMap = selectedMapPropId === p.id;
                    return (
                      <div
                        id={`map-list-card-${p.id}`}
                        key={p.id}
                        onClick={() => setSelectedMapPropId(p.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                          isSelectedOnMap
                            ? 'bg-emerald-50 text-slate-900 border-emerald-350 scale-[0.99] shadow-xs'
                            : 'bg-white text-slate-800 border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-105 shrink-0">
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="font-display font-medium text-xs truncate leading-tight">
                              {p.title}
                            </h4>
                            <p className={`text-[10px] truncate ${isSelectedOnMap ? 'text-emerald-850 font-medium' : 'text-slate-500'}`}>
                              {p.subLocality} • {p.bedrooms} BHK
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`text-[11px] font-bold ${isSelectedOnMap ? 'text-emerald-700' : 'text-slate-900'}`}>
                              {getPriceLabel(p)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectProperty(p);
                              }}
                              className={`text-[9px] font-semibold hover:underline ${
                                isSelectedOnMap ? 'text-emerald-700' : 'text-emerald-600'
                              }`}
                            >
                              Explore →
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Column: VECTOR MAP GRAPHIC WITH CLICKABLE PINS */}
              <div className="lg:col-span-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col overflow-hidden relative shadow-inner">
                {/* Upper header statistics block */}
                <div className="p-3 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 text-white flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> West Hyderabad Map Registry
                  </span>
                  <span className="bg-emerald-600/20 text-emerald-300 font-mono text-[9px] py-0.5 px-1.5 rounded-md border border-emerald-500/20">
                    Interactive
                  </span>
                </div>

                {/* Main Vector map body representation containing streets & layout bounds */}
                <div className="flex-1 relative bg-slate-900">
                  <svg className="w-full h-full min-h-[300px]" viewBox="0 0 500 380">
                    {/* Definitions */}
                    <defs>
                      <pattern id="road-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="20" x2="40" y2="20" stroke="#1e293b" strokeWidth="1" />
                        <line x1="20" y1="0" x2="20" y2="40" stroke="#1e293b" strokeWidth="1" />
                      </pattern>
                    </defs>

                    {/* Street pattern grid background */}
                    <rect width="100%" height="100%" fill="url(#road-pattern)" />

                    {/* District Area Boundaries Polygons */}
                    {/* Kondapur (Top representation) */}
                    <polygon points="120,40 330,40 280,120 180,120" fill="rgba(16, 185, 129, 0.05)" stroke="#334155" strokeWidth="1" />
                    <text x="210" y="70" fill="#64748b" className="text-[10px] font-display uppercase tracking-widest font-semibold pointer-events-none" opacity="0.6">Kondapur</text>

                    {/* Jubilee Hills (Right top representation) */}
                    <polygon points="330,40 480,80 440,180 340,180" fill="rgba(16, 185, 129, 0.04)" stroke="#334155" strokeWidth="1" />
                    <text x="370" y="110" fill="#64748b" className="text-[10px] font-display uppercase tracking-widest font-semibold pointer-events-none" opacity="0.6">Jubilee Hills</text>

                    {/* Madhapur (Central layout) */}
                    <polygon points="180,120 340,120 310,230 200,210" fill="rgba(14, 165, 233, 0.04)" stroke="#334155" strokeWidth="1" />
                    <text x="235" y="155" fill="#64748b" className="text-[10px] font-display uppercase tracking-widest font-semibold pointer-events-none" opacity="0.6">Madhapur</text>

                    {/* Gachibowli (Left central layout) */}
                    <polygon points="80,210 200,210 160,320 60,280" fill="rgba(14, 165, 233, 0.05)" stroke="#334155" strokeWidth="1" />
                    <text x="95" y="245" fill="#64748b" className="text-[10px] font-display uppercase tracking-widest font-semibold pointer-events-none" opacity="0.6">Gachibowli</text>

                    {/* Financial District (Bottom representation) */}
                    <polygon points="60,280 160,320 120,380 40,360" fill="rgba(16, 185, 129, 0.04)" stroke="#334155" strokeWidth="1" />
                    <text x="50" y="340" fill="#64748b" className="text-[9px] font-display uppercase tracking-widest pointer-events-none" opacity="0.6">Fin District</text>

                    {/* Vector Arterial Roads representing Hyderabad Outer Ring Road (ORR) */}
                    <path d="M 30,120 C 150,150 250,300 450,320" fill="none" stroke="#475569" strokeWidth="2.5" strokeDasharray="6 4" />
                    <text x="140" y="190" fill="#475569" className="text-[8px] font-mono pointer-events-none" rotate="12">Outer Ring Road (ORR)</text>

                    {/* Lake representation (Durgam Cheruvu Lagoon) */}
                    <ellipse cx="290" cy="240" rx="35" ry="18" fill="rgba(14, 165, 233, 0.15)" stroke="#0ea5e9" strokeWidth="1" />
                    <text x="260" y="242" fill="#0ea5e9" className="text-[8px] font-mono pointer-events-none font-semibold">Durgam Lake</text>

                    {/* Clickable pins mapped dynamically */}
                    {Object.entries(mapCoordinates).map(([pId, coords]) => {
                       const listMatched = filteredProperties.find((fp) => fp.id === pId);
                       const isHovered = selectedMapPropId === pId;

                       // Skip rendering marker if it's filtered out of current scope
                       if (!listMatched) return null;

                       return (
                         <g 
                           key={pId} 
                           className="cursor-pointer" 
                           onClick={() => setSelectedMapPropId(pId)}
                         >
                           {/* Animated concentric radar rings */}
                           {isHovered && (
                             <circle
                               cx={coords.x}
                               cy={coords.y}
                               r="16"
                               fill="rgba(16, 185, 129, 0.3)"
                               className="animate-ping"
                               style={{ transformOrigin: `${coords.x}px ${coords.y}px` }}
                             />
                           )}

                           {/* Pin Pointer Base marker */}
                           <circle
                             cx={coords.x}
                             cy={coords.y}
                             r={isHovered ? "8" : "6"}
                             fill={isHovered ? "#0ea5e9" : "#10b981"}
                             stroke="#ffffff"
                             strokeWidth="2"
                             className="transition-all duration-300"
                           />

                           {/* Dynamic Small tooltip text overlay */}
                           <text
                             x={coords.x}
                             y={coords.y - 12}
                             textAnchor="middle"
                             fill={isHovered ? "#38bdf8" : "#a7f3d0"}
                             className="text-[9px] font-mono font-bold tracking-tight bg-slate-950 pointer-events-none"
                           >
                             ₹{(listMatched.price >= 10000000 ? (listMatched.price / 10000000).toFixed(1) + 'C' : (listMatched.price / 1000).toFixed(0) + 'K')}
                           </text>
                         </g>
                       );
                    })}
                  </svg>

                  {/* Overlaid Selected Property Quick Card HUD */}
                  {selectedMapProperty && (
                    <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 backdrop-blur-md border border-slate-750 p-3 rounded-xl flex items-center justify-between text-white animate-scale-in">
                      <div className="flex gap-2 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-zinc-850 overflow-hidden shrink-0">
                          <img
                            src={selectedMapProperty.images[0]}
                            alt={selectedMapProperty.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold truncate text-white leading-tight">
                            {selectedMapProperty.title}
                          </h4>
                          <p className="text-[9px] font-mono text-slate-300">
                            {selectedMapProperty.subLocality} • {selectedMapProperty.bedrooms} BHK
                          </p>
                          <p className="text-[11px] font-mono font-bold text-emerald-400 mt-0.5">
                            {getPriceLabel(selectedMapProperty)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectProperty(selectedMapProperty)}
                        className="bg-emerald-600 hover:bg-emerald-500 font-bold text-[10px] uppercase py-1.5 px-3 rounded-lg text-white font-display shrink-0"
                      >
                        Inspect Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FLOATING COMPARISON TOOLBAR (inspired by Magicbricks & 99acres) */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl px-5 py-3.5 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white rounded-lg p-1.5 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-wide">Property Compare Shelf</p>
              <p className="text-[10px] text-slate-400 font-mono">
                {compareIds.length} of 3 properties selected
              </p>
            </div>
            {/* Small image thumbnails of compared items */}
            <div className="hidden sm:flex items-center -space-x-2 ml-1">
              {compareIds.map((cid) => {
                const p = properties.find((item) => item.id === cid);
                if (!p) return null;
                return (
                  <div key={cid} className="w-8 h-8 rounded-full border-2 border-slate-900 overflow-hidden bg-neutral-800">
                    <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCompareIds([])}
              className="px-3 py-1.5 hover:bg-slate-800 text-[10px] uppercase font-mono font-bold text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setShowCompareModal(true)}
              className={`px-4 py-2 font-display font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
                compareIds.length >= 2
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md animate-pulse'
                  : 'bg-slate-850 text-slate-500 cursor-not-allowed'
              }`}
              disabled={compareIds.length < 2}
            >
              {compareIds.length < 2 ? 'Select 2+ Min' : `Compare (2/3) →`}
            </button>
          </div>
        </div>
      )}

      {/* COMPARATIVE ANALYSIS MODAL VIEW (inspired by NoBroker, Magicbricks, & 99acres) */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-55 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden border border-neutral-150 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-slate-50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold py-0.5 px-2 rounded-full uppercase tracking-wider">
                    Portal Compare Mode
                  </span>
                  <span className="bg-indigo-50 text-indigo-750 font-mono text-[9px] font-bold py-0.5 px-2 rounded-full uppercase tracking-wider">
                    Direct Broker-Free
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 tracking-tight">
                  Detailed Side-by-Side Property Comparison
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="p-1.5 hover:bg-neutral-200 text-slate-500 hover:text-slate-900 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparison Grid Table Workspace (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 text-slate-800">
              <div className="grid grid-cols-4 border-b border-neutral-100 pb-6 mb-6 gap-4">
                {/* Metric Labels Column */}
                <div className="flex flex-col justify-end text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest pb-4">
                  Select Specifications
                </div>

                {/* Property Columns */}
                {compareIds.map((cid) => {
                  const p = properties.find((item) => item.id === cid);
                  if (!p) return <div key={cid} className="p-4 text-center bg-neutral-50 rounded-xl">Empty Match</div>;
                  return (
                    <div key={cid} className="space-y-3 relative group">
                      <button
                        type="button"
                        onClick={() => setCompareIds(compareIds.filter(id => id !== cid))}
                        className="absolute -top-2 -right-2 p-1.5 bg-rose-50 border border-rose-100 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-xs z-10 cursor-pointer"
                        title="Remove from comparison list"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="aspect-video rounded-xl bg-neutral-100 overflow-hidden border border-neutral-200">
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-display font-bold text-slate-900 text-sm line-clamp-1">{p.title}</h4>
                        <p className="text-[10px] font-mono text-slate-500 truncate">{p.location}</p>
                      </div>
                    </div>
                  );
                })}

                {/* Fill empty comparison slot if fewer than 3 properties are being compared */}
                {Array.from({ length: 3 - compareIds.length }).map((_, idx) => (
                  <div key={idx} className="border-2 border-dashed border-neutral-200 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-neutral-50/50">
                    <SlidersHorizontal className="w-5 h-5 text-neutral-300 mb-2 animate-pulse" />
                    <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider">Empty Slot</span>
                    <span className="text-[9px] text-neutral-400 mt-1">Select more options to compare</span>
                  </div>
                ))}
              </div>

              {/* Rows of details comparison */}
              <div className="space-y-4">
                {/* 1. Price */}
                <div className="grid grid-cols-4 items-center py-2.5 border-b border-neutral-100 text-sm gap-4">
                  <div className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider">Pricing Package</div>
                  {compareIds.map((cid) => {
                    const p = properties.find((item) => item.id === cid);
                    if (!p) return <div key={cid} className="text-neutral-300">-</div>;
                    return (
                      <div key={cid} className="font-display font-bold text-emerald-800">
                        {getPriceLabel(p)}
                      </div>
                    );
                  })}
                  {Array.from({ length: 3 - compareIds.length }).map((_, idx) => <div key={idx} className="text-neutral-300">-</div>)}
                </div>

                {/* 2. BHK Size */}
                <div className="grid grid-cols-4 items-center py-2.5 border-b border-neutral-100 text-sm gap-4">
                  <div className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider">Layout (BHK)</div>
                  {compareIds.map((cid) => {
                    const p = properties.find((item) => item.id === cid);
                    if (!p) return <div key={cid} className="text-neutral-300">-</div>;
                    return (
                      <div key={cid} className="text-neutral-850 font-bold">
                        {p.bedrooms} BHK configuration
                      </div>
                    );
                  })}
                  {Array.from({ length: 3 - compareIds.length }).map((_, idx) => <div key={idx} className="text-neutral-300">-</div>)}
                </div>

                {/* 3. Carpet Area */}
                <div className="grid grid-cols-4 items-center py-2.5 border-b border-neutral-100 text-sm gap-4">
                  <div className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider">Carpet Area</div>
                  {compareIds.map((cid) => {
                    const p = properties.find((item) => item.id === cid);
                    if (!p) return <div key={cid} className="text-neutral-300">-</div>;
                    return (
                      <div key={cid} className="text-neutral-850 font-mono font-semibold">
                        {p.sizeSqFt.toLocaleString()} sq.ft.
                      </div>
                    );
                  })}
                  {Array.from({ length: 3 - compareIds.length }).map((_, idx) => <div key={idx} className="text-neutral-300">-</div>)}
                </div>

                {/* 4. Value Score */}
                <div className="grid grid-cols-4 items-center py-2.5 border-b border-neutral-100 text-sm gap-4">
                  <div className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider">Price / SqFt Value</div>
                  {compareIds.map((cid) => {
                    const p = properties.find((item) => item.id === cid);
                    if (!p) return <div key={cid} className="text-neutral-300">-</div>;
                    const valRate = Math.round(p.price / p.sizeSqFt);
                    return (
                      <div key={cid} className="text-neutral-850 font-mono font-medium">
                        ₹{valRate.toLocaleString('en-IN')} / sqft
                      </div>
                    );
                  })}
                  {Array.from({ length: 3 - compareIds.length }).map((_, idx) => <div key={idx} className="text-neutral-300">-</div>)}
                </div>

                {/* 5. Facing Direction */}
                <div className="grid grid-cols-4 items-center py-2.5 border-b border-neutral-100 text-sm gap-4">
                  <div className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider">Vastu / Facing</div>
                  {compareIds.map((cid) => {
                    const p = properties.find((item) => item.id === cid);
                    if (!p) return <div key={cid} className="text-neutral-300">-</div>;
                    return (
                      <div key={cid} className="text-neutral-850 font-medium font-sans">
                        {p.facing} Facing
                      </div>
                    );
                  })}
                  {Array.from({ length: 3 - compareIds.length }).map((_, idx) => <div key={idx} className="text-neutral-300">-</div>)}
                </div>

                {/* 6. Locality Rating */}
                <div className="grid grid-cols-4 items-center py-2.5 border-b border-neutral-100 text-sm gap-4">
                  <div className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider">Locality Infra</div>
                  {compareIds.map((cid) => {
                    const p = properties.find((item) => item.id === cid);
                    if (!p) return <div key={cid} className="text-neutral-300">-</div>;
                    const rating = p.subLocality.includes('Jubilee') ? '4.9/5 Elite' : p.subLocality.includes('Financial') ? '4.8/5 Tech Hub' : '4.6/5 High Connect';
                    return (
                      <div key={cid} className="text-indigo-750 font-bold text-xs bg-indigo-50 px-2 py-1 rounded inline-block self-start font-mono">
                        {rating}
                      </div>
                    );
                  })}
                  {Array.from({ length: 3 - compareIds.length }).map((_, idx) => <div key={idx} className="text-neutral-300">-</div>)}
                </div>

                {/* 7. Key Amenities Comparison Checklist */}
                <div className="grid grid-cols-4 items-start py-3.5 border-b border-neutral-100 text-sm gap-4">
                  <div className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider">Vouched Amenities</div>
                  {compareIds.map((cid) => {
                    const p = properties.find((item) => item.id === cid);
                    if (!p) return <div key={cid} className="text-neutral-300">-</div>;
                    return (
                      <div key={cid} className="flex flex-wrap gap-1">
                        {p.amenities.map((amenity, amIdx) => (
                          <span key={amIdx} className="text-[10px] text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded font-sans">
                            • {amenity}
                          </span>
                        ))}
                      </div>
                    );
                  })}
                  {Array.from({ length: 3 - compareIds.length }).map((_, idx) => <div key={idx} className="text-neutral-300">-</div>)}
                </div>

                {/* 8. Action Connect */}
                <div className="grid grid-cols-4 items-center py-4 gap-4">
                  <div></div>
                  {compareIds.map((cid) => {
                    const p = properties.find((item) => item.id === cid);
                    if (!p) return <div key={cid} className="text-neutral-300">-</div>;
                    return (
                      <div key={cid}>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCompareModal(false);
                            onSelectProperty(p);
                          }}
                          className="w-full bg-slate-905 bg-emerald-600 text-white font-bold text-xs py-2 px-3 rounded-xl hover:bg-emerald-700 transition-colors uppercase cursor-pointer text-center"
                        >
                          Show Details &rarr;
                        </button>
                      </div>
                    );
                  })}
                  {Array.from({ length: 3 - compareIds.length }).map((_, idx) => <div key={idx} className="text-neutral-300">-</div>)}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-between items-center text-[10px] text-neutral-400 font-mono">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-neutral-400" /> Estimates based on real West Hyderabad real estate registry benchmarks.
              </span>
              <button
                type="button"
                className="font-bold text-slate-800 hover:text-emerald-700 bg-white border border-neutral-200 px-4 py-2 rounded-xl text-xs uppercase cursor-pointer shadow-3xs transition-all"
                onClick={() => setShowCompareModal(false)}
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
