// src/components/InteractiveMap.tsx
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Property } from "../types";

// Fix default icon issue in Leaflet with Webpack/Vite
// Configure default Leaflet icons for Vite (static imports)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface InteractiveMapProps {
  properties: Property[];
  radiusKm: number;
  center: [number, number];
  onRadiusChange: (km: number) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  properties,
  radiusKm,
  center,
  onRadiusChange,
}) => {
  const [filtered, setFiltered] = useState<Property[]>(properties);

  useEffect(() => {
    const filteredProps = properties.filter((p) => {
      const distance = Math.sqrt(
        Math.pow(p.latitude - center[0], 2) + Math.pow(p.longitude - center[1], 2)
      );
      // Rough conversion: 0.009 degrees ≈ 1 km (approx for latitude)
      return distance <= radiusKm * 0.009;
    });
    setFiltered(filteredProps);
  }, [properties, radiusKm, center]);

  return (
    <div className="relative w-full h-[500px]">
      {/* Guard against Leaflet runtime errors */}
      {(() => {
        try {
          return (
            <MapContainer center={center} zoom={13} className="h-full w-full rounded-xl shadow-lg">
              <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filtered.map((p) => (
                <Marker key={p.id} position={[p.latitude, p.longitude]}>
                  <Popup>
                    <strong>{p.title}</strong>
                    <br />{p.location}
                    <br />{p.price.toLocaleString()} ₹
                  </Popup>
                </Marker>
              ))}
              <Circle center={center} radius={radiusKm * 1000} pathOptions={{ color: "#10b981", fillOpacity: 0.1 }} />
            </MapContainer>
          );
        } catch (e) {
          console.error('Leaflet map failed to render:', e);
          return <div className="p-4 text-sm text-red-600">Map unavailable.</div>;
        }
      })()}
      <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-md p-2 rounded-md shadow">
        <label className="text-sm font-medium mr-2">Radius (km):</label>
        <input
          type="range"
          min={1}
          max={20}
          value={radiusKm}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          className="w-32"
        />
        <span className="ml-2 text-sm">{radiusKm} km</span>
      </div>
    </div>
  );
};
