'use client';

import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';

interface MapPlace {
  businessName: string;
  phoneNumber: string;
  address: string;
  location?: { lat: number; lng: number };
  isExisting?: boolean;
}

interface ResultsMapProps {
  places: MapPlace[];
  center: { lat: number; lng: number };
}

export function ResultsMap({ places, center }: ResultsMapProps) {
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);
  const placesWithLocation = places.filter((p) => p.location);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  if (!isLoaded) {
    return (
      <div className="bg-muted flex h-full items-center justify-center rounded-lg border text-sm">
        در حال بارگذاری نقشه...
      </div>
    );
  }

  if (placesWithLocation.length === 0) {
    return (
      <div className="bg-muted flex h-full items-center justify-center rounded-lg border text-sm text-gray-500">
        مختصاتی برای نمایش وجود ندارد
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden rounded-lg border">
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
        {placesWithLocation.map((place, i) => (
          <Marker
            key={i}
            position={{ lat: place.location!.lat, lng: place.location!.lng }}
            onClick={() => setSelectedPlace(place)}
            icon={
              place.isExisting
                ? {
                    url:
                      'data:image/svg+xml;utf8,' +
                      encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="14" fill="#9CA3AF" stroke="white" stroke-width="2"/>
                        <text x="16" y="21" text-anchor="middle" fill="white" font-size="14" font-weight="bold">✓</text>
                      </svg>
                    `),
                    scaledSize: new google.maps.Size(32, 32),
                  }
                : undefined
            }
          />
        ))}

        {selectedPlace && selectedPlace.location && (
          <InfoWindow
            position={{ lat: selectedPlace.location.lat, lng: selectedPlace.location.lng }}
            onCloseClick={() => setSelectedPlace(null)}
          >
            <div className="min-w-45 p-1 text-right">
              <p className="mb-1 text-sm font-bold">{selectedPlace.businessName}</p>
              {selectedPlace.phoneNumber && (
                <p className="mb-1 text-xs" dir="ltr">
                  {selectedPlace.phoneNumber}
                </p>
              )}
              {selectedPlace.address && (
                <p className="text-muted-foreground text-[10px]">{selectedPlace.address}</p>
              )}
              {selectedPlace.isExisting && (
                <Badge variant="secondary" className="mt-1 text-[10px]">
                  قبلاً ثبت شده
                </Badge>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
