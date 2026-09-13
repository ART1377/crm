// src/features/leads/components/import/search-map.tsx

'use client';

import type { LayerGroup, Map } from 'leaflet';
import { useEffect, useRef } from 'react';

interface GridPoint {
  lat: number;
  lng: number;
  searched: boolean;
}

interface SearchMapProps {
  center: { lat: number; lng: number };
  gridPoints: GridPoint[];
  currentPoint?: { lat: number; lng: number } | null;
  zoom?: number;
}

type LeafletModule = typeof import('leaflet');

export function SearchMap({ center, gridPoints, currentPoint, zoom = 19 }: SearchMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);
  const LRef = useRef<LeafletModule | null>(null);

  // مقداردهی اولیه نقشه
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      // ✅ import داینامیک Leaflet
      const L = (await import('leaflet')).default;

      // ✅ import CSS
      await import('leaflet/dist/leaflet.css');

      if (!isMounted || !mapContainerRef.current || mapRef.current) return;

      LRef.current = L;

      const map = L.map(mapContainerRef.current).setView([center.lat, center.lng], zoom);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);

      // رسم نقاط
      drawMarkers();
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // تابع رسم نقاط
  const drawMarkers = () => {
    const L = LRef.current;
    if (!L || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // نقاط جستجو شده
    gridPoints
      .filter((p) => p.searched)
      .forEach((point: GridPoint) => {
        L.circleMarker([point.lat, point.lng], {
          radius: 4,
          fillColor: '#22c55e',
          color: '#22c55e',
          weight: 1,
          opacity: 0.7,
          fillOpacity: 0.7,
        }).addTo(markersLayerRef.current!);
      });

    // نقاط جستجو نشده
    gridPoints
      .filter((p) => !p.searched)
      .forEach((point: GridPoint) => {
        L.circleMarker([point.lat, point.lng], {
          radius: 3,
          fillColor: '#94a3b8',
          color: '#94a3b8',
          weight: 1,
          opacity: 0.5,
          fillOpacity: 0.5,
        }).addTo(markersLayerRef.current!);
      });

    // نقطه فعلی
    if (currentPoint) {
      L.circleMarker([currentPoint.lat, currentPoint.lng], {
        radius: 8,
        fillColor: '#3b82f6',
        color: '#3b82f6',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.8,
      }).addTo(markersLayerRef.current);
    }

    // مرکز
    L.circleMarker([center.lat, center.lng], {
      radius: 8,
      fillColor: '#ef4444',
      color: 'white',
      weight: 2,
      opacity: 1,
      fillOpacity: 1,
    }).addTo(markersLayerRef.current);
  };

  // آپدیت مرکز
  useEffect(() => {
    if (mapRef.current && LRef.current) {
      mapRef.current.setView([center.lat, center.lng], zoom);
    }
  }, [center.lat, center.lng, zoom]);

  // آپدیت نقاط
  useEffect(() => {
    drawMarkers();
  }, [gridPoints, currentPoint, center]);

  const searchedCount = gridPoints.filter((p) => p.searched).length;
  const totalCount = gridPoints.length;

  return (
    <div className="relative h-full overflow-hidden rounded-xl border-2">
      <div ref={mapContainerRef} className="h-full w-full" />

      <div className="pointer-events-none absolute right-3 bottom-3 z-10 rounded-lg bg-black/60 px-3 py-1.5 text-[10px] text-white backdrop-blur-sm">
        🟢 {searchedCount} جستجو شده
        {' | '}⚪ {totalCount - searchedCount} در انتظار
        {' | '}🔍 زوم {zoom}
      </div>
    </div>
  );
}
