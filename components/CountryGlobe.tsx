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
  count?: number; // Number to display on marker
  bags?: Array<{
    id: string;
    title: string;
    price: number;
    vendorName: string;
    vendorAddress: string;
  }>;
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
  const onLocationClickRef = useRef(onLocationClick);
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

    const currentZoom = mapRef.current.getZoom();
    const showDetailedCards = currentZoom > 12; // Show cards when zoomed in

    // Add new markers
    markers.forEach((markerData) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      
      if (showDetailedCards && markerData.bags && markerData.bags.length > 0) {
        // Show detailed card when zoomed in
        el.style.width = 'auto';
        el.style.height = 'auto';
        el.style.borderRadius = '0';
        el.style.backgroundColor = 'transparent';
        el.style.border = 'none';
        el.style.boxShadow = 'none';
        el.style.cursor = 'pointer';
        
        const card = document.createElement('div');
        card.style.cssText = `
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          min-width: 150px;
          max-width: 200px;
        `;
        
        const iconDiv = document.createElement('div');
        iconDiv.style.cssText = `
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          flex-shrink: 0;
          font-size: 14px;
        `;
        iconDiv.innerHTML = '🛍️';
        
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = `
          flex: 1;
          min-width: 0;
        `;
        
        const addressP = document.createElement('p');
        addressP.style.cssText = `
          font-size: 10px;
          color: #64748b;
          margin: 0 0 2px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        `;
        addressP.textContent = markerData.bags[0].vendorAddress;
        
        const titleP = document.createElement('p');
        titleP.style.cssText = `
          font-size: 12px;
          font-weight: 600;
          color: #065f46;
          margin: 0 0 2px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        `;
        titleP.textContent = markerData.bags[0].title;
        
        const priceP = document.createElement('p');
        priceP.style.cssText = `
          font-size: 10px;
          color: #475569;
          font-weight: 600;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        `;
        priceP.textContent = `$${markerData.bags[0].price.toFixed(2)} · ${markerData.bags[0].vendorName}`;
        
        contentDiv.appendChild(addressP);
        contentDiv.appendChild(titleP);
        contentDiv.appendChild(priceP);
        card.appendChild(iconDiv);
        card.appendChild(contentDiv);
        el.appendChild(card);
      } else {
        // Show green numbered dot when zoomed out
        el.style.width = '48px';
        el.style.height = '48px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#10b981'; // Green color
        el.style.border = '4px solid white';
        el.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
        el.style.cursor = 'pointer';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontWeight = 'bold';
        el.style.fontSize = '16px';
        el.style.color = 'white';
        el.textContent = markerData.count?.toString() || '1';
        el.title = markerData.title || '';
      }

      // Add click handler to marker
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!mapRef.current) return;
        
        const currentZoom = mapRef.current.getZoom();
        const isShowingCard = showDetailedCards && markerData.bags && markerData.bags.length > 0;
        
        if (isShowingCard) {
          // Already showing card - navigate to bag details
          if (markerData.bags && markerData.bags.length > 0) {
            window.location.href = `#/consumer/bags/${markerData.bags[0].id}`;
          }
        } else {
          // Showing numbered dot - zoom in to this location
          mapRef.current.easeTo({
            center: [markerData.lng, markerData.lat],
            zoom: Math.min(14, currentZoom + 2), // Zoom in by 2 levels, max zoom 14
            duration: 1000, // Smooth animation
          });
        }
      });

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

    // Click handler - zoom in when clicking on map
    map.on('click', async (e) => {
      // Don't zoom if clicking on a marker (markers handle their own clicks)
      const target = e.originalEvent?.target as HTMLElement;
      if (target && (target.closest('.custom-marker') || target.closest('.mapboxgl-popup'))) {
        return;
      }
      
      // Prevent default mapbox double-click zoom behavior
      e.preventDefault();
      
      handleUserInteraction();
      const currentZoom = map.getZoom();
      const { lng, lat } = e.lngLat;
      
      // Zoom in to clicked location
      map.easeTo({
        center: [lng, lat],
        zoom: Math.min(14, currentZoom + 2), // Zoom in by 2 levels, max zoom 14
        duration: 1000,
      });
      
      // Call location click handler if provided (but don't let it interfere with zoom)
      if (onLocationClickRef.current) {
        try {
          const name = await reverseGeocode(lng, lat);
          onLocationClickRef.current({ name, lat, lng });
        } catch (err) {
          console.error('Reverse geocoding error:', err);
        }
      }
    });

    // User interaction handlers
    map.on('dragstart', handleUserInteraction);
    map.on('zoomstart', handleUserInteraction);
    map.on('rotatestart', handleUserInteraction);
    map.on('pitchstart', handleUserInteraction);

    map.on('dragend', handleUserInteraction);
    map.on('zoomend', () => {
      handleUserInteraction();
      // Update markers when zoom changes to show/hide cards
      updateMarkers();
    });
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
  }, [countryCenter, countryZoom, theme, maxBounds, reverseGeocode, handleUserInteraction, startAutoRotation, stopAutoRotation, updateMarkers]);

  // Update the ref when onLocationClick changes (without re-initializing the map)
  useEffect(() => {
    onLocationClickRef.current = onLocationClick;
  }, [onLocationClick]);

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

