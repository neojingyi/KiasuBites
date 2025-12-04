import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
// CSS is imported in index.tsx

export interface LocationData {
  name: string;
  lat: number;
  lng: number;
}

export interface MarkerData {
  id: string;
  lng: number;
  lat: number;
  title?: string;
  color?: string;
}

interface CountryGlobeProps {
  countryCenter: [number, number]; // [lng, lat]
  countryZoom: number;
  onLocationClick?: (location: LocationData) => void;
  theme?: string;
  maxBounds?: [[number, number], [number, number]];
  markers?: MarkerData[];
  className?: string;
}

export const CountryGlobe: React.FC<CountryGlobeProps> = ({
  countryCenter,
  countryZoom,
  onLocationClick,
  theme = 'satellite-streets-v12',
  maxBounds,
  markers = [],
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const rotationIntervalRef = useRef<number | null>(null);
  const idleTimeoutRef = useRef<number | null>(null);
  const isUserInteractingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reverse geocoding function
  const reverseGeocode = useCallback(async (lng: number, lat: number): Promise<string> => {
    const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!mapboxToken) {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=place,locality,district,neighborhood&access_token=${mapboxToken}`
      );
      const data = await response.json();
      return data.features[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (err) {
      console.error('Geocoding error:', err);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }, []);

  // Auto-rotation logic
  const startAutoRotation = useCallback(() => {
    if (!mapRef.current || isUserInteractingRef.current) return;

    const map = mapRef.current;
    const currentBearing = map.getBearing();
    
    rotationIntervalRef.current = window.setInterval(() => {
      if (!mapRef.current || isUserInteractingRef.current) {
        if (rotationIntervalRef.current) {
          clearInterval(rotationIntervalRef.current);
          rotationIntervalRef.current = null;
        }
        return;
      }

      // Only rotate if zoomed out enough (zoom > 3)
      if (map.getZoom() > 3) {
        map.easeTo({
          bearing: currentBearing + 0.5,
          duration: 0,
        });
      }
    }, 16); // ~60fps
  }, []);

  const stopAutoRotation = useCallback(() => {
    if (rotationIntervalRef.current) {
      clearInterval(rotationIntervalRef.current);
      rotationIntervalRef.current = null;
    }
  }, []);

  const handleUserInteraction = useCallback(() => {
    isUserInteractingRef.current = true;
    stopAutoRotation();

    // Clear existing timeout
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }

    // Resume rotation after 3 seconds of inactivity
    idleTimeoutRef.current = window.setTimeout(() => {
      isUserInteractingRef.current = false;
      startAutoRotation();
    }, 3000);
  }, [startAutoRotation, stopAutoRotation]);

  // Add markers to map
  const updateMarkers = useCallback(() => {
    if (!mapRef.current) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = markerData.color || '#dc2626';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      el.title = markerData.title || '';

      const marker = new mapboxgl.Marker(el)
        .setLngLat([markerData.lng, markerData.lat])
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [markers]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!mapboxToken) {
      setError('Mapbox access token not found. Please set VITE_MAPBOX_ACCESS_TOKEN in your environment variables.');
      setIsLoading(false);
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: `mapbox://styles/mapbox/${theme}`,
      center: countryCenter,
      zoom: countryZoom,
      projection: 'globe' as any,
      ...(maxBounds && { maxBounds }),
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      logoPosition: 'bottom-right',
    });

    mapRef.current = map;

    map.on('load', () => {
      try {
        // Add atmospheric fog effect
        map.setFog({});
        setIsLoading(false);
        setError(null);

        // Start auto-rotation
        startAutoRotation();

        // Add markers
        updateMarkers();
      } catch (err) {
        console.error('Error initializing map features:', err);
        setIsLoading(false);
        setError('Error initializing map features');
      }
    });

    // Click handler
    if (onLocationClick) {
      map.on('click', async (e) => {
        handleUserInteraction();
        const { lng, lat } = e.lngLat;
        const name = await reverseGeocode(lng, lat);
        onLocationClick({ name, lat, lng });
      });
    }

    // User interaction handlers
    map.on('dragstart', handleUserInteraction);
    map.on('zoomstart', handleUserInteraction);
    map.on('rotatestart', handleUserInteraction);
    map.on('pitchstart', handleUserInteraction);

    map.on('dragend', handleUserInteraction);
    map.on('zoomend', handleUserInteraction);
    map.on('rotateend', handleUserInteraction);
    map.on('pitchend', handleUserInteraction);

    // Error handling
    map.on('error', (e) => {
      if (e.error?.message && !e.error.message.includes('AbortError')) {
        console.error('Mapbox error:', e.error);
        setError('Failed to load map. Please check your Mapbox token.');
      }
    });

    return () => {
      stopAutoRotation();
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [countryCenter, countryZoom, theme, maxBounds, onLocationClick, reverseGeocode, handleUserInteraction, startAutoRotation, stopAutoRotation]);

  // Update markers when they change
  useEffect(() => {
    if (mapRef.current && !isLoading && mapRef.current.loaded()) {
      updateMarkers();
    }
  }, [markers, isLoading]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 border-2 border-red-200 rounded-lg z-10">
          <div className="text-center p-4">
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-sm text-red-500 mt-2">
              Get your free token at{' '}
              <a href="https://account.mapbox.com" target="_blank" rel="noopener noreferrer" className="underline">
                mapbox.com
              </a>
            </p>
          </div>
        </div>
      )}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#fefbf1] z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading globe...</p>
          </div>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
    </div>
  );
};

