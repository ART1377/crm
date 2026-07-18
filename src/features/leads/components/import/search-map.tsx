// src/features/leads/components/import/search-map.tsx
'use client';

import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

interface GridPoint {
  lat: number;
  lng: number;
  searched: boolean;
}

interface SearchMapProps {
  center: { lat: number; lng: number };
  gridPoints: GridPoint[];
  currentPoint?: { lat: number; lng: number } | null;
}

export function SearchMap({ center, gridPoints, currentPoint }: SearchMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  if (!isLoaded) {
    return (
      <div className="border-muted bg-muted/20 text-muted-foreground flex h-full items-center justify-center rounded-xl border-2 text-sm">
        در حال بارگذاری نقشه...
      </div>
    );
  }

  return (
    <div className="border-muted relative h-full overflow-hidden rounded-xl border-2">
      <GoogleMap
        center={center}
        zoom={14}
        mapContainerStyle={{ height: '100%', width: '100%' }}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {/* Searched points */}
        {gridPoints
          .filter((p) => p.searched)
          .map((point, i) => (
            <Marker
              key={`searched-${i}`}
              position={{ lat: point.lat, lng: point.lng }}
              icon={{
                url:
                  'data:image/svg+xml;utf8,' +
                  encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
                    <circle cx="6" cy="6" r="5" fill="#22c55e" opacity="0.7"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(12, 12),
              }}
            />
          ))}

        {/* Unsearched points */}
        {gridPoints
          .filter((p) => !p.searched)
          .map((point, i) => (
            <Marker
              key={`unsearched-${i}`}
              position={{ lat: point.lat, lng: point.lng }}
              icon={{
                url:
                  'data:image/svg+xml;utf8,' +
                  encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10">
                    <circle cx="5" cy="5" r="4" fill="#94a3b8" opacity="0.5"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(10, 10),
              }}
            />
          ))}

        {/* Current scanning point */}
        {currentPoint && (
          <>
            {/* Pulse ring */}
            <Marker
              position={{ lat: currentPoint.lat, lng: currentPoint.lng }}
              icon={{
                url:
                  'data:image/svg+xml;utf8,' +
                  encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="none" stroke="#3b82f6" stroke-width="3" opacity="0.6">
              <animate attributeName="r" from="10" to="20" dur="1.2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" from="0.8" to="0" dur="1.2s" repeatCount="indefinite"/>
            </circle>
          </svg>
        `),
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 20),
              }}
            />
            {/* Solid center */}
            <Marker
              position={{ lat: currentPoint.lat, lng: currentPoint.lng }}
              icon={{
                url:
                  'data:image/svg+xml;utf8,' +
                  encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6" fill="#3b82f6" stroke="white" stroke-width="2"/>
            <animate attributeName="r" from="5" to="7" dur="0.8s" repeatCount="indefinite"/>
          </svg>
        `),
                scaledSize: new google.maps.Size(16, 16),
                anchor: new google.maps.Point(8, 8),
              }}
            />
          </>
        )}

        {/* Center marker */}
        <Marker
          position={center}
          icon={{
            url:
              'data:image/svg+xml;utf8,' +
              encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#ef4444" stroke="white" stroke-width="2"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(24, 24),
          }}
        />
      </GoogleMap>

      {/* Legend */}
      <div className="pointer-events-none absolute right-3 bottom-3 z-10 rounded-lg bg-black/60 px-3 py-1.5 text-[10px] text-white backdrop-blur-sm">
        🟢 {gridPoints.filter((p) => p.searched).length} جستجو شده
        {' | '}⚪ {gridPoints.filter((p) => !p.searched).length} در انتظار
      </div>
    </div>
  );
}
