// src/features/leads/components/import/neshan-search.tsx

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search } from 'lucide-react';
import { useImportSearch } from './hooks/use-import-search';
import { ImportToolbar } from './import-toolbar';
import { ResultCard } from './result-card';

interface NeshanSearchProps {
  sharedParams: {
    keyword: string;
    latitude: string;
    longitude: string;
    radius: string;
    zoom: string;
    step: string;
  };
}

export function NeshanSearch({ sharedParams }: NeshanSearchProps) {
  const {
    loading,
    places,
    filteredPlaces,
    selected,
    importing,
    importingOne,
    showDuplicates,
    setShowDuplicates,
    searchQuery,
    setSearchQuery,
    hiddenIds,
    showHidden,
    handleSearch,
    toggle,
    toggleAll,
    handleHide,
    handleShowAllHidden,
    handleImport,
    handleImportOne,
    updatePlace,
  } = useImportSearch({
    searchFn: async ({ keyword, lat, lng, radius }) => {
      const params = new URLSearchParams({ keyword, lat, lng, radius });
      const res = await fetch(`/api/leads/search-neshan?${params}`);
      return res.json();
    },
    sharedParams,
    sourceName: 'نشان',
  });

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>جستجو در نشان</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full gap-2" onClick={handleSearch} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}{' '}
            جستجو
          </Button>
        </CardContent>
      </Card>

      {places.length > 0 && (
        <Card>
          <CardHeader>
            <ImportToolbar
              places={filteredPlaces}
              selected={selected}
              importing={importing}
              hiddenCount={hiddenIds.size}
              onToggleAll={toggleAll}
              onImport={handleImport}
              onSearchChange={setSearchQuery}
              onToggleDuplicates={setShowDuplicates}
              onShowHidden={handleShowAllHidden}
              showDuplicates={showDuplicates}
              showHidden={showHidden}
              searchQuery={searchQuery}
            />
          </CardHeader>
          <CardContent>
            <div className="max-h-120 space-y-2 overflow-y-auto">
              {filteredPlaces.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center text-sm">
                  {searchQuery ? 'نتیجه‌ای با این عبارت پیدا نشد' : 'هیچ نتیجه‌ای وجود ندارد'}
                </div>
              ) : (
                filteredPlaces.map((place, index) => (
                  <ResultCard
                    key={place.id}
                    place={place}
                    checked={selected.has(place.id)}
                    index={index}
                    total={filteredPlaces.length}
                    importing={importingOne === place.id}
                    isHidden={hiddenIds.has(place.id)}
                    onCheckedChange={() => toggle(place.id)}
                    onSave={updatePlace}
                    onImportOne={handleImportOne}
                    onHide={handleHide}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && places.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
              <p className="text-muted-foreground text-sm">در حال جستجو...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
