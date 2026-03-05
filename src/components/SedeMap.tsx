'use client';

import { useEffect, useRef, useState } from 'react';

interface SedeLocation {
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  reviewCount: number;
  status: string;
  mapsUri: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
    initSedeMap: () => void;
  }
}

export default function SedeMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [locations, setLocations] = useState<SedeLocation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch locations from API route
  useEffect(() => {
    fetch('/api/sede-locations')
      .then((r) => r.json())
      .then((data) => {
        setLocations(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load locations');
        setLoading(false);
      });
  }, []);

  // Load Google Maps JS API and render map once locations are ready
  useEffect(() => {
    if (loading || error || locations.length === 0) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    const initMap = () => {
      if (!mapRef.current || !window.google) return;

      const validLocations = locations.filter((l) => l.lat !== null && l.lng !== null);
      if (validLocations.length === 0) return;

      // Center on average lat/lng
      const avgLat = validLocations.reduce((s, l) => s + l.lat!, 0) / validLocations.length;
      const avgLng = validLocations.reduce((s, l) => s + l.lng!, 0) / validLocations.length;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: avgLat, lng: avgLng },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        ],
      });

      const infoWindow = new window.google.maps.InfoWindow();

      validLocations.forEach((loc) => {
        const marker = new window.google.maps.Marker({
          position: { lat: loc.lat!, lng: loc.lng! },
          map,
          title: loc.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: '#6366f1',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        marker.addListener('click', () => {
          infoWindow.setContent(`
            <div style="font-family:sans-serif;max-width:220px;padding:4px 2px">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px">${loc.name}</div>
              <div style="font-size:12px;color:#555;margin-bottom:6px">${loc.address}</div>
              ${loc.rating ? `<div style="font-size:12px;margin-bottom:6px">⭐ ${loc.rating} <span style="color:#888">(${loc.reviewCount} reviews)</span></div>` : ''}
              <a href="${loc.mapsUri}" target="_blank" rel="noopener" style="font-size:12px;color:#6366f1;text-decoration:none">Open in Google Maps →</a>
            </div>
          `);
          infoWindow.open(map, marker);
        });
      });
    };

    if (window.google) {
      initMap();
    } else {
      window.initSedeMap = initMap;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initSedeMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [loading, error, locations]);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Sede Café Locations</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {loading ? 'Loading…' : error ? error : `${locations.length} locations in Mexico City`}
          </p>
        </div>
        {!loading && !error && (
          <span className="text-xs text-muted-foreground">Click a pin for details</span>
        )}
      </div>
      <div ref={mapRef} className="w-full" style={{ height: 480 }}>
        {(loading || error) && (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            {loading ? 'Loading map…' : error}
          </div>
        )}
      </div>
    </div>
  );
}
