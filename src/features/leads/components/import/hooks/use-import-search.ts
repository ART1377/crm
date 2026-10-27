// src/features/leads/components/import/hooks/use-import-search.ts

'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { useBulkSaveToStaging, useSaveToStaging } from '@/features/leads/hooks/use-staged-leads';
import { useRangeSelection } from '@/hooks/use-range-selection';

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
  sourceName: string;
  selectedIndustries?: string[];
}

export function useImportSearch({
  searchFn,
  sharedParams,
  sourceName,
  selectedIndustries = [],
}: UseImportSearchProps) {
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<BaladPlace[]>([]);
  const [importing, setImporting] = useState(false);
  const [importingOne, setImportingOne] = useState<string | null>(null);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const [savingOne, setSavingOne] = useState<string | null>(null);

  // ✅ استفاده از hookهای انبار
  const saveToStaging = useSaveToStaging();
  const bulkSaveToStaging = useBulkSaveToStaging();

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

  // ✅ انتخاب بازه‌ای مشترک
  const { selected, setSelected, toggleWithRange, selectAll, clearSelection } =
    useRangeSelection(filteredPlaces);

  const handleSearch = async () => {
    setLoading(true);
    setPlaces([]);
    clearSelection();
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
    } catch {
      toast.error('خطا در جستجو');
    } finally {
      setLoading(false);
    }
  };

  const handleHide = (id: string) => {
    setHiddenIds((prev) => new Set([...prev, id]));
    setSelected((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  };

  const handleShowAllHidden = () => {
    setHiddenIds(new Set());
    setShowHidden(false);
  };

  const getIndustryForPlace = (place: BaladPlace): string => {
    if (place.searchedIndustry) return place.searchedIndustry;
    if (selectedIndustries.length === 1) return selectedIndustries[0];
    return sharedParams.keyword.split(',')[0];
  };

  const handleImport = async () => {
    if (selected.size === 0) return;
    setImporting(true);
    try {
      const leads = places
        .filter((p) => selected.has(p.id))
        .map((p) => ({
          ...p,
          industry: getIndustryForPlace(p),
          source: sourceName,
        }));

      const res = await fetch('/api/leads/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads }),
      });
      const r = await res.json();
      toast.success(`${r.imported} وارد شد`);
      setPlaces((prev) => prev.map((p) => (selected.has(p.id) ? { ...p, isExisting: true } : p)));
      clearSelection();
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
          industry: getIndustryForPlace(place),
          source: sourceName,
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

  const handleSaveToStaging = async () => {
    if (selected.size === 0) return;
    try {
      const leads = places
        .filter((p) => selected.has(p.id))
        .map((p) => ({
          ...p,
          industry: getIndustryForPlace(p),
          source: sourceName,
        }));

      await bulkSaveToStaging.mutateAsync(leads);
      setPlaces((prev) => prev.filter((p) => !selected.has(p.id)));
      clearSelection();
    } catch {
      // خطا در hook مدیریت میشه
    }
  };

  const handleSaveOneToStaging = async (place: BaladPlace) => {
    setSavingOne(place.id);
    try {
      const result = await saveToStaging.mutateAsync({
        ...place,
        industry: getIndustryForPlace(place),
        source: sourceName,
      });

      if (result.added > 0) {
        setPlaces((prev) => prev.filter((p) => p.id !== place.id));
      }
    } catch {
      // خطا در hook مدیریت میشه
    } finally {
      setSavingOne(null);
    }
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
    // ✅ API انتخاب بازه‌ای (مشترک)
    toggleWithRange,
    selectAll,
    clearSelection,
    // ✅ سازگاری با نسخه قبلی:
    toggle: toggleWithRange, // placeholder - در ResultCard استفاده نکن
    toggleAll: selectAll, // سازگاری
    handleHide,
    handleShowAllHidden,
    handleImport,
    handleImportOne,
    updatePlace,
    totalCount: places.length,
    saving: bulkSaveToStaging.isPending,
    handleSaveToStaging,
    savingOne,
    handleSaveOneToStaging,
  };
}
