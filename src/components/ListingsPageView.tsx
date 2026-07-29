/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Property } from "../types";
import { NearbyInfrastructureModal } from "./NearbyInfrastructureModal";
import {
  Search,
  SlidersHorizontal,
  Grid,
  Map as MapIcon,
  Bed,
  Square,
  Compass,
  Heart,
  Eye,
  ArrowRight,
  X,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  Info,
  Check,
  BadgePercent,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

interface ListingsPageViewProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  initialFilters?: {
    type?: "Rent" | "Buy";
    search?: string;
    subLocality?: string;
  };
  savedIds: string[];
  onToggleSave: (id: string) => void;
}

export interface AppreciationData {
  rateYoY: number;
  trendStatus: "hyper" | "steady" | "stagnant";
  trendLabel: string;
  historicalPrices: { year: number; price: number }[];
  demandScore: number;
  averageSqFtPriceTrend: number[];
  growthFactorText: string;
}

export function getAppreciationTrend(p: Property): AppreciationData {
  const loc = p.subLocality ? p.subLocality.toLowerCase() : "";
  let rateYoY = 8.5;
  let trendStatus: "hyper" | "steady" | "stagnant" = "steady";
  let trendLabel = "Steady Growth";
  let demandScore = 75;
  let growthFactorText =
    "Fueled by steady baseline demand and prime urban access routes.";

  if (loc.includes("jubilee")) {
    rateYoY = 15.6;
    trendStatus = "hyper";
    trendLabel = "Hyper-Growth Horizon";
    demandScore = 98;
    growthFactorText =
      "Backed by generational elite land heritage and premium lifestyle amenities.";
  } else if (loc.includes("financial") || loc.includes("nanakramguda")) {
    rateYoY = 14.2;
    trendStatus = "hyper";
    trendLabel = "Hyper-Growth Zone";
    demandScore = 95;
    growthFactorText =
      "Driven by intense banking hub expansions, tech corridors, and RERA security.";
  } else if (loc.includes("gachibowli")) {
    rateYoY = 12.4;
    trendStatus = "hyper";
    trendLabel = "High Demand Hotspot";
    demandScore = 91;
    growthFactorText =
      "Excellent IT hub proximity, premium co-working demand, and zero vacancy rates.";
  } else if (loc.includes("madhapur")) {
    rateYoY = 9.8;
    trendStatus = "steady";
    trendLabel = "Robust Steady Core";
    demandScore = 82;
    growthFactorText =
      "Established commercial district sustaining steady premium valuation trends.";
  } else if (loc.includes("kondapur")) {
    rateYoY = 7.4;
    trendStatus = "steady";
    trendLabel = "Consistent Retail Core";
    demandScore = 70;
    growthFactorText =
      "Steady residential flow driven by botanical park proximity and retail sectors.";
  } else if (loc.includes("banjara")) {
    rateYoY = 4.2;
    trendStatus = "stagnant";
    trendLabel = "Saturated Mature Asset";
    demandScore = 48;
    growthFactorText =
      "Highly valued area but experiencing stagnant price index movement due to layout density limits.";
  } else {
    const idNum = parseInt(p.id.replace(/\D/g, "")) || 5;
    if (idNum % 3 === 0) {
      rateYoY = 2.1;
      trendStatus = "stagnant";
      trendLabel = "Stagnant Growth Area";
      demandScore = 35;
      growthFactorText =
        "Established localized residential sector with stagnant rental index expansion.";
    } else if (idNum % 3 === 1) {
      rateYoY = 11.5;
      trendStatus = "hyper";
      trendLabel = "Ascending Hotspot";
      demandScore = 88;
      growthFactorText =
        "Spurred by fast-track road extensions and fresh corporate tech parks.";
    } else {
      rateYoY = 6.8;
      trendStatus = "steady";
      trendLabel = "Moderate Urban Steady";
      demandScore = 65;
      growthFactorText =
        "Comfortable baseline growth in an established middle-class tech submarket.";
    }
  }

  const years = [2022, 2023, 2024, 2025, 2026];
  const historicalPrices = years.map((year, idx) => {
    const diffYears = 2026 - year;
    const factor = Math.pow(1 + rateYoY / 100, -diffYears);
    const noiseFactor = 1 + Math.sin(year + p.title.length) * 0.012;
    const val = Math.round(p.price * factor * noiseFactor);
    return { year, price: val };
  });

  const averageSqFtPriceTrend = years.map((year, idx) => {
    const basePrice = historicalPrices[idx].price;
    return Math.round(basePrice / p.sizeSqFt);
  });

  return {
    rateYoY,
    trendStatus,
    trendLabel,
    historicalPrices,
    demandScore,
    averageSqFtPriceTrend,
    growthFactorText,
  };
}

export const AppreciationTrendGauge: React.FC<{
  property: Property;
  showDetailedMode?: boolean;
}> = ({ property, showDetailedMode = false }) => {
  const trend = getAppreciationTrend(property);

  let colorClass = "text-emerald-700 bg-emerald-50 border-emerald-250";
  let strokeColor = "#10b981";
  let gradId = `sparkline-grad-${property.id}`;
  let gradStopColor = "#10b981";

  if (trend.trendStatus === "steady") {
    colorClass = "text-sky-700 bg-sky-50 border-sky-250";
    strokeColor = "#0ea5e9";
    gradStopColor = "#0ea5e9";
  } else if (trend.trendStatus === "stagnant") {
    colorClass = "text-slate-600 bg-slate-100 border-slate-350";
    strokeColor = "#94a3b8";
    gradStopColor = "#94a3b8";
  }

  if (!showDetailedMode) {
    return (
      <div
        id={`appreciation-grid-badge-${property.id}`}
        className="mt-2 flex items-center justify-between w-full border border-dashed border-slate-200/60 p-2 rounded-xl bg-slate-50/50"
      >
        <div className="flex flex-col">
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
            Appreciation Trend
          </span>
          <span className="text-[10px] font-bold text-slate-800 flex items-center gap-0.5 mt-0.5">
            {trend.trendStatus === "hyper" && (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            )}
            {trend.trendStatus === "steady" && (
              <TrendingUp className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            )}
            {trend.trendStatus === "stagnant" && (
              <Minus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            +{trend.rateYoY}% YoY
          </span>
        </div>

        <div
          className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-bold border ${colorClass}`}
        >
          {trend.trendStatus === "hyper"
            ? "🔥 Hyper"
            : trend.trendStatus === "steady"
              ? "📈 Steady"
              : "⏸ Mature"}
        </div>
      </div>
    );
  }

  const minVal = Math.min(...trend.historicalPrices.map((h) => h.price));
  const maxVal = Math.max(...trend.historicalPrices.map((h) => h.price));
  const range = maxVal - minVal || 1;
  const width = 220;
  const height = 55;
  const padding = 6;
  const points = trend.historicalPrices
    .map((v, i) => {
      const x =
        padding +
        (i / (trend.historicalPrices.length - 1)) * (width - padding * 2);
      const y =
        height -
        padding -
        ((v.price - minVal) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div
      id={`appreciation-detailed-gauge-${property.id}`}
      className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide block">
            Market Index Target
          </span>
          <h4 className="font-display font-semibold text-slate-900 text-xs">
            Appreciation Level
          </h4>
        </div>

        <div className="flex flex-col items-end">
          <span
            className={`text-[11px] font-black tracking-tight flex items-center gap-1 px-2 py-1 rounded-lg border font-mono ${colorClass}`}
          >
            {trend.trendStatus === "hyper" && (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0 animate-pulse" />
            )}
            {trend.trendStatus === "steady" && (
              <TrendingUp className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            )}
            {trend.trendStatus === "stagnant" && (
              <Minus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            +{trend.rateYoY}% YoY
          </span>
          <span className="text-[8.5px] font-mono text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">
            {trend.trendLabel}
          </span>
        </div>
      </div>

      <div className="relative pt-1">
        <div className="bg-white border border-slate-150 rounded-xl p-3 flex flex-col justify-between items-center">
          <div className="w-full flex justify-between items-center text-[9px] font-mono text-slate-400 font-bold mb-1 border-b border-slate-50 pb-1">
            <span>Historical Trend</span>
            <span className="text-slate-550">Valuation Curve ('22 - '26)</span>
          </div>

          <div className="w-full h-14 relative flex items-center justify-center mt-1">
            <svg
              className="w-full h-full overflow-visible animate-fade-in"
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={gradStopColor}
                    stopOpacity="0.25"
                  />
                  <stop
                    offset="100%"
                    stopColor={gradStopColor}
                    stopOpacity="0.01"
                  />
                </linearGradient>
              </defs>

              <path
                d={`M ${padding},${height - padding} L ${points} L ${width - padding},${height - padding} Z`}
                fill={`url(#${gradId})`}
                stroke="none"
              />

              <polyline
                stroke={strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                points={points}
              />

              {trend.historicalPrices.map((v, i) => {
                const x =
                  padding +
                  (i / (trend.historicalPrices.length - 1)) *
                    (width - padding * 2);
                const y =
                  height -
                  padding -
                  ((v.price - minVal) / range) * (height - padding * 2);
                const isCurrent = i === trend.historicalPrices.length - 1;
                return (
                  <g key={v.year} className="group/dot">
                    <circle
                      cx={x}
                      cy={y}
                      r={isCurrent ? "4.5" : "3"}
                      fill={isCurrent ? strokeColor : "#ffffff"}
                      stroke={strokeColor}
                      strokeWidth={isCurrent ? "1.5" : "1"}
                    />
                    <text
                      x={x}
                      y={y < 15 ? y + 10 : y - 6}
                      textAnchor="middle"
                      className="text-[7px] font-mono font-bold fill-slate-500 pointer-events-none"
                    >
                      {v.year === 2026 ? "Now" : `'${String(v.year).slice(2)}`}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="w-full grid grid-cols-5 gap-1 mt-3 border-t border-slate-100 pt-2 text-[8px] font-mono text-center text-slate-400">
            {trend.historicalPrices.map((v, i) => {
              const compactVal =
                v.price >= 10000000
                  ? `₹${(v.price / 10000000).toFixed(1)}Cr`
                  : `₹${(v.price / 1000).toFixed(0)}K`;
              return (
                <div key={v.year} className="flex flex-col justify-between">
                  <span className="font-semibold text-slate-450">{v.year}</span>
                  <span className="text-slate-800 font-extrabold font-sans mt-0.5 text-[8px] whitespace-nowrap">
                    {compactVal}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-2 items-start bg-white p-2.5 rounded-xl border border-slate-150 text-[10.5px]">
        <span className="mt-0.5 shrink-0 block">
          {trend.trendStatus === "hyper" && (
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          )}
          {trend.trendStatus === "steady" && (
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
          )}
          {trend.trendStatus === "stagnant" && (
            <Info className="w-3.5 h-3.5 text-slate-400" />
          )}
        </span>
        <div className="space-y-0.5 text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-800 text-[11px] block">
            {trend.trendStatus === "hyper"
              ? "Hyper-Growth Corridor"
              : trend.trendStatus === "steady"
                ? "Established Strong Asset"
                : "Mature Secondary Asset"}
          </span>
          <p className="text-[10px] leading-snug">{trend.growthFactorText}</p>
        </div>
      </div>
    </div>
  );
};

export const ListingsPageView: React.FC<ListingsPageViewProps> = ({
  properties,
  onSelectProperty,
  initialFilters,
  savedIds,
  onToggleSave,
}) => {
  // Filters State
  const [rentOrBuy, setRentOrBuy] = useState<"Any" | "Buy" | "Rent">(
    initialFilters?.type || "Any",
  );
  const [searchQuery, setSearchQuery] = useState(initialFilters?.search || "");
  const [subLocality, setSubLocality] = useState(
    initialFilters?.subLocality || "Any",
  );
  const [bhkCount, setBhkCount] = useState<number | "Any">("Any");
  const [maxPrice, setMaxPrice] = useState<number>(60000000); // Max 6 Crores
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Advanced Portal Toggles (Real Estate comparison models)
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [zeroBrokerageOnly, setZeroBrokerageOnly] = useState(false);
  const [sortBy, setSortBy] = useState<
    "popular" | "price-low" | "price-high" | "size-high" | "value-sqft"
  >("popular");

  // Property Comparison states
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareWarning, setCompareWarning] = useState<string | null>(null);

  // Selected property for nearby infra map
  const [selectedNearbyProperty, setSelectedNearbyProperty] =
    useState<Property | null>(null);

  const handleToggleCompare = (propertyId: string, checked: boolean) => {
    if (checked) {
      if (compareIds.length >= 3) {
        setCompareWarning(
          "Side-by-side comparison is limited to max 3 items. Please uncheck another first.",
        );
        setTimeout(() => setCompareWarning(null), 4000);
        return;
      }
      setCompareIds([...compareIds, propertyId]);
    } else {
      setCompareIds(compareIds.filter((id) => id !== propertyId));
    }
  };

  // View Layout State (Grid vs Split vs Full Map View)
  const [viewMode, setViewMode] = useState<"Grid" | "Split" | "Map">("Grid");

  // Selected property on the Map marker
  const [selectedMapPropId, setSelectedMapPropId] = useState<string | null>(
    "prop-1",
  );

  // Toggle to show/hide 5km radius on the map view
  const [showMapRadius, setShowMapRadius] = useState<boolean>(true);

  // Sync changed filters from parent (e.g., when clicking preview)
  React.useEffect(() => {
    if (initialFilters) {
      if (initialFilters.type) setRentOrBuy(initialFilters.type);
      if (initialFilters.search !== undefined)
        setSearchQuery(initialFilters.search);
      if (initialFilters.subLocality)
        setSubLocality(initialFilters.subLocality);
    }
  }, [initialFilters]);

  // Filter and Sort logic (with NoBroker & Magicbricks metrics: verified, brokerage, pricing)
  const filteredProperties = useMemo(() => {
    let result = properties.filter((p) => {
      // Must be approved status
      if (p.status !== "Approved") return false;

      // Buy/Rent Type filter
      if (rentOrBuy !== "Any" && p.rentOrBuy !== rentOrBuy) return false;

      // Sub-locality filter
      if (subLocality !== "Any" && p.subLocality !== subLocality) return false;

      // BHK filter
      if (bhkCount !== "Any" && p.bedrooms !== bhkCount) return false;

      // Max Price filter - Handle different scaling for Rent vs Buy
      if (rentOrBuy === "Rent") {
        if (p.price > 150000) return false; // Default rent check
      } else {
        if (p.price > maxPrice) return false;
      }

      // Proportional verified filter (representing 99acres)
      // Gachibowli or Arjun-supported listings count as fully verified
      if (
        verifiedOnly &&
        p.id !== "prop-1" &&
        p.id !== "prop-2" &&
        p.id !== "prop-4" &&
        !p.title.toLowerCase().includes("ashok")
      ) {
        return false;
      }

      // Zero brokerage filter (representing NoBroker)
      // Let special direct owner properties count as direct listings (0 broker fees)
      if (
        zeroBrokerageOnly &&
        p.id !== "prop-1" &&
        p.id !== "prop-3" &&
        p.id !== "prop-5" &&
        !p.title.toLowerCase().includes("ashok")
      ) {
        return false;
      }

      // Dynamic Tag Category selection filter
      if (selectedCategory !== "All") {
        if (p.tags && p.tags.includes(selectedCategory)) {
          // Matching explicit tag in metadata
        } else if (p.tags && p.tags.length > 0) {
          // Has list of other tags but not this one
          return false;
        } else {
          // Dynamic fallback for newly added listing items without a populated tags array
          const isLuxury = p.price >= 20000000 || (p.rentOrBuy === 'Rent' && p.price >= 100000) || p.title.toLowerCase().includes('luxury') || p.title.toLowerCase().includes('penthouse') || p.title.toLowerCase().includes('estate') || p.title.toLowerCase().includes('villa');
          const isBudget = (p.rentOrBuy === 'Buy' && p.price <= 18000000) || (p.rentOrBuy === 'Rent' && p.price <= 70000);
          const isFamily = p.bedrooms >= 3 || p.amenities.some(a => a.toLowerCase().includes('play') || a.toLowerCase().includes('lawn') || a.toLowerCase().includes('school') || a.toLowerCase().includes('park') || a.toLowerCase().includes('kids'));

          if (selectedCategory === "Luxury" && !isLuxury) return false;
          if (selectedCategory === "Budget" && !isBudget) return false;
          if (selectedCategory === "Family-Friendly" && !isFamily) return false;
        }
      }

      // Keyword queries matching title, location, description, subLocality, amenities
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesLoc = p.location.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        const matchesAmenity = p.amenities.some((a) =>
          a.toLowerCase().includes(query),
        );
        if (!matchesTitle && !matchesLoc && !matchesDesc && !matchesAmenity)
          return false;
      }

      return true;
    });

    // Apply Sorting (replicate Magicbricks sorting)
    return [...result].sort((a, b) => {
      if (sortBy === "price-low") {
        return a.price - b.price;
      } else if (sortBy === "price-high") {
        return b.price - a.price;
      } else if (sortBy === "size-high") {
        return b.sizeSqFt - a.sizeSqFt;
      } else if (sortBy === "value-sqft") {
        const valueA = a.price / a.sizeSqFt;
        const valueB = b.price / b.sizeSqFt;
        return valueA - valueB;
      } else {
        // 'popular'
        return (b.views || 0) - (a.views || 0);
      }
    });
  }, [
    properties,
    rentOrBuy,
    subLocality,
    bhkCount,
    maxPrice,
    searchQuery,
    verifiedOnly,
    zeroBrokerageOnly,
    sortBy,
    selectedCategory,
  ]);

  const handleResetFilters = () => {
    setRentOrBuy("Any");
    setSearchQuery("");
    setSubLocality("Any");
    setBhkCount("Any");
    setMaxPrice(60000000);
    setVerifiedOnly(false);
    setZeroBrokerageOnly(false);
    setSortBy("popular");
    setSelectedCategory("All");
  };

  const getPriceLabel = (p: Property) => {
    if (p.rentOrBuy === "Rent") {
      return `₹${p.price.toLocaleString("en-IN")} / mo`;
    } else {
      const crVal = p.price / 10000000;
      return `₹${crVal.toFixed(2)} Cr`;
    }
  };

  // Mock Map Markers layout. Coordinate map ranges for standard SVG container dimensions (e.g. 500x400)
  const mapCoordinates: {
    [key: string]: { x: number; y: number; name: string };
  } = {
    "prop-1": { x: 180, y: 260, name: "Gachibowli" },
    "prop-2": { x: 380, y: 150, name: "Jubilee Hills" },
    "prop-3": { x: 310, y: 190, name: "Madhapur" },
    "prop-4": { x: 120, y: 310, name: "Financial District" },
    "prop-5": { x: 250, y: 110, name: "Kondapur" },
    "prop-6": { x: 440, y: 210, name: "Banjara Hills" },
  };

  const selectedMapProperty = properties.find(
    (p) => p.id === selectedMapPropId,
  );

  return (
    <div
      id="listings-view"
      className="space-y-8 animate-fade-in text-slate-800"
    >
      {/* Search and view switcher strip */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            OurHome Listings
          </h1>
          <p className="text-xs text-slate-450">
            Found {filteredProperties.length} vetted real estate matches in
            Hyderabad
          </p>
        </div>

        {/* Outer view toggle segment switches */}
        <div className="flex items-center gap-3">
          {/* Grid Map layout segmented controllers */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              id="view-grid-btn"
              type="button"
              onClick={() => setViewMode("Grid")}
              className={`flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === "Grid"
                  ? "bg-white text-emerald-600 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Grid View
            </button>
            <button
              id="view-split-btn"
              type="button"
              onClick={() => setViewMode("Split")}
              className={`flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === "Split"
                  ? "bg-white text-emerald-600 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" /> Split Map
            </button>
            <button
              id="view-map-btn"
              type="button"
              onClick={() => {
                setViewMode("Map");
                // Auto highlight first property on map so details load right away
                if (filteredProperties.length > 0 && !selectedMapPropId) {
                  setSelectedMapPropId(filteredProperties[0].id);
                }
              }}
              className={`flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === "Map"
                  ? "bg-white text-emerald-600 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-current animate-spin-slow" />{" "}
              Full Map
            </button>
          </div>
        </div>
      </div>

      {/* Category Selection Filter Pills */}
      <div id="category-pills-row" className="flex flex-wrap items-center gap-2 mt-2 bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mr-2 select-none">
          Property Tags:
        </span>
        {[
          { id: "All", label: "✨ All Listings" },
          { id: "Luxury", label: "💎 Luxury" },
          { id: "Budget", label: "🏷️ Budget" },
          { id: "Family-Friendly", label: "👨‍👩‍👧 Family-Friendly" },
        ].map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-sans font-semibold transition-all duration-150 border cursor-pointer ${
                isActive
                  ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                  : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Main Structural Layout (Filters + Listings Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Dynamic Left Sidebar Controls */}
        {viewMode !== "Map" && (
          <div
            id="listings-filters-sidebar"
            className="bg-white border border-slate-200 rounded-2xl p-5 space-y-6 self-start"
          >
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
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Acquisition Mode
              </label>
              <div className="bg-slate-100 p-1 rounded-xl flex border border-slate-200">
                {(["Any", "Buy", "Rent"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRentOrBuy(type)}
                    className={`flex-1 text-xs text-center py-1.5 rounded-lg transition-all ${
                      rentOrBuy === type
                        ? "bg-white text-emerald-600 font-semibold shadow-xs"
                        : "text-slate-550 hover:text-slate-800"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Dropdown selector */}
            <div className="space-y-1.5">
              <label
                htmlFor="location-select"
                className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block"
              >
                Sublocality
              </label>
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
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Beds (BHK)
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["Any", 2, 3, 4] as const).map((bhk) => (
                  <button
                    key={bhk}
                    type="button"
                    onClick={() => setBhkCount(bhk === "Any" ? "Any" : bhk)}
                    className={`text-xs py-1.5 rounded-xl border text-center transition-all ${
                      (bhk === "Any" && bhkCount === "Any") ||
                      (bhk !== "Any" && bhkCount === bhk)
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-350"
                    }`}
                  >
                    {bhk} {bhk !== "Any" ? "B" : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider price filter (Only relevant for Buy, for Rent we show automated budget block) */}
            {rentOrBuy !== "Rent" && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slate-450 uppercase tracking-wider">
                    Max Price Valuation
                  </span>
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

            {rentOrBuy === "Rent" && (
              <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl">
                <p className="text-[10px] font-mono text-sky-700 font-semibold tracking-wider">
                  RENT DEALS ACTIVE
                </p>
                <p className="text-[11px] text-sky-650 mt-1 leading-relaxed">
                  Lease listings currently range within ₹40K to ₹1.2L per month
                  in active high street communities.
                </p>
              </div>
            )}

            {/* Quick Search Key Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="filter-query"
                className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block"
              >
                Keyword Queries
              </label>
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
              <label
                htmlFor="sort-select"
                className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block flex items-center gap-1"
              >
                <ArrowUpDown className="w-3 h-3 text-neutral-400" /> Sort
                Results
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
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
                Portal Features
              </span>

              <label className="flex items-start gap-2.5 cursor-pointer group text-xs text-neutral-700 select-none">
                <input
                  type="checkbox"
                  checked={zeroBrokerageOnly}
                  onChange={(e) => setZeroBrokerageOnly(e.target.checked)}
                  className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 mt-0.5 accent-emerald-600"
                />
                <span className="space-y-0.5">
                  <span className="font-bold flex items-center gap-1 group-hover:text-amber-600 transition-colors">
                    Zero Brokerage{" "}
                    <span className="bg-amber-100 text-amber-800 font-mono text-[8.5px] px-1 py-0.2 rounded-sm uppercase tracking-wider font-bold">
                      No-Broker
                    </span>
                  </span>
                  <span className="text-[10px] text-neutral-400 block leading-tight">
                    Direct builder/owner deals, zero brokerage fees
                  </span>
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
                    RERA Registered{" "}
                    <span className="bg-indigo-50 text-indigo-700 font-mono text-[8.5px] px-1 py-0.2 rounded-sm uppercase tracking-wider font-bold">
                      99acres
                    </span>
                  </span>
                  <span className="text-[10px] text-neutral-400 block leading-tight">
                    Verified certifications & RERA registered projects only
                  </span>
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Listings Display Block (Grid or Split or Full Map Views) */}
        <div
          id="listings-display-block"
          className={
            viewMode === "Map"
              ? "col-span-1 lg:col-span-4"
              : "col-span-1 lg:col-span-3"
          }
        >
          {viewMode === "Grid" &&
            /* SIMPLE GRID SECTION */
            (filteredProperties.length === 0 ? (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-12 text-center space-y-4">
                <p className="text-sm text-slate-400">
                  No properties matching your specific filters were discovered.
                </p>
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
                            {p.rentOrBuy === "Buy" ? "Buy" : "Rent"}
                          </span>
                          <span className="bg-slate-950/85 text-amber-350 border border-amber-500/20 font-mono text-[8px] font-extrabold py-0.5 px-1.5 rounded-sm uppercase shrink-0">
                            0 Brokerage
                          </span>
                          {(p.id === "prop-1" ||
                            p.id === "prop-2" ||
                            p.id === "prop-4" ||
                            p.title.toLowerCase().includes("ashok")) && (
                            <span className="bg-neutral-900/90 text-emerald-300 border border-emerald-500/20 font-mono text-[8px] font-extrabold py-0.5 px-1.5 rounded-sm uppercase shrink-0 flex items-center gap-0.5">
                              ✓ RERA Approved
                            </span>
                          )}
                          <span className="bg-emerald-700/90 text-white border border-emerald-600/25 font-mono text-[8px] font-extrabold py-0.5 px-1.5 rounded-sm uppercase shrink-0 flex items-center gap-0.5 shadow-xs">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-300 shrink-0" />{" "}
                            Verified Deal
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSave(p.id);
                          }}
                          className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md border shadow-xs ${
                            isSaved
                              ? "bg-rose-50 border-rose-100 text-rose-500"
                              : "bg-white/70 border-white/10 text-slate-600 hover:text-rose-500"
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
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {p.location}
                          </p>
                          <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-slate-500">
                            <span>{p.bedrooms} BHK</span>
                            <span>•</span>
                            <span>{p.sizeSqFt} SQFT</span>
                            <span>•</span>
                            <span>{p.facing}</span>
                          </div>

                          {/* Dynamic Property Tags */}
                          <div id={`property-tags-${p.id}`} className="flex flex-wrap gap-1 pt-1">
                            {(p.tags && p.tags.length > 0 ? p.tags : (() => {
                              const tagsList: string[] = [];
                              const isLux = p.price >= 20000000 || (p.rentOrBuy === 'Rent' && p.price >= 100000) || p.title.toLowerCase().includes('luxury') || p.title.toLowerCase().includes('penthouse') || p.title.toLowerCase().includes('estate') || p.title.toLowerCase().includes('villa');
                              const isBudg = (p.rentOrBuy === 'Buy' && p.price <= 18000000) || (p.rentOrBuy === 'Rent' && p.price <= 70000);
                              const isFam = p.bedrooms >= 3 || p.amenities.some(a => a.toLowerCase().includes('play') || a.toLowerCase().includes('lawn') || a.toLowerCase().includes('school') || a.toLowerCase().includes('park') || a.toLowerCase().includes('kids'));
                              if (isLux) tagsList.push('Luxury');
                              if (isBudg) tagsList.push('Budget');
                              if (isFam) tagsList.push('Family-Friendly');
                              if (tagsList.length === 0) tagsList.push('Modern');
                              return tagsList;
                            })()).map((tag) => (
                              <span
                                key={tag}
                                className={`text-[8.5px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider font-mono ${
                                  tag === 'Luxury'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : tag === 'Budget'
                                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Visual Appreciation Trend Gauge */}
                          <AppreciationTrendGauge property={p} />
                        </div>

                        <div className="mt-4 pt-2 border-t border-slate-50 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onSelectProperty(p)}
                              className="font-bold text-emerald-700 hover:text-emerald-600 inline-flex items-center gap-1 group bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-100 hover:border-neutral-250 transition-all cursor-pointer"
                            >
                              Explore{" "}
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </button>

                            <button
                              type="button"
                              id={`card-nearby-btn-${p.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNearbyProperty(p);
                              }}
                              className="font-bold text-slate-600 hover:text-emerald-700 inline-flex items-center gap-1 bg-neutral-50 hover:bg-emerald-50/50 px-2.5 py-1.5 rounded-xl border border-neutral-105 hover:border-emerald-250 transition-all cursor-pointer"
                              title="Show nearby schools, hospitals & transit hubs"
                            >
                              <Compass className="w-3.5 h-3.5 text-slate-500" />
                              <span>Nearby</span>
                            </button>
                          </div>

                          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-mono font-bold text-neutral-500 select-none hover:text-slate-900 bg-neutral-50 hover:bg-neutral-100 px-2.5 py-1.5 rounded-xl border border-neutral-100 transition-all">
                            <input
                              type="checkbox"
                              checked={compareIds.includes(p.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleToggleCompare(p.id, e.target.checked);
                              }}
                              className="rounded border-neutral-300 text-emerald-650 focus:ring-emerald-500 w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
                            />
                            <span>
                              {compareIds.includes(p.id)
                                ? "Compared"
                                : "Compare"}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

          {viewMode === "Split" && (
            /* SPLIT DESKTOP VIEW WITH VECTOR WEB-MAP CHART */
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[500px]">
              {/* Left Column list (Vertical compact list) */}
              <div className="lg:col-span-2 overflow-y-auto pr-1 h-full space-y-3">
                {filteredProperties.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-xl text-center">
                    <p className="text-xs text-slate-400">
                      No properties matching scope.
                    </p>
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
                            ? "bg-emerald-50 text-slate-900 border-emerald-350 scale-[0.99] shadow-xs"
                            : "bg-white text-slate-800 border-slate-100 hover:border-slate-200"
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
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-display font-medium text-xs truncate leading-tight">
                                {p.title}
                              </h4>
                              {p.tags && p.tags.length > 0 && (
                                <span
                                  className={`text-[7.5px] font-bold px-1.5 py-0.2 rounded-md border uppercase font-mono shrink-0 select-none ${
                                    p.tags[0] === 'Luxury'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : p.tags[0] === 'Budget'
                                        ? 'bg-sky-50 text-sky-800 border-sky-200'
                                        : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                  }`}
                                >
                                  {p.tags[0]}
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[10px] truncate flex items-center justify-between gap-1 mt-0.5 ${isSelectedOnMap ? "text-emerald-850 font-medium" : "text-slate-500"}`}
                            >
                              <span className="truncate">
                                {p.subLocality} • {p.bedrooms} BHK
                              </span>
                              <span
                                className={`text-[8.5px] font-mono font-bold px-1 py-0.1 select-none rounded border whitespace-nowrap inline-block shrink-0 leading-tight ${
                                  getAppreciationTrend(p).trendStatus ===
                                  "hyper"
                                    ? "text-emerald-700 bg-emerald-50 border-emerald-150"
                                    : getAppreciationTrend(p).trendStatus ===
                                        "steady"
                                      ? "text-sky-700 bg-sky-50 border-sky-150"
                                      : "text-slate-550 bg-slate-50 border-slate-200"
                                }`}
                              >
                                +{getAppreciationTrend(p).rateYoY}% YoY
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[11px] font-bold shrink-0 ${isSelectedOnMap ? "text-emerald-700" : "text-slate-900"}`}
                            >
                              {getPriceLabel(p)}
                            </span>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <label className="flex items-center gap-1 cursor-pointer text-[9px] font-mono font-bold text-neural-500 hover:text-slate-900 select-none bg-neutral-50 hover:bg-neutral-100 px-1.5 py-1 rounded border border-neutral-150/40 transition-all shrink-0">
                                <input
                                  type="checkbox"
                                  checked={compareIds.includes(p.id)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleToggleCompare(p.id, e.target.checked);
                                  }}
                                  className="rounded border-neutral-300 text-emerald-650 focus:ring-emerald-500 w-3 h-3 accent-emerald-600 cursor-pointer"
                                />
                                <span>
                                  {compareIds.includes(p.id)
                                    ? "Comp"
                                    : "Compare"}
                                </span>
                              </label>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectProperty(p);
                                }}
                                className={`text-[9px] font-semibold hover:underline shrink-0 ${
                                  isSelectedOnMap
                                    ? "text-emerald-700 font-bold"
                                    : "text-emerald-600"
                                }`}
                              >
                                Explore →
                              </button>
                            </div>
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
                <div className="p-3 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />{" "}
                    West Hyderabad Map Registry
                  </span>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-[10px] font-mono text-zinc-300 hover:text-white select-none bg-slate-900 border border-slate-750 px-2.5 py-1 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={showMapRadius}
                        onChange={(e) => setShowMapRadius(e.target.checked)}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-3 h-3 bg-slate-950 accent-emerald-600 cursor-pointer"
                      />
                      <span>Show 5km Boundary</span>
                    </label>
                    <span className="bg-emerald-600/20 text-emerald-300 font-mono text-[9px] py-0.5 px-1.5 rounded-md border border-emerald-500/20 md:block hidden">
                      Interactive
                    </span>
                  </div>
                </div>

                {/* Main Vector map body representation containing streets & layout bounds */}
                <div className="flex-1 relative bg-slate-900">
                  <svg
                    className="w-full h-full min-h-[300px]"
                    viewBox="0 0 500 380"
                  >
                    {/* Definitions */}
                    <defs>
                      <pattern
                        id="road-pattern"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                      >
                        <line
                          x1="0"
                          y1="20"
                          x2="40"
                          y2="20"
                          stroke="#1e293b"
                          strokeWidth="1"
                        />
                        <line
                          x1="20"
                          y1="0"
                          x2="20"
                          y2="40"
                          stroke="#1e293b"
                          strokeWidth="1"
                        />
                      </pattern>
                    </defs>

                    {/* Street pattern grid background */}
                    <rect
                      width="100%"
                      height="100%"
                      fill="url(#road-pattern)"
                    />

                    {/* District Area Boundaries Polygons */}
                    {/* Kondapur (Top representation) */}
                    <polygon
                      points="120,40 330,40 280,120 180,120"
                      fill="rgba(16, 185, 129, 0.05)"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                    <text
                      x="210"
                      y="70"
                      fill="#64748b"
                      className="text-[10px] font-display uppercase tracking-widest font-semibold pointer-events-none"
                      opacity="0.6"
                    >
                      Kondapur
                    </text>

                    {/* Jubilee Hills (Right top representation) */}
                    <polygon
                      points="330,40 480,80 440,180 340,180"
                      fill="rgba(16, 185, 129, 0.04)"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                    <text
                      x="370"
                      y="110"
                      fill="#64748b"
                      className="text-[10px] font-display uppercase tracking-widest font-semibold pointer-events-none"
                      opacity="0.6"
                    >
                      Jubilee Hills
                    </text>

                    {/* Madhapur (Central layout) */}
                    <polygon
                      points="180,120 340,120 310,230 200,210"
                      fill="rgba(14, 165, 233, 0.04)"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                    <text
                      x="235"
                      y="155"
                      fill="#64748b"
                      className="text-[10px] font-display uppercase tracking-widest font-semibold pointer-events-none"
                      opacity="0.6"
                    >
                      Madhapur
                    </text>

                    {/* Gachibowli (Left central layout) */}
                    <polygon
                      points="80,210 200,210 160,320 60,280"
                      fill="rgba(14, 165, 233, 0.05)"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                    <text
                      x="95"
                      y="245"
                      fill="#64748b"
                      className="text-[10px] font-display uppercase tracking-widest font-semibold pointer-events-none"
                      opacity="0.6"
                    >
                      Gachibowli
                    </text>

                    {/* Financial District (Bottom representation) */}
                    <polygon
                      points="60,280 160,320 120,380 40,360"
                      fill="rgba(16, 185, 129, 0.04)"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                    <text
                      x="50"
                      y="340"
                      fill="#64748b"
                      className="text-[9px] font-display uppercase tracking-widest pointer-events-none"
                      opacity="0.6"
                    >
                      Fin District
                    </text>

                    {/* Vector Arterial Roads representing Hyderabad Outer Ring Road (ORR) */}
                    <path
                      d="M 30,120 C 150,150 250,300 450,320"
                      fill="none"
                      stroke="#475569"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                    />
                    <text
                      x="140"
                      y="190"
                      fill="#475569"
                      className="text-[8px] font-mono pointer-events-none"
                      rotate="12"
                    >
                      Outer Ring Road (ORR)
                    </text>

                    {/* Lake representation (Durgam Cheruvu Lagoon) */}
                    <ellipse
                      cx="290"
                      cy="240"
                      rx="35"
                      ry="18"
                      fill="rgba(14, 165, 233, 0.15)"
                      stroke="#0ea5e9"
                      strokeWidth="1"
                    />
                    <text
                      x="260"
                      y="242"
                      fill="#0ea5e9"
                      className="text-[8px] font-mono pointer-events-none font-semibold"
                    >
                      Durgam Lake
                    </text>

                    {/* Clickable pins mapped dynamically */}
                    {Object.entries(mapCoordinates).map(([pId, coords]) => {
                      const listMatched = filteredProperties.find(
                        (fp) => fp.id === pId,
                      );
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
                            <g>
                              {showMapRadius && (
                                <g>
                                  <circle
                                    cx={coords.x}
                                    cy={coords.y}
                                    r="55"
                                    fill="rgba(16, 185, 129, 0.04)"
                                    stroke="#10b981"
                                    strokeWidth="1.5"
                                    strokeDasharray="3 2"
                                    className="pointer-events-none"
                                  />
                                  <text
                                    x={coords.x}
                                    y={coords.y + 64}
                                    textAnchor="middle"
                                    fill="#10b981"
                                    className="text-[7px] font-mono font-black uppercase tracking-wider select-none pointer-events-none fill-emerald-600"
                                  >
                                    5km Radius Services Bound
                                  </text>
                                </g>
                              )}
                              <circle
                                cx={coords.x}
                                cy={coords.y}
                                r="16"
                                fill="rgba(16, 185, 129, 0.3)"
                                className="animate-ping"
                                style={{
                                  transformOrigin: `${coords.x}px ${coords.y}px`,
                                }}
                              />
                            </g>
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
                            ₹
                            {listMatched.price >= 10000000
                              ? (listMatched.price / 10000000).toFixed(1) + "C"
                              : (listMatched.price / 1000).toFixed(0) + "K"}
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
                            {selectedMapProperty.subLocality} •{" "}
                            {selectedMapProperty.bedrooms} BHK
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

          {viewMode === "Map" && (
            /* NEW FULL-SCREEN INTERACTIVE MAP VIEW WITH FLOATING CONTROLS */
            <div
              id="full-screen-map-view"
              className="relative w-full h-[650px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col lg:flex-row animate-fade-in text-slate-800"
            >
              {/* Left Floating Filters Card HUD */}
              <div className="absolute top-4 left-4 z-20 w-72 bg-white/95 border border-slate-200/80 backdrop-blur-md rounded-2xl shadow-xl p-4 space-y-4 max-h-[90%] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-display font-bold text-xs text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-emerald-600 animate-spin-slow" />{" "}
                    Map Navigator
                  </h3>
                  <span className="bg-emerald-50 text-emerald-700 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    {filteredProperties.length} Pins Active
                  </span>
                </div>

                {/* Inner small elements for quick filters */}
                {/* 1. Keyword search */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tight block">
                    Search Query
                  </label>
                  <div className="relative flex items-center bg-slate-50 px-2.5 py-1.5 border border-slate-200 rounded-lg">
                    <Search className="w-3 h-3 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      placeholder="Pool, balcony..."
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-[11px] ml-1.5 bg-transparent outline-none border-none text-slate-800 placeholder-slate-400 focus:ring-0"
                    />
                  </div>
                </div>

                {/* 2. Acquisition Selector */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tight block">
                    Acquisition
                  </label>
                  <div className="bg-slate-100 p-0.5 rounded-lg flex border border-slate-200">
                    {(["Any", "Buy", "Rent"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setRentOrBuy(type)}
                        className={`flex-1 text-[10px] text-center py-1 rounded-md transition-all cursor-pointer ${
                          rentOrBuy === type
                            ? "bg-white text-emerald-700 font-bold shadow-xs"
                            : "text-slate-550 hover:text-slate-800"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Sublocality */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tight block">
                    Sublocality
                  </label>
                  <select
                    value={subLocality}
                    onChange={(e) => setSubLocality(e.target.value)}
                    className="w-full text-[11px] font-medium border border-slate-200 rounded-lg px-2 py-1 outline-none text-slate-800 focus:border-emerald-500 bg-white"
                  >
                    <option value="Any">Any Location</option>
                    <option value="Gachibowli">Gachibowli</option>
                    <option value="Madhapur">Madhapur</option>
                    <option value="Jubilee Hills">Jubilee Hills</option>
                    <option value="Financial District">
                      Financial District
                    </option>
                    <option value="Kondapur">Kondapur</option>
                    <option value="Banjara Hills">Banjara Hills</option>
                  </select>
                </div>

                {/* 4. Beds (BHK) */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tight block">
                    Beds (BHK)
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {(["Any", 2, 3, 4] as const).map((bhk) => (
                      <button
                        key={bhk}
                        type="button"
                        onClick={() => setBhkCount(bhk === "Any" ? "Any" : bhk)}
                        className={`text-[10px] py-1 rounded-lg border text-center transition-all cursor-pointer ${
                          (bhk === "Any" && bhkCount === "Any") ||
                          (bhk !== "Any" && bhkCount === bhk)
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold"
                            : "bg-white border-slate-200 text-slate-500"
                        }`}
                      >
                        {bhk}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Budget valuation */}
                {rentOrBuy !== "Rent" ? (
                  <div className="space-y-1 pt-1.5 border-t border-slate-100">
                    <div className="flex justify-between text-[9px] font-mono">
                      <span className="text-slate-400 font-bold uppercase">
                        Max Valuation
                      </span>
                      <span className="font-bold text-emerald-700">
                        ₹{(maxPrice / 10000000).toFixed(2)} Cr
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10000000}
                      max={60000000}
                      step={2500000}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>
                ) : (
                  <div className="bg-sky-50/70 border border-sky-100 p-2 rounded-lg text-[9px] text-sky-700 font-medium">
                    Rentals: ₹40K to ₹1.2L per month.
                  </div>
                )}

                {/* Quick Reset filters */}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[9px] py-1.5 rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Reset Criteria
                </button>
              </div>

              {/* Main Interactive Map Canvas */}
              <div className="flex-1 h-full relative bg-slate-900 overflow-hidden select-none">
                {/* Upper header statistics block */}
                <div className="absolute top-0 right-0 left-0 p-3 bg-slate-950/75 backdrop-blur-md border-b border-slate-800/50 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs z-10 pl-80 lg:pl-3">
                  <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />{" "}
                    Hyderabad Interactive Registry Grid Map
                  </span>
                  <div className="flex items-center gap-2.5 pointer-events-auto">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-[10px] font-mono text-zinc-300 hover:text-white select-none bg-slate-900 border border-slate-750 px-2.5 py-1 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={showMapRadius}
                        onChange={(e) => setShowMapRadius(e.target.checked)}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-3 h-3 bg-slate-950 accent-emerald-600 cursor-pointer"
                      />
                      <span>Show 5km Boundary</span>
                    </label>
                    <span className="bg-emerald-600/20 text-emerald-300 font-mono text-[8.5px] py-0.5 px-2 rounded-md border border-emerald-500/20 uppercase font-bold md:block hidden">
                      Interactive Pins Map
                    </span>
                  </div>
                </div>

                <svg
                  className="w-full h-full min-h-[350px]"
                  viewBox="0 0 500 380"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <defs>
                    <pattern
                      id="road-pattern-full"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <line
                        x1="0"
                        y1="20"
                        x2="40"
                        y2="20"
                        stroke="#182235"
                        strokeWidth="1"
                      />
                      <line
                        x1="20"
                        y1="0"
                        x2="20"
                        y2="40"
                        stroke="#182235"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>

                  {/* Map Grid Background */}
                  <rect
                    width="100%"
                    height="100%"
                    fill="url(#road-pattern-full)"
                  />

                  {/* District Boundaries */}
                  <polygon
                    points="120,40 330,40 280,120 180,120"
                    fill="rgba(16, 185, 129, 0.04)"
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  <text
                    x="210"
                    y="70"
                    fill="#475569"
                    className="text-[9px] font-sans uppercase tracking-widest font-bold pointer-events-none"
                    opacity="0.5"
                  >
                    Kondapur Hub
                  </text>

                  <polygon
                    points="330,40 480,80 440,180 340,180"
                    fill="rgba(16, 185, 129, 0.03)"
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  <text
                    x="375"
                    y="110"
                    fill="#475569"
                    className="text-[9px] font-sans uppercase tracking-widest font-bold pointer-events-none"
                    opacity="0.5"
                  >
                    Jubilee Hills Elite
                  </text>

                  <polygon
                    points="180,120 340,120 310,230 200,210"
                    fill="rgba(14, 165, 233, 0.03)"
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  <text
                    x="235"
                    y="155"
                    fill="#475569"
                    className="text-[9px] font-sans uppercase tracking-widest font-bold pointer-events-none"
                    opacity="0.5"
                  >
                    Madhapur Tech
                  </text>

                  <polygon
                    points="80,210 200,210 160,320 60,280"
                    fill="rgba(14, 165, 233, 0.04)"
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  <text
                    x="95"
                    y="245"
                    fill="#475569"
                    className="text-[9px] font-sans uppercase tracking-widest font-bold pointer-events-none"
                    opacity="0.5"
                  >
                    Gachibowli Area
                  </text>

                  <polygon
                    points="60,280 160,320 120,380 40,360"
                    fill="rgba(16, 185, 129, 0.03)"
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  <text
                    x="50"
                    y="340"
                    fill="#475569"
                    className="text-[8px] font-sans uppercase tracking-widest pointer-events-none"
                    opacity="0.5"
                  >
                    Financial Dist
                  </text>

                  {/* Outer Ring Road */}
                  <path
                    d="M 30,120 C 150,150 250,300 450,320"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                  />
                  <text
                    x="140"
                    y="190"
                    fill="#334155"
                    className="text-[7.5px] font-mono pointer-events-none"
                    rotate="12"
                  >
                    Outer Ring Road (ORR)
                  </text>

                  {/* Lake Durgam */}
                  <ellipse
                    cx="290"
                    cy="240"
                    rx="35"
                    ry="18"
                    fill="rgba(14, 165, 233, 0.12)"
                    stroke="#0284c7"
                    strokeWidth="1"
                  />
                  <text
                    x="262"
                    y="242"
                    fill="#0ea5e9"
                    className="text-[7.5px] font-mono font-bold pointer-events-none"
                  >
                    Durgam Lake
                  </text>

                  {/* Interactive Pin Markers */}
                  {Object.entries(mapCoordinates).map(([pId, coords]) => {
                    const listMatched = filteredProperties.find(
                      (fp) => fp.id === pId,
                    );
                    const isHovered = selectedMapPropId === pId;

                    if (!listMatched) return null;

                    return (
                      <g
                        key={pId}
                        className="cursor-pointer group"
                        onClick={() => setSelectedMapPropId(pId)}
                      >
                        {/* Animated concentric radar rings */}
                        {isHovered && (
                          <g>
                            {showMapRadius && (
                              <g>
                                <circle
                                  cx={coords.x}
                                  cy={coords.y}
                                  r="55"
                                  fill="rgba(16, 185, 129, 0.04)"
                                  stroke="#10b981"
                                  strokeWidth="1.5"
                                  strokeDasharray="3 2"
                                  className="pointer-events-none"
                                />
                                <text
                                  x={coords.x}
                                  y={coords.y + 64}
                                  textAnchor="middle"
                                  fill="#10b981"
                                  className="text-[7px] font-mono font-black uppercase tracking-wider select-none pointer-events-none fill-emerald-600"
                                >
                                  5km Radius Services Bound
                                </text>
                              </g>
                            )}
                            <circle
                              cx={coords.x}
                              cy={coords.y}
                              r="15"
                              fill="rgba(16, 185, 129, 0.35)"
                              className="animate-ping"
                              style={{
                                transformOrigin: `${coords.x}px ${coords.y}px`,
                              }}
                            />
                          </g>
                        )}

                        {/* Outer pin shade */}
                        <circle
                          cx={coords.x}
                          cy={coords.y}
                          r={isHovered ? "9" : "7"}
                          fill={isHovered ? "#38bdf8" : "#059669"}
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="transition-all duration-300"
                        />

                        {/* Inner pin point */}
                        <circle
                          cx={coords.x}
                          cy={coords.y}
                          r="3"
                          fill="#ffffff"
                        />

                        {/* Float visual pricing tag overlay */}
                        <g
                          transform={`translate(${coords.x}, ${coords.y - 14})`}
                        >
                          {/* Translucent tag background */}
                          <rect
                            x="-26"
                            y="-9"
                            width="52"
                            height="14"
                            rx="4"
                            fill={isHovered ? "#0ea5e9" : "#0f172a"}
                            stroke={isHovered ? "#38bdf8" : "#334155"}
                            strokeWidth="1.5"
                            className="transition-all duration-300"
                          />
                          <text
                            textAnchor="middle"
                            y="1"
                            fill="#ffffff"
                            className="text-[8px] font-mono font-black select-none pointer-events-none"
                          >
                            ₹
                            {listMatched.price >= 10000000
                              ? (listMatched.price / 10000000).toFixed(1) + "C"
                              : (listMatched.price / 1000).toFixed(0) + "K"}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>

                {/* Overlaid Bottom Legend / Alert Banner */}
                <div className="absolute bottom-4 right-4 z-10 bg-slate-950/80 backdrop-blur-md border border-slate-850 px-3 py-1.5 rounded-xl text-[9px] text-slate-300 font-mono pointer-events-none flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
                  Active Properties showing on pins
                </div>

                {/* No Match Warnings overlay inside canvas */}
                {filteredProperties.length === 0 && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-6 z-30">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl max-w-sm text-center space-y-4">
                      <Compass className="w-10 h-10 text-slate-550 mx-auto animate-bounce" />
                      <h4 className="font-display font-bold text-white text-sm">
                        No Pins Found
                      </h4>
                      <p className="text-xs text-slate-400">
                        Expand filter parameters or keyword queries to
                        repopulate localized pins.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer"
                      >
                        Show All Properties
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Slider details card panel */}
              <div className="w-80 h-full border-l border-neutral-200 bg-white flex flex-col justify-between shrink-0 z-10">
                {selectedMapProperty ? (
                  <div className="flex flex-col h-full justify-between animate-fade-in text-slate-800">
                    {/* Title block */}
                    <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-display font-medium text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                          Property Inspector
                        </h4>
                        <span className="font-mono text-[9px] text-zinc-400">
                          {selectedMapProperty.subLocality} Community
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedMapPropId(null)}
                        className="p-1 hover:bg-slate-105 text-slate-400 hover:text-slate-800 rounded-full transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Info components scroll block */}
                    <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
                      {/* Interactive image frame */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm shrink-0">
                        <img
                          src={selectedMapProperty.images[0]}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-md">
                          {selectedMapProperty.bedrooms} BHK Spec
                        </span>
                      </div>

                      {/* Title & subtitle label */}
                      <div className="space-y-1">
                        <h3 className="font-display font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                          {selectedMapProperty.title}
                        </h3>
                        <p className="text-[10px] text-slate-400 truncate leading-tight">
                          {selectedMapProperty.location}
                        </p>
                      </div>

                      {/* Budget Tag info banner */}
                      <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 flex justify-between items-center text-xs">
                        <span className="font-mono text-[9px] text-slate-450 uppercase tracking-wider font-bold">
                          Registry Price
                        </span>
                        <span className="font-display font-black text-emerald-800">
                          {getPriceLabel(selectedMapProperty)}
                        </span>
                      </div>

                      {/* Metrics specs list */}
                      <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono">
                        <div className="bg-slate-50 border border-slate-150 rounded-lg p-2.5 flex flex-col justify-center">
                          <span className="text-[8.5px] text-neutral-400 uppercase tracking-tight flex items-center gap-0.5">
                            <Square className="w-2.5 h-2.5 shrink-0" /> Carpet
                            Area
                          </span>
                          <span className="font-bold text-slate-800 mt-0.5">
                            {selectedMapProperty.sizeSqFt.toLocaleString()} sqft
                          </span>
                        </div>
                        <div className="bg-slate-50 border border-slate-150 rounded-lg p-2.5 flex flex-col justify-center">
                          <span className="text-[8.5px] text-neutral-400 uppercase tracking-tight flex items-center gap-0.5">
                            <Compass className="w-2.5 h-2.5 shrink-0" /> Vastu
                            Side
                          </span>
                          <span className="font-bold text-slate-700 mt-0.5">
                            {selectedMapProperty.facing} Side
                          </span>
                        </div>
                      </div>

                      {/* Appreciation Trend Detailed visual gauge representation */}
                      <AppreciationTrendGauge
                        property={selectedMapProperty}
                        showDetailedMode={true}
                      />

                      {/* Description excerpt text */}
                      <div className="space-y-1">
                        <span className="text-[8.5px] font-mono text-neutral-400 uppercase tracking-tight block font-bold">
                          Description
                        </span>
                        <p className="text-[10.5px] text-neutral-500 leading-relaxed line-clamp-4">
                          {selectedMapProperty.description}
                        </p>
                      </div>

                      {/* Verified amenities list */}
                      <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                        <span className="text-[8.5px] font-mono text-neutral-400 uppercase tracking-tight block font-bold">
                          Verifiable Perks
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {selectedMapProperty.amenities
                            .slice(0, 3)
                            .map((amenity, amIdx) => (
                              <span
                                key={amIdx}
                                className="text-[8.5px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50 block truncate max-w-[200px]"
                              >
                                {amenity}
                              </span>
                            ))}
                          {selectedMapProperty.amenities.length > 3 && (
                            <span className="text-[8.5px] text-slate-400 font-mono pt-0.5">
                              +{selectedMapProperty.amenities.length - 3} perks
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Inspect button and Compare control */}
                    <div className="p-4 border-t border-slate-150 bg-slate-50/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-mono font-bold text-neutral-550 select-none hover:text-slate-900">
                          <input
                            type="checkbox"
                            checked={compareIds.includes(
                              selectedMapProperty.id,
                            )}
                            onChange={(e) =>
                              handleToggleCompare(
                                selectedMapProperty.id,
                                e.target.checked,
                              )
                            }
                            className="rounded border-neutral-300 text-emerald-650 focus:ring-emerald-500 w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
                          />
                          <span>
                            {compareIds.includes(selectedMapProperty.id)
                              ? "Marked for Comparison"
                              : "Side-by-Side Compare"}
                          </span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectProperty(selectedMapProperty)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all font-display uppercase tracking-wider text-center flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Explore Property Details{" "}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-center p-6 text-slate-400 space-y-3">
                    <Compass className="w-10 h-10 text-slate-350 animate-pulse animate-spin-slow" />
                    <div>
                      <p className="font-bold text-xs text-slate-800 font-display">
                        Select Map Pin
                      </p>
                      <p className="text-[9.5px] text-slate-400 leading-normal max-w-[190px] mx-auto mt-1">
                        Pinpoints represent vetted Hyderabad listings under
                        RERA. Tap an active pin to trigger high-fidelity virtual
                        diagnostics.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FLOATING COMPARISON TOOLBAR (inspired by Magicbricks & 99acres) */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl bg-white/95 border border-emerald-400/30 rounded-2xl shadow-2xl px-5 py-3.5 flex items-center justify-between gap-4 animate-fade-in ring-4 ring-emerald-55/45 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white rounded-lg p-1.5 shrink-0 shadow-sm shadow-emerald-600/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 tracking-wide">
                Property Compare Shelf
              </p>
              <p className="text-[10px] text-emerald-800 font-mono font-bold">
                {compareIds.length} of 3 properties selected
              </p>
            </div>
            {/* Small image thumbnails of compared items */}
            <div className="hidden sm:flex items-center -space-x-2 ml-1">
              {compareIds.map((cid) => {
                const p = properties.find((item) => item.id === cid);
                if (!p) return null;
                return (
                  <div
                    key={cid}
                    className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-neutral-250 shadow-sm"
                  >
                    <img
                      src={p.images[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCompareIds([])}
              className="px-3 py-1.5 hover:bg-slate-100 text-[10px] uppercase font-mono font-bold text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setShowCompareModal(true)}
              className={`px-4 py-2 font-display font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
                compareIds.length >= 2
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md animate-pulse"
                  : "bg-neutral-100 text-slate-400 cursor-not-allowed"
              }`}
              disabled={compareIds.length < 2}
            >
              {compareIds.length < 2 ? "Select 2+ Min" : `Compare (2/3) →`}
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
            <div className="p-6 overflow-x-auto flex-1 text-slate-800 scrollbar-thin">
              <div className="min-w-[800px] space-y-6">
                <div className="grid grid-cols-4 border-b border-neutral-100 pb-6 mb-6 gap-4">
                  {/* Metric Labels Column */}
                  <div className="flex flex-col justify-end text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest pb-4">
                    Property Specs
                  </div>

                  {/* Property Columns */}
                  {compareIds.map((cid) => {
                    const p = properties.find((item) => item.id === cid);
                    if (!p)
                      return (
                        <div
                          key={cid}
                          className="p-4 text-center bg-neutral-50 rounded-xl"
                        >
                          Empty Match
                        </div>
                      );
                    return (
                      <div key={cid} className="space-y-3 relative group">
                        <button
                          type="button"
                          onClick={() =>
                            setCompareIds(compareIds.filter((id) => id !== cid))
                          }
                          className="absolute -top-2 -right-2 p-1.5 bg-rose-50 border border-rose-105 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-xs z-10 cursor-pointer"
                          title="Remove from comparison list"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="aspect-video rounded-xl bg-neutral-100 overflow-hidden border border-neutral-200">
                          <img
                            src={p.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-display font-bold text-slate-900 text-sm line-clamp-1">
                            {p.title}
                          </h4>
                          <p className="text-[10px] font-mono text-slate-500 truncate">
                            {p.location}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Fill empty comparison slot if fewer than 3 properties are being compared */}
                  {Array.from({ length: 3 - compareIds.length }).map(
                    (_, idx) => (
                      <div
                        key={idx}
                        className="border-2 border-dashed border-neutral-200 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-neutral-50/50"
                      >
                        <SlidersHorizontal className="w-5 h-5 text-neutral-300 mb-2 animate-pulse" />
                        <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider">
                          Empty Slot
                        </span>
                        <span className="text-[9px] text-neutral-400 mt-1">
                          Select more options to compare
                        </span>
                      </div>
                    ),
                  )}
                </div>

                {/* Rows of details comparison */}
                <div className="space-y-4">
                  {/* 1. Price */}
                  <div className="grid grid-cols-4 items-center py-2.5 border-b border-neutral-100 text-sm gap-4">
                    <div className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Pricing Package
                    </div>
                    {compareIds.map((cid) => {
                      const p = properties.find((item) => item.id === cid);
                      if (!p)
                        return (
                          <div key={cid} className="text-neutral-300">
                            -
                          </div>
                        );
                      return (
                        <div
                          key={cid}
                          className="font-display font-extrabold text-emerald-800 text-base"
                        >
                          {getPriceLabel(p)}
                        </div>
                      );
                    })}
                    {Array.from({ length: 3 - compareIds.length }).map(
                      (_, idx) => (
                        <div key={idx} className="text-neutral-300">
                          -
                        </div>
                      ),
                    )}
                  </div>

                  {/* 2. BHK Size */}
                  <div className="grid grid-cols-4 items-center py-2.5 border-b border-neutral-100 text-sm gap-4">
                    <div className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Layout (BHK)
                    </div>
                    {compareIds.map((cid) => {
                      const p = properties.find((item) => item.id === cid);
                      if (!p)
                        return (
                          <div key={cid} className="text-neutral-300">
                            -
                          </div>
                        );
                      return (
                        <div key={cid} className="text-neutral-850 font-bold">
                          {p.bedrooms} BHK configuration
                        </div>
                      );
                    })}
                    {Array.from({ length: 3 - compareIds.length }).map(
                      (_, idx) => (
                        <div key={idx} className="text-neutral-300">
                          -
                        </div>
                      ),
                    )}
                  </div>

                  {/* 3. Carpet Area */}
                  <div className="grid grid-cols-4 items-center py-2.5 border-b border-neutral-100 text-sm gap-4">
                    <div className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Carpet Area
                    </div>
                    {compareIds.map((cid) => {
                      const p = properties.find((item) => item.id === cid);
                      if (!p)
                        return (
                          <div key={cid} className="text-neutral-300">
                            -
                          </div>
                        );
                      return (
                        <div
                          key={cid}
                          className="text-neutral-850 font-mono font-semibold"
                        >
                          {p.sizeSqFt.toLocaleString()} sq.ft.
                        </div>
                      );
                    })}
                    {Array.from({ length: 3 - compareIds.length }).map(
                      (_, idx) => (
                        <div key={idx} className="text-neutral-300">
                          -
                        </div>
                      ),
                    )}
                  </div>

                  {/* 4. Value Score */}
                  <div className="grid grid-cols-4 items-center py-2.5 border-b border-neutral-100 text-sm gap-4">
                    <div className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Price / SqFt Value
                    </div>
                    {compareIds.map((cid) => {
                      const p = properties.find((item) => item.id === cid);
                      if (!p)
                        return (
                          <div key={cid} className="text-neutral-300">
                            -
                          </div>
                        );
                      const valRate = Math.round(p.price / p.sizeSqFt);
                      return (
                        <div
                          key={cid}
                          className="text-neutral-850 font-mono font-medium"
                        >
                          ₹{valRate.toLocaleString("en-IN")} / sqft{" "}
                          {p.rentOrBuy === "Rent" ? "rent" : ""}
                        </div>
                      );
                    })}
                    {Array.from({ length: 3 - compareIds.length }).map(
                      (_, idx) => (
                        <div key={idx} className="text-neutral-300">
                          -
                        </div>
                      ),
                    )}
                  </div>

                  {/* 5. Facing Direction */}
                  <div className="grid grid-cols-4 items-center py-2.5 border-b border-neutral-100 text-sm gap-4">
                    <div className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Vastu / Facing
                    </div>
                    {compareIds.map((cid) => {
                      const p = properties.find((item) => item.id === cid);
                      if (!p)
                        return (
                          <div key={cid} className="text-neutral-300">
                            -
                          </div>
                        );
                      return (
                        <div
                          key={cid}
                          className="text-neutral-850 font-medium font-sans"
                        >
                          {p.facing} Facing
                        </div>
                      );
                    })}
                    {Array.from({ length: 3 - compareIds.length }).map(
                      (_, idx) => (
                        <div key={idx} className="text-neutral-300">
                          -
                        </div>
                      ),
                    )}
                  </div>

                  {/* 6. Locality Rating */}
                  <div className="grid grid-cols-4 items-center py-2.5 border-b border-neutral-100 text-sm gap-4">
                    <div className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Locality Infra
                    </div>
                    {compareIds.map((cid) => {
                      const p = properties.find((item) => item.id === cid);
                      if (!p)
                        return (
                          <div key={cid} className="text-neutral-300">
                            -
                          </div>
                        );
                      const rating = p.subLocality.includes("Jubilee")
                        ? "4.9/5 Elite"
                        : p.subLocality.includes("Financial")
                          ? "4.8/5 Tech Hub"
                          : "4.6/5 High Connect";
                      return (
                        <div
                          key={cid}
                          className="text-indigo-750 font-bold text-xs bg-indigo-50 px-2 py-1 rounded inline-block self-start font-mono"
                        >
                          {rating}
                        </div>
                      );
                    })}
                    {Array.from({ length: 3 - compareIds.length }).map(
                      (_, idx) => (
                        <div key={idx} className="text-neutral-300">
                          -
                        </div>
                      ),
                    )}
                  </div>

                  {/* 6b. Appreciation Dynamics Comparison Row */}
                  <div className="grid grid-cols-4 items-center py-2.5 border-b border-neutral-100 text-sm gap-4">
                    <div className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Appreciation YoY
                    </div>
                    {compareIds.map((cid) => {
                      const p = properties.find((item) => item.id === cid);
                      if (!p)
                        return (
                          <div key={cid} className="text-neutral-300">
                            -
                          </div>
                        );
                      const trend = getAppreciationTrend(p);
                      let tClass =
                        "text-emerald-700 bg-emerald-50 px-2" +
                        " " +
                        "py-1 rounded inline-flex items-center gap-1 font-mono font-bold text-[11px] self-start border border-emerald-150";
                      if (trend.trendStatus === "steady")
                        tClass =
                          "text-sky-700 bg-sky-50 px-2 py-1 rounded inline-flex items-center gap-1 font-mono font-bold text-[11px] self-start border border-sky-150";
                      else if (trend.trendStatus === "stagnant")
                        tClass =
                          "text-slate-650 bg-slate-50 px-2 py-1 rounded inline-flex items-center gap-1 font-mono font-bold text-[11px] self-start border border-slate-200";
                      return (
                        <div key={cid} className={tClass}>
                          {trend.trendStatus === "hyper" && (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                          {trend.trendStatus === "steady" && (
                            <TrendingUp className="w-3.5 h-3.5 text-sky-500" />
                          )}
                          {trend.trendStatus === "stagnant" && (
                            <Minus className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          +{trend.rateYoY}% YoY (
                          {trend.trendStatus === "hyper"
                            ? "Hyper"
                            : trend.trendStatus === "steady"
                              ? "Steady"
                              : "Mature"}
                          )
                        </div>
                      );
                    })}
                    {Array.from({ length: 3 - compareIds.length }).map(
                      (_, idx) => (
                        <div key={idx} className="text-neutral-300">
                          -
                        </div>
                      ),
                    )}
                  </div>

                  {/* 7. Key Amenities Comparison Checklist */}
                  <div className="grid grid-cols-4 items-start py-3.5 border-b border-neutral-100 text-sm gap-4">
                    <div className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Vouched Amenities
                    </div>
                    {compareIds.map((cid) => {
                      const p = properties.find((item) => item.id === cid);
                      if (!p)
                        return (
                          <div key={cid} className="text-neutral-300">
                            -
                          </div>
                        );
                      return (
                        <div key={cid} className="flex flex-wrap gap-1">
                          {p.amenities.map((amenity, amIdx) => (
                            <span
                              key={amIdx}
                              className="text-[10px] text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded font-sans"
                            >
                              • {amenity}
                            </span>
                          ))}
                        </div>
                      );
                    })}
                    {Array.from({ length: 3 - compareIds.length }).map(
                      (_, idx) => (
                        <div key={idx} className="text-neutral-300">
                          -
                        </div>
                      ),
                    )}
                  </div>

                  {/* 8. Action Connect */}
                  <div className="grid grid-cols-4 items-center py-4 gap-4">
                    <div></div>
                    {compareIds.map((cid) => {
                      const p = properties.find((item) => item.id === cid);
                      if (!p)
                        return (
                          <div key={cid} className="text-neutral-300">
                            -
                          </div>
                        );
                      return (
                        <div key={cid}>
                          <button
                            type="button"
                            onClick={() => {
                              setShowCompareModal(false);
                              onSelectProperty(p);
                            }}
                            className="w-full bg-emerald-600 text-white font-bold text-xs py-2 px-3 rounded-xl hover:bg-emerald-700 transition-colors uppercase cursor-pointer text-center"
                          >
                            Show Details &rarr;
                          </button>
                        </div>
                      );
                    })}
                    {Array.from({ length: 3 - compareIds.length }).map(
                      (_, idx) => (
                        <div key={idx} className="text-neutral-300">
                          -
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-between items-center text-[10px] text-neutral-400 font-mono">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-neutral-400" /> Estimates
                based on real West Hyderabad real estate registry benchmarks.
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

      {/* Toast Notice warning banner */}
      {compareWarning && (
        <div
          id="compare-warning-toast"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-amber-50 text-amber-905 border border-amber-200 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in"
        >
          <div className="bg-amber-100 text-amber-800 rounded-lg p-1.5 shrink-0">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-xs flex-1">
            <p className="font-bold text-amber-950">Comparison Limit Reached</p>
            <p className="text-neutral-500 mt-0.5">{compareWarning}</p>
          </div>
          <button
            type="button"
            onClick={() => setCompareWarning(null)}
            className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer text-xs font-mono font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Nearby Infrastructure Portal Overlay */}
      {selectedNearbyProperty && (
        <NearbyInfrastructureModal
          property={selectedNearbyProperty}
          isOpen={!!selectedNearbyProperty}
          onClose={() => setSelectedNearbyProperty(null)}
        />
      )}
    </div>
  );
};
