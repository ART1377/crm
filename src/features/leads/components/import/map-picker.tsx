'use client';

import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

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

  const center = { lat: parseFloat(lat) || 0, lng: parseFloat(lng) || 0 };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  // Sync with external value changes
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
      // silent
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = () => {
    onChange(lat, lng);
    setOpen(false);
  };

  if (!isLoaded) {
    return (
      <Button variant="outline" className="w-full gap-2" disabled>
        <MapPin className="h-4 w-4" />
        در حال بارگذاری نقشه...
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <MapPin className="h-4 w-4" />
          انتخاب از روی نقشه
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>انتخاب موقعیت روی نقشه</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="جستجوی مکان... (مثال: لاله‌زار تهران)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button variant="outline" onClick={handleSearch} disabled={searching}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-100 overflow-hidden rounded-lg border">
            <GoogleMap
              key={`${lat}-${lng}`}
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
              <Marker position={center} />
            </GoogleMap>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>عرض جغرافیایی</Label>
              <Input value={lat} onChange={(e) => setLat(e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>طول جغرافیایی</Label>
              <Input value={lng} onChange={(e) => setLng(e.target.value)} dir="ltr" />
            </div>
          </div>

          <Button className="w-full" onClick={handleConfirm}>
            تایید موقعیت
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
