// src/features/leads/components/import/map-picker.tsx

'use client';

import type { LeafletMouseEvent, Map, Marker } from 'leaflet';
import { useEffect, useRef, useState } from 'react';

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
import { MapPin, Search, X } from 'lucide-react';

interface MapPickerProps {
  value: { lat: string; lng: string };
  onChange: (lat: string, lng: string) => void;
}

type LeafletModule = typeof import('leaflet');

export function MapPicker({ value, onChange }: MapPickerProps) {
  const [open, setOpen] = useState(false);
  const [lat, setLat] = useState(value.lat);
  const [lng, setLng] = useState(value.lng);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const LRef = useRef<LeafletModule | null>(null);

  useEffect(() => {
    setLat(value.lat);
    setLng(value.lng);
  }, [value.lat, value.lng]);

  // ✅ useEffect جدا برای مقداردهی نقشه
  useEffect(() => {
    if (!open) {
      // وقتی دیالوگ بسته میشه، نقشه رو پاک کن
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        LRef.current = null;
        setMapReady(false);
      }
      return;
    }

    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const initMap = async () => {
      // ✅ صبر کن تا Dialog کاملاً باز بشه
      timeoutId = setTimeout(async () => {
        if (!isMounted || !mapContainerRef.current || mapRef.current) return;

        try {
          // ✅ import داینامیک Leaflet
          const L = (await import('leaflet')).default;
          await import('leaflet/dist/leaflet.css');

          if (!isMounted || !mapContainerRef.current) return;

          LRef.current = L;

          // رفع مشکل آیکون
          delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl:
              'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl:
              'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          });

          const center: [number, number] = [parseFloat(lat) || 35.6892, parseFloat(lng) || 51.389];

          const map = L.map(mapContainerRef.current, {
            center,
            zoom: 15,
          });
          mapRef.current = map;

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map);

          const marker = L.marker(center, { draggable: true }).addTo(map);
          markerRef.current = marker;

          // کلیک روی نقشه
          map.on('click', (e: LeafletMouseEvent) => {
            const { lat: newLat, lng: newLng } = e.latlng;
            setLat(newLat.toFixed(6));
            setLng(newLng.toFixed(6));
            marker.setLatLng([newLat, newLng]);
          });

          // درگ مارکر
          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            setLat(pos.lat.toFixed(6));
            setLng(pos.lng.toFixed(6));
          });

          setMapReady(true);

          // ✅ Invalidate size برای رفع مشکل رندر در Dialog
          setTimeout(() => {
            if (mapRef.current && isMounted) {
              mapRef.current.invalidateSize();
            }
          }, 100);
        } catch (error) {
          console.error('Map init error:', error);
        }
      }, 100); // ✅ ۱۰۰ میلی‌ثانیه تأخیر
    };

    initMap();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        LRef.current = null;
        setMapReady(false);
      }
    };
  }, [open]);

  // ✅ آپدیت مارکر وقتی lat/lng تغییر می‌کنه
  useEffect(() => {
    if (markerRef.current && mapRef.current && mapReady) {
      const newPos: [number, number] = [parseFloat(lat), parseFloat(lng)];
      if (!isNaN(newPos[0]) && !isNaN(newPos[1])) {
        markerRef.current.setLatLng(newPos);
        mapRef.current.setView(newPos, mapRef.current.getZoom());
      }
    }
  }, [lat, lng, mapReady]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&accept-language=fa`
      );
      const data = await res.json();
      if (data.length > 0) {
        const newLat = parseFloat(data[0].lat).toFixed(6);
        const newLng = parseFloat(data[0].lon).toFixed(6);
        setLat(newLat);
        setLng(newLng);
        if (mapRef.current && markerRef.current) {
          const pos: [number, number] = [parseFloat(newLat), parseFloat(newLng)];
          markerRef.current.setLatLng(pos);
          mapRef.current.setView(pos, 15);
        }
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-10 w-full gap-2 rounded-xl border-2 border-dashed">
          <MapPin className="h-4 w-4" />
          انتخاب از روی نقشه
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>انتخاب موقعیت</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
              <Input
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

          {/* Map */}
          <div className="relative h-80 overflow-hidden rounded-xl border-2 sm:h-96">
            <div ref={mapContainerRef} className="h-full w-full" />
            {!mapReady && (
              <div className="bg-muted/20 text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
                <span className="border-primary mr-2 h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                در حال بارگذاری نقشه...
              </div>
            )}
          </div>

          {/* Coordinates */}
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
            تایید موقعیت
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
