'use client';

import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Eye, MapPin, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  const [showBaladPreview, setShowBaladPreview] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const center = { lat: parseFloat(lat) || 35.6892, lng: parseFloat(lng) || 51.389 };

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
      // silent
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = () => {
    onChange(lat, lng);
    setOpen(false);
  };

  const baladPreviewUrl = `https://balad.ir/embed?lat=${lat}&lng=${lng}&zoom=17`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-muted-foreground/20 bg-muted/20 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary h-10 w-full gap-2 rounded-xl border-2 border-dashed transition-all"
        >
          <MapPin className="h-4 w-4" />
          انتخاب از روی نقشه
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold">انتخاب موقعیت روی نقشه</DialogTitle>
            <Button
              variant={showBaladPreview ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowBaladPreview(!showBaladPreview)}
              className="gap-1.5 rounded-lg text-xs"
            >
              <Eye className="h-3.5 w-3.5" />
              {showBaladPreview ? 'بستن بلد' : 'پیش‌نمایش بلد'}
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
              <Input
                ref={inputRef}
                placeholder="جستجوی مکان... (مثال: لاله‌زار تهران)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="border-muted bg-muted/30 focus:border-primary/50 focus:bg-background h-10 rounded-xl border-2 pr-10 text-sm transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleSearch}
              disabled={searching || !searchQuery}
              className="h-10 gap-2 rounded-xl border-2"
            >
              {searching ? (
                <span className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              جستجو
            </Button>
          </div>

          {/* Map area */}
          {showBaladPreview ? (
            // Balad preview
            <div className="border-muted relative h-80 overflow-hidden rounded-xl border-2 sm:h-96">
              <iframe
                key={`balad-${lat}-${lng}`}
                src={baladPreviewUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                title="پیش‌نمایش بلد"
              />
              <div className="pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-full">
                <MapPin className="h-10 w-10 text-red-500 drop-shadow-lg" fill="currentColor" />
              </div>
              <div className="pointer-events-none absolute right-3 bottom-3 z-20 rounded-lg bg-black/70 px-3 py-2 text-[11px] text-white backdrop-blur-sm">
                پیش‌نمایش بلد - برای تغییر به نقشه گوگل برگردید
              </div>
            </div>
          ) : (
            // Google Maps (interactive)
            <div className="border-muted relative h-80 overflow-hidden rounded-xl border-2 sm:h-96">
              {isLoaded ? (
                <GoogleMap
                  key={`google-${lat}-${lng}`}
                  center={center}
                  zoom={15}
                  mapContainerStyle={{ height: '100%', width: '100%' }}
                  onClick={handleMapClick}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    zoomControl: true,
                  }}
                >
                  <Marker
                    position={center}
                    draggable
                    onDragEnd={handleMarkerDrag}
                    animation={google.maps.Animation.DROP}
                  />
                </GoogleMap>
              ) : (
                <div className="bg-muted/20 text-muted-foreground flex h-full items-center justify-center gap-2 text-sm">
                  <span className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                  در حال بارگذاری نقشه...
                </div>
              )}
              <div className="pointer-events-none absolute right-3 bottom-3 z-10 rounded-lg bg-black/60 px-3 py-1.5 text-[10px] text-white backdrop-blur-sm">
                کلیک کنید یا مارکر را بکشید
              </div>
            </div>
          )}

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-medium">عرض جغرافیایی</Label>
              <Input
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                dir="ltr"
                className="border-muted bg-muted/30 focus:border-primary/50 focus:bg-background h-10 rounded-xl border-2 text-sm transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-medium">طول جغرافیایی</Label>
              <Input
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                dir="ltr"
                className="border-muted bg-muted/30 focus:border-primary/50 focus:bg-background h-10 rounded-xl border-2 text-sm transition-all"
              />
            </div>
          </div>

          {/* Confirm button */}
          <Button
            className="shadow-primary/20 hover:shadow-primary/30 h-11 w-full rounded-xl text-base font-semibold shadow-lg transition-all hover:shadow-xl"
            onClick={handleConfirm}
          >
            <MapPin className="ml-2 h-4 w-4" />
            تایید موقعیت
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
