"use client";

import { useState, useEffect } from "react";
import { MapPin, ExternalLink, Navigation } from "lucide-react";

interface LocationMapProps {
  address: string;
  className?: string;
}

export default function LocationMap({ address, className = "" }: LocationMapProps) {
  const [mapUrl, setMapUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (address && address.trim()) {
      generateMapUrl(address);
    }
  }, [address]);

  const generateMapUrl = (location: string) => {
    setIsLoading(true);
    
    // Encode address for URL
    const encodedAddress = encodeURIComponent(location);
    
    // Generate Google Maps embed URL
    const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodedAddress}&zoom=15`;
    
    setMapUrl(embedUrl);
    setIsLoading(false);
  };

  const openInGoogleMaps = () => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(url, '_blank');
  };

  const openDirections = () => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(url, '_blank');
  };

  if (!address || !address.trim()) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
        <MapPin className="w-4 h-4" />
        <span>Standort</span>
      </div>

      {/* Map Container - Mobile First */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="h-48 sm:h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : mapUrl ? (
          <iframe
            src={mapUrl}
            className="w-full h-48 sm:h-64 border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Karte für ${address}`}
          />
        ) : (
          <div className="h-48 sm:h-64 flex items-center justify-center text-slate-500 dark:text-slate-400">
            <div className="text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Karte wird geladen...</p>
            </div>
          </div>
        )}
      </div>

      {/* Address and Action Buttons - Mobile Optimized */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 break-words">
          {address}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={openInGoogleMaps}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>In Google Maps öffnen</span>
          </button>
          
          <button
            type="button"
            onClick={openDirections}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <Navigation className="w-4 h-4" />
            <span>Route planen</span>
          </button>
        </div>
      </div>
    </div>
  );
}