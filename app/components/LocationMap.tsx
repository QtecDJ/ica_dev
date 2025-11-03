"use client";

import { useState, useEffect } from "react";
import { IconMapPin, IconExternalLink, IconRoute, IconLoader } from "@tabler/icons-react";

interface LocationMapProps {
  address: string;
  className?: string;
}

export default function LocationMap({ address, className = "" }: LocationMapProps) {
  const [coordinates, setCoordinates] = useState<{lat: number; lng: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address && address.trim()) {
      geocodeAddress(address);
    }
  }, [address]);

  const geocodeAddress = async (location: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use Nominatim (OpenStreetMap) for free geocoding
      const encodedAddress = encodeURIComponent(location);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding fehlgeschlagen');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setCoordinates({ lat: parseFloat(lat), lng: parseFloat(lon) });
      } else {
        setError('Adresse nicht gefunden');
      }
    } catch (err) {
      setError('Fehler beim Laden der Karte');
      console.error('Geocoding error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openInOpenStreetMap = () => {
    if (coordinates) {
      const url = `https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lng}&zoom=16`;
      window.open(url, '_blank');
    } else {
      const encodedAddress = encodeURIComponent(address);
      const url = `https://www.openstreetmap.org/search?query=${encodedAddress}`;
      window.open(url, '_blank');
    }
  };

  const openDirections = () => {
    if (coordinates) {
      // Open routing service
      const url = `https://www.openstreetmap.org/directions?to=${coordinates.lat}%2C${coordinates.lng}`;
      window.open(url, '_blank');
    } else {
      // Fallback to Google Maps for directions (still works without API key)
      const encodedAddress = encodeURIComponent(address);
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
      window.open(url, '_blank');
    }
  };

  if (!address || !address.trim()) {
    return null;
  }

  const mapUrl = coordinates 
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng-0.01}%2C${coordinates.lat-0.01}%2C${coordinates.lng+0.01}%2C${coordinates.lat+0.01}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lng}`
    : null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header - Mobile optimized */}
      <div className="flex items-center gap-3 text-base font-semibold text-slate-800 dark:text-slate-200">
        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <IconMapPin className="w-5 h-5 text-red-600 dark:text-red-400" stroke={2} />
        </div>
        <span>Standort</span>
      </div>

      {/* Map Container - Modern Mobile First */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="h-56 sm:h-72 flex items-center justify-center bg-slate-50 dark:bg-slate-800">
            <div className="text-center space-y-3">
              <IconLoader className="w-8 h-8 mx-auto text-red-600 animate-spin" stroke={2} />
              <p className="text-sm text-slate-600 dark:text-slate-400">Karte wird geladen...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-56 sm:h-72 flex items-center justify-center bg-slate-50 dark:bg-slate-800">
            <div className="text-center space-y-3">
              <IconMapPin className="w-8 h-8 mx-auto text-slate-400 opacity-50" stroke={2} />
              <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
            </div>
          </div>
        ) : mapUrl ? (
          <iframe
            src={mapUrl}
            className="w-full h-56 sm:h-72 border-0"
            title={`Karte für ${address}`}
          />
        ) : (
          <div className="h-56 sm:h-72 flex items-center justify-center bg-slate-50 dark:bg-slate-800">
            <div className="text-center space-y-3">
              <IconMapPin className="w-8 h-8 mx-auto text-slate-400 opacity-50" stroke={2} />
              <p className="text-sm text-slate-500 dark:text-slate-400">Karte wird geladen...</p>
            </div>
          </div>
        )}
      </div>

      {/* Address and Action Buttons - Modern Mobile Design */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-start gap-3">
          <IconMapPin className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" stroke={2} />
          <p className="text-sm text-slate-700 dark:text-slate-300 break-words leading-relaxed">
            {address}
          </p>
        </div>
        
        {/* Action Buttons - Touch-optimized (44px height) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={openInOpenStreetMap}
            className="h-11 inline-flex items-center justify-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <IconExternalLink className="w-4 h-4" stroke={2} />
            <span>In Karte öffnen</span>
          </button>
          
          <button
            type="button"
            onClick={openDirections}
            className="h-11 inline-flex items-center justify-center gap-3 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
          >
            <IconRoute className="w-4 h-4" stroke={2} />
            <span>Route planen</span>
          </button>
        </div>
      </div>
    </div>
  );
}