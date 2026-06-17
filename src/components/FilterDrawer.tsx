// src/components/FilterDrawer.tsx
import React, { useState, useEffect } from "react";
// Removed MUI Slider import; using native inputs
import { applyFilters, FilterOptions } from "../utils/filter";
import { Property } from "../types";

interface FilterDrawerProps {
  properties: Property[];
  onFilterChange: (filtered: Property[]) => void;
  onClose: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({ properties, onFilterChange, onClose }) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000]);
  const [bedrooms, setBedrooms] = useState<number | undefined>(undefined);
  const [furnishing, setFurnishing] = useState<string | undefined>(undefined);
  const [possessionStatus, setPossessionStatus] = useState<string | undefined>(undefined);
  const [facing, setFacing] = useState<string | undefined>(undefined);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Apply filters whenever any option changes
  useEffect(() => {
    const opts: FilterOptions = {
      priceRange,
      bedrooms,
      furnishing: furnishing as any,
      possessionStatus: possessionStatus as any,
      facing,
      verifiedOnly,
    };
    const filtered = applyFilters(properties, opts);
    onFilterChange(filtered);
  }, [priceRange, bedrooms, furnishing, possessionStatus, facing, verifiedOnly, properties]);

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const value = Number(event.target.value);
      setPriceRange((prev) => index === 0 ? [value, prev[1]] : [prev[0], value]);
    };

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end bg-black/30 backdrop-blur-sm">
      <div className="w-80 h-full bg-white dark:bg-gray-800 shadow-lg p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Filters</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            ✕
          </button>
        </div>
        {/* Price Range Inputs */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Price Range (₹)</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min={0}
              max={100000000}
              step={500000}
              value={priceRange[0]}
              onChange={(e) => handlePriceChange(e as any, 0)}
              className="w-1/2"
            />
            <input
              type="range"
              min={0}
              max={100000000}
              step={500000}
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(e as any, 1)}
              className="w-1/2"
            />
            <div className="text-sm mt-1">{priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()}</div>
          </div>
        </div>
        {/* Bedrooms */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Bedrooms</label>
          <select
            value={bedrooms ?? ""}
            onChange={(e) => setBedrooms(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full p-2 border rounded"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}> {n} BHK </option>
            ))}
          </select>
        </div>
        {/* Furnishing */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Furnishing</label>
          <select
            value={furnishing ?? ""}
            onChange={(e) => setFurnishing(e.target.value || undefined)}
            className="w-full p-2 border rounded"
          >
            <option value="">Any</option>
            <option value="Unfurnished">Unfurnished</option>
            <option value="Semi-Furnished">Semi‑Furnished</option>
            <option value="Fully-Furnished">Fully‑Furnished</option>
          </select>
        </div>
        {/* Possession Status */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Possession</label>
          <select
            value={possessionStatus ?? ""}
            onChange={(e) => setPossessionStatus(e.target.value || undefined)}
            className="w-full p-2 border rounded"
          >
            <option value="">Any</option>
            <option value="Ready to Move">Ready to Move</option>
            <option value="Under Construction">Under Construction</option>
          </select>
        </div>
        {/* Facing */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Facing</label>
          <input
            type="text"
            placeholder="e.g., East"
            value={facing ?? ""}
            onChange={(e) => setFacing(e.target.value || undefined)}
            className="w-full p-2 border rounded"
          />
        </div>
        {/* Verified Only */}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="verifiedOnly"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="verifiedOnly" className="text-sm">Show only RERA‑verified</label>
        </div>
      </div>
    </div>
  );
};
