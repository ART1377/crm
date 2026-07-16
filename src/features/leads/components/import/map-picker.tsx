'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface MapPickerProps {
  value: { lat: string; lng: string };
  onChange: (lat: string, lng: string) => void;
}

export function MapPicker({ value, onChange }: MapPickerProps) {
  const [open, setOpen] = useState(false);
  const [lat, setLat] = useState(value.lat);
  const [lng, setLng] = useState(value.lng);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const center = { lat: parseFloat(lat) || 35.6892, lng: parseFloat(lng) || 51.389 };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    setLat(value.lat);
    setLng(value.lng);
  }, [value.lat, value.lng]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setLat(e.latLng.lat().toFixed(6));
      setLng(e.latLng.lng().toFixed(6));
    }
  }, []);

  const handleMarkerDrag = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setLat(e.latLng.lat().toFixed(6));
      setLng(e.latLng.lng().toFixed(6));
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&accept-language=fa`
      );
      const data = await res.json();
      if (data.length > 0) {
        setLat(parseFloat(data[0].lat).toFixed(6));
        setLng(parseFloat(data[0].lon).toFixed(6));
      }
    } catch {
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = () => {
    onChange(lat, lng);
    setOpen(false);
  };

  if (!isLoaded)
    return (
      <Button variant="outline" className="w-full gap-2" disabled>
        <MapPin className="h-4 w-4 animate-bounce" />
        در حال بارگذاری...
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-10 w-full gap-2 rounded-xl border-2 border-dashed">
          <MapPin className="h-4 w-4" />
          انتخاب از روی نقشه
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>انتخاب موقعیت</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
              <Input
                ref={inputRef}
                placeholder="جستجوی مکان..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="rounded-xl pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute top-1/2 left-3 -translate-y-1/2"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleSearch}
              disabled={searching || !searchQuery}
              className="rounded-xl"
            >
              {searching ? (
                <span className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              جستجو
            </Button>
          </div>
          <div className="h-80 overflow-hidden rounded-xl border-2">
            <GoogleMap
              center={center}
              zoom={15}
              mapContainerStyle={{ height: '100%', width: '100%' }}
              onClick={handleMapClick}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
            >
              <Marker
                position={center}
                draggable
                onDragEnd={handleMarkerDrag}
                animation={google.maps.Animation.DROP}
              />
            </GoogleMap>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">عرض جغرافیایی</Label>
              <Input
                dir="ltr"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">طول جغرافیایی</Label>
              <Input
                dir="ltr"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
          <Button className="w-full rounded-xl" onClick={handleConfirm}>
            <MapPin className="ml-2 h-4 w-4" />
            تایید
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
