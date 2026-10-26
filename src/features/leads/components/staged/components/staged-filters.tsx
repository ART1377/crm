// src/features/leads/components/staged/components/staged-filters.tsx

'use client';

import { RotateCcw, Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { MultiSelect } from '@/components/shared/multi-select';

import { useListOptions } from '@/features/settings/hooks/use-list-options';

interface StagedFiltersProps {
  filters: { search: string; source: string; industry: string };
  onFilterChange: (field: 'search' | 'source' | 'industry', value: string) => void;
  onClearFilters: () => void;
}

export function StagedFilters({ filters, onFilterChange, onClearFilters }: StagedFiltersProps) {
  const { data: industryOptions = [] } = useListOptions('INDUSTRY');
  const { data: sourceOptions = [] } = useListOptions('SOURCE');

  const selectedSources = filters.source ? filters.source.split(',').filter(Boolean) : [];
  const selectedIndustries = filters.industry ? filters.industry.split(',').filter(Boolean) : [];

  const hasFilters =
    Boolean(filters.search) || Boolean(filters.source) || Boolean(filters.industry);

  return (
    <Card className="overflow-visible">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="جستجوی نام، شماره یا آدرس..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="pr-10 pl-10"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onFilterChange('search', '')}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <MultiSelect
              label="منبع"
              options={sourceOptions.map((s) => ({ value: s.value, label: s.value }))}
              selectedValues={selectedSources}
              onChange={(v) => onFilterChange('source', v)}
              className="flex-1"
              searchable
            />

            <MultiSelect
              label="صنعت"
              options={industryOptions.map((s) => ({ value: s.value, label: s.value }))}
              selectedValues={selectedIndustries}
              onChange={(v) => onFilterChange('industry', v)}
              className="flex-1"
              searchable
            />
          </div>

          {hasFilters && (
            <Button
              variant="destructive"
              size="lg"
              onClick={onClearFilters}
              className="w-full gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              بازنشانی فیلترها
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
