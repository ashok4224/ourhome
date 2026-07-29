import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  MapPin,
  GraduationCap,
  Heart,
  Train,
  Star,
  Compass,
  Map as MapIcon,
  Navigation,
  Clock,
  Info,
  CheckCircle,
  Eye,
  ArrowRight,
} from "lucide-react";
import { Property } from "../types";
import { getNearbyHubsForLocation, NearbyHub } from "../data/nearbyData";

interface NearbyInfrastructureModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export const NearbyInfrastructureModal: React.FC<
  NearbyInfrastructureModalProps
> = ({ property, isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "school" | "hospital" | "transit"
  >("all");
  const [hoveredHubId, setHoveredHubId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"map" | "list">("map"); // mobile optimization tab switcher
  const [showRadiusRing, setShowRadiusRing] = useState<boolean>(true);

  if (!isOpen) return null;

  const sublocalityKey = property.subLocality || "Gachibowli";
  const hubs = getNearbyHubsForLocation(property.location, sublocalityKey);

  // Filter hubs based on interactive toggle
  const filteredHubs = hubs.filter((hub) =>
    selectedCategory === "all" ? true : hub.type === selectedCategory,
  );

  const getCategoryColor = (type: "school" | "hospital" | "transit") => {
    switch (type) {
      case "school":
        return "emerald";
      case "hospital":
        return "rose";
      case "transit":
        return "sky";
    }
  };

  const getCategoryIcon = (
    type: "school" | "hospital" | "transit",
    className = "w-4 h-4",
  ) => {
    switch (type) {
      case "school":
        return <GraduationCap className={className} />;
      case "hospital":
        return <Heart className={className} />;
      case "transit":
        return <Train className={className} />;
    }
  };

  const activeHoveredHub = hubs.find((h) => h.id === hoveredHubId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
        {/* Semi-transparent Backdrop with Blur */}
        <motion.div
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        />

        {/* Modal Main Body */}
        <motion.div
          id="nearby-infra-modal-container"
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] md:h-[680px] border border-emerald-100/50"
        >
          {/* Header Bar */}
          <div className="p-5 border-b border-slate-100 bg-linear-to-r from-emerald-50/50 via-white to-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center shadow-xs">
                <Compass className="w-5.5 h-5.5 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-sm">
                    Interactive Locality Atlas
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    RERA Registered Node
                  </span>
                </div>
                <h2 className="font-display font-black text-lg md:text-xl text-slate-900 tracking-tight leading-none mt-1">
                  Nearby Hubs: {property.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 leading-none">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />{" "}
                  {property.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {/* Tab selector on small devices */}
              <div className="flex md:hidden bg-slate-100 p-1 rounded-xl text-xs font-bold mr-2">
                <button
                  onClick={() => setActiveTab("map")}
                  className={`px-3 py-1 rounded-lg ${activeTab === "map" ? "bg-white text-slate-950 shadow-xs" : "text-slate-500"}`}
                >
                  Map View
                </button>
                <button
                  onClick={() => setActiveTab("list")}
                  className={`px-3 py-1 rounded-lg ${activeTab === "list" ? "bg-white text-slate-950 shadow-xs" : "text-slate-500"}`}
                >
                  List ({filteredHubs.length})
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-905 rounded-xl cursor-pointer transition-all duration-300"
                title="Close Portal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interactive Layout Panel Grid */}
          <div className="flex-1 min-h-0 flex flex-col md:flex-row relative">
            {/* Sidebar View (Landmark lists) */}
            <div
              className={`w-full md:w-[360px] border-r border-slate-100 flex flex-col bg-slate-50/30 overflow-hidden ${activeTab === "list" ? "flex" : "hidden md:flex"}`}
            >
              {/* Category Segmented Controllers */}
              <div className="p-4 border-b border-slate-100 bg-white/70 space-y-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                  Category Filters
                </span>
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl text-[10.5px] font-mono font-bold text-slate-600">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`py-1.5 text-center rounded-lg transition-all cursor-pointer ${selectedCategory === "all" ? "bg-white text-emerald-800 shadow-xs" : "hover:text-slate-900"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedCategory("school")}
                    className={`py-1.5 text-center rounded-lg transition-all cursor-pointer flex items-center justify-center gap-0.5 ${selectedCategory === "school" ? "bg-emerald-600 text-white shadow-xs" : "hover:text-slate-900"}`}
                  >
                    Edu
                  </button>
                  <button
                    onClick={() => setSelectedCategory("hospital")}
                    className={`py-1.5 text-center rounded-lg transition-all cursor-pointer flex items-center justify-center gap-0.5 ${selectedCategory === "hospital" ? "bg-rose-600 text-white shadow-xs" : "hover:text-slate-900"}`}
                  >
                    Med
                  </button>
                  <button
                    onClick={() => setSelectedCategory("transit")}
                    className={`py-1.5 text-center rounded-lg transition-all cursor-pointer flex items-center justify-center gap-0.5 ${selectedCategory === "transit" ? "bg-sky-600 text-white shadow-xs" : "hover:text-slate-900"}`}
                  >
                    Transit
                  </button>
                </div>

                {/* 5km Proximity Ring Toggle */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                    5km Radius Overlay
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="toggle-5km-radius-checkbox"
                      checked={showRadiusRing}
                      onChange={(e) => setShowRadiusRing(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              {/* Landmark Scroll view */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-full">
                {filteredHubs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 px-4">
                    <Info className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-600" />
                    <p className="text-xs font-mono">
                      No nodes matching this category filtered nearby.
                    </p>
                  </div>
                ) : (
                  filteredHubs.map((hub) => {
                    const cColor = getCategoryColor(hub.type);
                    const isHovered = hoveredHubId === hub.id;
                    return (
                      <div
                        key={hub.id}
                        onMouseEnter={() => setHoveredHubId(hub.id)}
                        onMouseLeave={() => setHoveredHubId(null)}
                        className={`p-3 bg-white hover:bg-slate-50 rounded-2xl border transition-all duration-200 cursor-pointer text-xs relative ${
                          isHovered
                            ? "border-emerald-500 shadow-sm ring-1 ring-emerald-400/20 translate-x-1"
                            : "border-slate-150 shadow-3xs"
                        }`}
                      >
                        {/* Rating Badge */}
                        <div className="absolute top-3 right-3 flex items-center gap-0.5 font-mono text-[9.5px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {hub.rating}
                        </div>

                        <div className="flex gap-2.5 items-start">
                          {/* Category Type Visual Circle Indicator */}
                          <div
                            className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                              hub.type === "school"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : hub.type === "hospital"
                                  ? "bg-rose-50 text-rose-600 border border-rose-105"
                                  : "bg-sky-50 text-sky-600 border border-sky-100"
                            }`}
                          >
                            {getCategoryIcon(hub.type)}
                          </div>

                          <div className="space-y-1 pr-12">
                            <p className="font-display font-bold text-slate-800 leading-tight">
                              {hub.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] text-slate-500">
                              <span className="font-bold text-slate-900">
                                {hub.distance}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3" /> {hub.time}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-normal italic line-clamp-2">
                              {hub.details}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Local index safety check summary */}
              <div className="p-3.5 bg-slate-100 border-t border-slate-200/50 text-[10px] font-mono text-slate-500 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Locality infrastructure verified under TS-RERA audit
                  standards.
                </span>
              </div>
            </div>

            {/* Simulated Vector Map Panel (Map view) */}
            <div
              className={`flex-1 relative bg-slate-50 flex flex-col justify-between overflow-hidden ${activeTab === "map" ? "flex" : "hidden md:flex"}`}
            >
              {/* Map Canvas Background Container */}
              <div className="absolute inset-0 select-none z-0">
                {/* SVG styled road network, park grid and canal mock landscape */}
                <svg
                  className="w-full h-full opacity-65"
                  viewBox="0 0 500 400"
                  preserveAspectRatio="none"
                >
                  {/* Water bodies */}
                  <path
                    d="M 0,20 Q 150,110 320,60 T 500,80 L 500,0 L 0,0 Z"
                    fill="#e0f2fe"
                    opacity="0.6"
                  />

                  {/* Parks / Forest Zones */}
                  <rect
                    x="20"
                    y="120"
                    width="80"
                    height="90"
                    rx="12"
                    fill="#ecfdf5"
                    opacity="0.7"
                  />
                  <rect
                    x="380"
                    y="270"
                    width="100"
                    height="80"
                    rx="16"
                    fill="#ecfdf5"
                    opacity="0.7"
                  />
                  <ellipse
                    cx="440"
                    cy="80"
                    rx="40"
                    ry="25"
                    fill="#ecfdf5"
                    opacity="0.5"
                  />

                  {/* Grid Lines (Coordinates reference) */}
                  <line
                    x1="50"
                    y1="0"
                    x2="50"
                    y2="400"
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <line
                    x1="150"
                    y1="0"
                    x2="150"
                    y2="400"
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <line
                    x1="250"
                    y1="0"
                    x2="250"
                    y2="400"
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <line
                    x1="350"
                    y1="0"
                    x2="350"
                    y2="400"
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <line
                    x1="450"
                    y1="0"
                    x2="450"
                    y2="400"
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />

                  <line
                    x1="0"
                    y1="80"
                    x2="500"
                    y2="80"
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="180"
                    x2="500"
                    y2="180"
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="280"
                    x2="500"
                    y2="280"
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />

                  {/* Major Highway structures (Outer Ring Road, Expressways) */}
                  <path
                    d="M 0,350 C 150,340 280,380 500,320"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0,350 C 150,340 280,380 500,320"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />

                  {/* High Tech Street Grid Layout lines */}
                  <line
                    x1="120"
                    y1="0"
                    x2="160"
                    y2="400"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                  />
                  <line
                    x1="280"
                    y1="0"
                    x2="220"
                    y2="400"
                    stroke="#e2e8f0"
                    strokeWidth="3.5"
                  />

                  <line
                    x1="0"
                    y1="220"
                    x2="500"
                    y2="240"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                  />
                  <line
                    x1="0"
                    y1="140"
                    x2="500"
                    y2="110"
                    stroke="#e2e8f0"
                    strokeWidth="3.5"
                  />

                  <path
                    d="M 120,50 Q 250,200 380,350"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="4"
                  />
                  <path
                    d="M 50,220 Q 250,200 450,220"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="6"
                  />
                </svg>
              </div>

              {/* Compass navigation decal indicator */}
              <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-md border border-slate-200/80 px-3 py-1.5 rounded-2xl text-[9px] text-slate-500 font-mono shadow-xs select-none pointer-events-none flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>North Alignment • Scale 1:4500</span>
              </div>

              {/* Center Anchor representation for the Current Property */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 select-none z-20 pointer-events-none"
                style={{ left: "50%", top: "50%" }}
              >
                {/* Concentric live-pulsating rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/15 animate-pulse border border-emerald-500/20"></div>
                  <div className="w-12 h-12 rounded-full absolute bg-emerald-500/20 animate-ping opacity-60"></div>
                </div>

                <div className="relative w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                </div>

                {/* Tooltip bubble showing the Property Anchor */}
                <div className="absolute top-9 left-1/2 transform -translate-x-1/2 bg-slate-950 text-white px-2.5 py-1 rounded-md text-[9.5px] font-display font-medium shadow-md whitespace-nowrap min-w-max border border-slate-800">
                  📍 {property.title} (Center)
                </div>
              </div>

              {/* Visual 5km Proximity Radius Circle overlay around selected property */}
              {showRadiusRing && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-emerald-500/25 bg-emerald-500/3 flex items-center justify-center pointer-events-none select-none z-10 animate-pulse-slow"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: "310px",
                    height: "310px",
                  }}
                >
                  <div className="absolute -top-3.5 bg-emerald-600 border border-emerald-400/30 text-white text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider whitespace-nowrap">
                    🌐 5km Proximity Radius Bound
                  </div>
                </div>
              )}

              {/* Plotting Hub Landmark Pins Dynamically */}
              {filteredHubs.map((hub) => {
                const isHovered = hoveredHubId === hub.id;
                const cColor = getCategoryColor(hub.type);

                // Color mapping variables based on category
                let pinColors = {
                  bg: "bg-emerald-600",
                  accent: "bg-emerald-50 text-emerald-600 border-emerald-250",
                  hover: "shadow-emerald-600/30 ring-emerald-500/25",
                };
                if (hub.type === "hospital") {
                  pinColors = {
                    bg: "bg-rose-600",
                    accent: "bg-rose-50 text-rose-600 border-rose-200",
                    hover: "shadow-rose-600/30 ring-rose-500/25",
                  };
                } else if (hub.type === "transit") {
                  pinColors = {
                    bg: "bg-sky-600",
                    accent: "bg-sky-50 text-sky-600 border-sky-200",
                    hover: "shadow-sky-600/30 ring-sky-500/25",
                  };
                }

                return (
                  <div
                    key={hub.id}
                    className="absolute z-20"
                    style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
                    onMouseEnter={() => setHoveredHubId(hub.id)}
                    onMouseLeave={() => setHoveredHubId(null)}
                  >
                    {/* Visual Line of connection ray to Property Center */}
                    {isHovered && (
                      <svg
                        className="absolute overflow-visible pointer-events-none z-10"
                        style={{ left: 0, top: 0 }}
                      >
                        <line
                          x1={0}
                          y1={0}
                          x2={`${50 - hub.x}vw`} // relative offset to screen center (rough vector approximation but SVG provides solid indicator)
                          y2={`${50 - hub.y}vh`}
                          stroke="#10b981"
                          strokeWidth="1.5"
                          strokeDasharray="4 2"
                          opacity="0"
                        />
                      </svg>
                    )}

                    <button
                      type="button"
                      className={`relative transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                        isHovered
                          ? `${pinColors.bg} text-white scale-120 ring-4 ${pinColors.hover} z-25`
                          : `${pinColors.accent} border border-slate-200 hover:scale-110`
                      }`}
                    >
                      {getCategoryIcon(hub.type, "w-4 h-4")}
                    </button>

                    {/* Miniature floating tooltip layout on marker pin */}
                    <div
                      className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 mb-1.5 transition-all duration-200 z-30 ${
                        isHovered
                          ? "visible opacity-100"
                          : "invisible opacity-0"
                      }`}
                    >
                      <div className="bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl shadow-xl w-48 text-left space-y-1">
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400 font-mono">
                            {hub.type}
                          </span>
                          <span className="text-[10px] font-bold text-amber-400 font-mono flex items-center gap-0.5">
                            ★ {hub.rating}
                          </span>
                        </div>
                        <p className="text-[10.5px] font-bold font-display leading-tight line-clamp-2">
                          {hub.name}
                        </p>
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-350 pt-1 border-t border-slate-800/80">
                          <span className="font-bold text-emerald-400">
                            {hub.distance}
                          </span>
                          <span className="flex items-center gap-0.5 text-slate-400">
                            <Clock className="w-2.5 h-2.5" />{" "}
                            {hub.time.split(" ")[0]}m
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Lower HUD detailing the currently highlighted/hovered landmark */}
              <div className="p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 z-10 select-text flex items-center justify-between gap-4">
                {activeHoveredHub ? (
                  <div className="flex items-center gap-3 animate-fade-in w-full">
                    {/* Category icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        activeHoveredHub.type === "school"
                          ? "bg-emerald-50 text-emerald-650"
                          : activeHoveredHub.type === "hospital"
                            ? "bg-rose-50 text-rose-650"
                            : "bg-sky-50 text-sky-655"
                      }`}
                    >
                      {getCategoryIcon(activeHoveredHub.type, "w-5 h-5")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2">
                        <p className="font-display font-bold text-slate-900 text-xs truncate">
                          {activeHoveredHub.name}
                        </p>
                        <span className="text-[10px] uppercase font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded shrink-0">
                          {activeHoveredHub.distance}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 leading-normal line-clamp-1 mt-0.5">
                        {activeHoveredHub.details}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9.5px] text-slate-400 font-mono block">
                        COMMUTE TIME
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-800">
                        {activeHoveredHub.time}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 font-mono text-xs py-1">
                    <Info className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>
                      Hover over any pin indicator to measure real commute
                      vectors.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
