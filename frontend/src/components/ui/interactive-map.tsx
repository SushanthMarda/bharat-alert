import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPoint {
  id: string;
  childName?: string;
  age?: number;
  lastSeenLocation?: string;
  location?: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  type?: 'sighting';
  reportId?: string;
  createdAt: string;
}

interface InteractiveMapProps {
  points?: MapPoint[];
  center?: [number, number];
  zoom?: number;
  onPointClick?: (point: MapPoint) => void;
  selectable?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
  className?: string;
}

export function InteractiveMap({
  points = [],
  center = [20.5937, 78.9629], // Center of India
  zoom = 5,
  onPointClick,
  selectable = false,
  onLocationSelect,
  selectedLocation,
  className = '',
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const selectedMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    // Handle click for location selection
    if (selectable && onLocationSelect) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when points change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    points.forEach(point => {
      if (!point.latitude || !point.longitude) return;

      const isSighting = point.type === 'sighting';

      // Create custom icon
      const iconHtml = isSighting
        ? '<div class="marker-sighting"></div>'
        : '<div class="marker-alert"></div>';

      const icon = L.divIcon({
        html: iconHtml,
        className: 'custom-marker-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([point.latitude, point.longitude], { icon })
        .addTo(mapInstanceRef.current!);

      // Create popup content
      const popupContent = isSighting
        ? `<div class="p-2">
            <p class="font-semibold text-blue-600">Sighting Report</p>
            <p class="text-sm">${point.location || 'Unknown location'}</p>
            <p class="text-xs text-gray-500">${new Date(point.createdAt).toLocaleString()}</p>
          </div>`
        : `<div class="p-2">
            <p class="font-semibold text-red-600">${point.childName || 'Missing Child'}</p>
            ${point.age ? `<p class="text-sm">Age: ${point.age}</p>` : ''}
            <p class="text-sm">${point.lastSeenLocation || 'Unknown location'}</p>
            <p class="text-xs text-gray-500">${new Date(point.createdAt).toLocaleString()}</p>
          </div>`;

      marker.bindPopup(popupContent);

      if (onPointClick) {
        marker.on('click', () => onPointClick(point));
      }

      markersRef.current.push(marker);
    });
  }, [points, onPointClick]);

  // Handle selected location marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing selected marker
    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove();
      selectedMarkerRef.current = null;
    }

    // Add new selected marker
    if (selectedLocation) {
      const icon = L.divIcon({
        html: '<div class="w-6 h-6 bg-blue-500 border-2 border-white rounded-full shadow-lg animate-pulse"></div>',
        className: 'custom-marker-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([selectedLocation.lat, selectedLocation.lng], { icon })
        .addTo(mapInstanceRef.current);

      marker.bindPopup('<p class="text-sm font-semibold">Selected Location</p>').openPopup();

      selectedMarkerRef.current = marker;

      // Pan to selected location
      mapInstanceRef.current.panTo([selectedLocation.lat, selectedLocation.lng]);
    }
  }, [selectedLocation]);

  return (
    <div
      ref={mapRef}
      className={`w-full h-full min-h-[400px] rounded-lg overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}

// Hook for fetching map data
export function useMapData() {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/map-data');
      if (!response.ok) throw new Error('Failed to fetch map data');
      const data = await response.json();
      setPoints(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMapData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { points, loading, error, refetch: fetchMapData };
}
