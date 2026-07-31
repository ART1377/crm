// src/features/leads/components/import/hooks/use-import-search.ts

'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import type { BaladPlace } from '../types';

interface UseImportSearchProps {
  searchFn: (params: {
    keyword: string;
    lat: string;
    lng: string;
    radius: string;
  }) => Promise<{ places: BaladPlace[]; total: number }>;
  sharedParams: {
    keyword: string;
    latitude: string;
    longitude: string;
    radius: string;
  };
  sourceName: string; // اضافه شد - نام منبع (بلد، گوگل مپ، نشان)
}

export function useImportSearch({ searchFn, sharedParams, sourceName }: UseImportSearchProps) {
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<BaladPlace[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importingOne, setImportingOne] = useState<string | null>(null);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);

  const filteredPlaces = useMemo(() => {
    let result = places;

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.businessName.toLowerCase().includes(query) ||
          p.phoneNumber.includes(query) ||
          p.address?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query)
      );
    }

    if (!showDuplicates) {
      result = result.filter((p) => !p.isExisting);
    }

    if (!showHidden) {
      result = result.filter((p) => !hiddenIds.has(p.id));
    }

    return result;
  }, [places, searchQuery, showDuplicates, hiddenIds, showHidden]);

  const handleSearch = async () => {
    setLoading(true);
    setPlaces([]);
    setSelected(new Set());
    setHiddenIds(new Set());

    try {
      const result = await searchFn({
        keyword: sharedParams.keyword,
        lat: sharedParams.latitude,
        lng: sharedParams.longitude,
        radius: sharedParams.radius,
      });
      setPlaces(result.places || []);
      if (result.total === 0) {
        toast('نتیجه‌ای پیدا نشد');
      }
    } catch (error) {
      toast.error('خطا در جستجو');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    const av = filteredPlaces.filter((p) => !p.isExisting);
    setSelected(selected.size === av.length ? new Set() : new Set(av.map((p) => p.id)));
  };

  const handleHide = (id: string) => {
    setHiddenIds((prev) => new Set([...prev, id]));
    if (selected.has(id)) {
      setSelected((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    }
  };

  const handleShowAllHidden = () => {
    setHiddenIds(new Set());
    setShowHidden(false);
  };

  const handleImport = async () => {
    if (selected.size === 0) return;
    setImporting(true);
    try {
      const leads = places
        .filter((p) => selected.has(p.id))
        .map((p) => ({
          ...p,
          industry: sharedParams.keyword.split(',')[0],
          source: sourceName, // استفاده از sourceName به جای 'import'
        }));

      const res = await fetch('/api/leads/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads }),
      });
      const r = await res.json();
      toast.success(`${r.imported} وارد شد`);
      setPlaces((prev) => prev.map((p) => (selected.has(p.id) ? { ...p, isExisting: true } : p)));
      setSelected(new Set());
    } catch {
      toast.error('خطا در وارد کردن');
    } finally {
      setImporting(false);
    }
  };

  const handleImportOne = async (place: BaladPlace) => {
    setImportingOne(place.id);
    try {
      const leads = [
        {
          ...place,
          industry: sharedParams.keyword.split(',')[0],
          source: sourceName, // استفاده از sourceName به جای 'import'
        },
      ];

      const res = await fetch('/api/leads/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads }),
      });
      const r = await res.json();
      toast.success(`${r.imported} وارد شد`);
      setPlaces((prev) => prev.map((p) => (p.id === place.id ? { ...p, isExisting: true } : p)));
    } catch {
      toast.error('خطا در وارد کردن');
    } finally {
      setImportingOne(null);
    }
  };

  const updatePlace = (id: string, updated: BaladPlace) => {
    setPlaces((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  return {
    loading,
    setLoading,
    places,
    setPlaces,
    selected,
    setSelected,
    filteredPlaces,
    importing,
    importingOne,
    showDuplicates,
    setShowDuplicates,
    searchQuery,
    setSearchQuery,
    hiddenIds,
    showHidden,
    setShowHidden,
    handleSearch,
    toggle,
    toggleAll,
    handleHide,
    handleShowAllHidden,
    handleImport,
    handleImportOne,
    updatePlace,
    totalCount: places.length,
  };
}
