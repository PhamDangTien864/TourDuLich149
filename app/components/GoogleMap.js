'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

export default function GoogleMap({ 
  center = { lat: 16.0544, lng: 108.2022 }, 
  zoom = 12,
  markers = [],
  polyline = null,
  showRoute = false,
  height = '400px',
  className = ''
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadGoogleMaps = () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
      if (!apiKey) {
        setError('Google Maps API Key not found');
        setLoading(false);
        return;
      }

      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      // Load Google Maps script with marker library
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      window.initGoogleMaps = () => {
        initMap();
      };

      script.onerror = () => {
        setError('Failed to load Google Maps');
        setLoading(false);
      };

      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current || !window.google) return;

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ],
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });

        mapInstanceRef.current = map;

        // Add markers using AdvancedMarkerElement (replaces deprecated Marker)
        if (markers && markers.length > 0) {
          markers.forEach((marker, index) => {
            if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
              const advancedMarker = new window.google.maps.marker.AdvancedMarkerElement({
                map,
                position: marker.position,
                title: marker.title || `Marker ${index + 1}`
              });
            } else {
              // Fallback to deprecated Marker if marker library not loaded
              console.warn('AdvancedMarkerElement not available, falling back to deprecated Marker');
              new window.google.maps.Marker({
                position: marker.position,
                map,
                title: marker.title || `Marker ${index + 1}`,
                animation: window.google.maps.Animation.DROP
              });
            }
          });
        }

        // Add polyline/route
        if (polyline && polyline.length > 0) {
          const path = polyline.map(point => ({ lat: point.lat, lng: point.lng }));
          new window.google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: '#3b82f6',
            strokeOpacity: 1.0,
            strokeWeight: 4,
            map
          });

          // Fit bounds to show entire route
          const bounds = new window.google.maps.LatLngBounds();
          polyline.forEach(point => bounds.extend({ lat: point.lat, lng: point.lng }));
          map.fitBounds(bounds);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadGoogleMaps();

    return () => {
      // Cleanup if needed
      if (window.initGoogleMaps) {
        delete window.initGoogleMaps;
      }
    };
  }, [center, zoom, markers, polyline]);

  if (error) {
    return (
      <div className={`bg-slate-100 rounded-2xl flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center p-8">
          <MapPin className="mx-auto text-slate-400 mb-4" size={48} />
          <p className="text-slate-600 font-bold mb-2">Không thể tải bản đồ</p>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-slate-100 rounded-2xl flex items-center justify-center ${className}`} style={{ height }}>
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{ height }}
    />
  );
}

// Places Autocomplete Component
export function PlacesAutocomplete({ 
  onPlaceSelect, 
  placeholder = 'Tìm địa điểm...',
  className = '',
  defaultValue = ''
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode', 'establishment'],
      componentRestrictions: { country: 'VN' }
    });

    autocompleteRef.current = autocomplete;

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        onPlaceSelect({
          name: place.name,
          address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          placeId: place.place_id
        });
      }
    });

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onPlaceSelect]);

  return (
    <div className={`relative ${className}`}>
      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        ref={inputRef}
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
      />
    </div>
  );
}

// Route Calculator Component
export function RouteCalculator({ 
  origin, 
  destination, 
  onRouteCalculated,
  travelMode = 'DRIVING'
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!origin || !destination || !window.google) return;

    const calculateRoute = async () => {
      setLoading(true);
      setError(null);

      try {
        const directionsService = new window.google.maps.DirectionsService();
        
        const result = await directionsService.route({
          origin: { lat: origin.lat, lng: origin.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          travelMode: window.google.maps.TravelMode[travelMode]
        });

        if (result.status === 'OK') {
          const route = result.routes[0];
          const polyline = window.google.maps.geometry.encoding.decode(route.overview_polyline);
          
          onRouteCalculated({
            polyline,
            distance: route.legs[0].distance.text,
            duration: route.legs[0].duration.text,
            steps: route.legs[0].steps
          });
        } else {
          setError('Không thể tính toán lộ trình');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    calculateRoute();
  }, [origin, destination, travelMode, onRouteCalculated]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-blue-600">
        <Loader2 className="animate-spin" size={18} />
        <span className="font-bold text-sm">Đang tính lộ trình...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <Navigation size={18} />
        <span className="font-bold text-sm">{error}</span>
      </div>
    );
  }

  return null;
}

// Tour Map Component with Route
export function TourMap({ tour, className = '' }) {
  const [routeData, setRouteData] = useState(null);

  const markers = tour.tour_itinerary?.map((day, idx) => ({
    position: { lat: tour.latitude || 16.0544, lng: tour.longitude || 108.2022 },
    title: day.title
  })) || [];

  return (
    <div className={`space-y-4 ${className}`}>
      <GoogleMap
        center={{ lat: tour.latitude || 16.0544, lng: tour.longitude || 108.2022 }}
        zoom={10}
        markers={markers}
        polyline={routeData?.polyline}
        height="500px"
        className="w-full"
      />
      
      {routeData && (
        <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-4">
          <Navigation className="text-blue-600" size={24} />
          <div>
            <p className="font-black text-slate-800">Khoảng cách: {routeData.distance}</p>
            <p className="text-slate-600 text-sm">Thời gian di chuyển: {routeData.duration}</p>
          </div>
        </div>
      )}
    </div>
  );
}
