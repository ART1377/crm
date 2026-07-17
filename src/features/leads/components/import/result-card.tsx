'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Phone, Plus, Star } from 'lucide-react';
import { EditPlaceDialog } from './edit-place-dialog';
import type { BaladPlace } from './types';

interface Props {
  place: BaladPlace;
  checked: boolean;
  importing?: boolean;
  onCheckedChange: () => void;
  onSave: (id: string, place: BaladPlace) => void;
  onImportOne?: (place: BaladPlace) => void;
}

export function ResultCard({
  place,
  checked,
  importing,
  onCheckedChange,
  onSave,
  onImportOne,
}: Props) {
  return (
    <div
      onClick={place.isExisting ? undefined : onCheckedChange}
      className={`group relative flex cursor-pointer items-start gap-3 overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 ${
        place.isExisting
          ? 'cursor-default border-amber-200 bg-amber-50/50 opacity-60'
          : checked
            ? 'border-primary/30 bg-primary/5 shadow-sm'
            : 'border-muted hover:border-primary/20 bg-white hover:shadow-sm'
      }`}
    >
      <Checkbox
        checked={checked}
        disabled={place.isExisting}
        onCheckedChange={onCheckedChange}
        className="pointer-events-none mt-0.5"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-foreground truncate text-sm font-semibold">
                {place.businessName}
              </h4>
              {place.isExisting && (
                <Badge variant="secondary" className="text-[10px]">
                  ثبت شده
                </Badge>
              )}
            </div>

            {place.phoneNumber && (
              <a
                href={`tel:${place.phoneNumber}`}
                onClick={(e) => e.stopPropagation()}
                className="bg-primary/5 text-primary hover:bg-primary/10 mt-1.5 flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
                dir="ltr"
              >
                <Phone className="h-3 w-3" />
                {place.phoneNumber}
              </a>
            )}
          </div>

          {/* Actions - consistent icon buttons */}
          <div className="flex shrink-0 items-center gap-0.5">
            {!place.isExisting && onImportOne && (
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary/10 h-8 w-8 rounded-lg"
                disabled={importing}
                onClick={(e) => {
                  e.stopPropagation();
                  onImportOne(place);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <EditPlaceDialog place={place} onSave={onSave} isExisting={place.isExisting} />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {place.rating && (
            <Badge
              variant="outline"
              className="gap-1 border-amber-200 bg-amber-50 text-[11px] text-amber-700"
            >
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              {place.rating}
            </Badge>
          )}
          {place.category && (
            <Badge variant="outline" className="text-muted-foreground text-[11px]">
              {place.category}
            </Badge>
          )}
          {place.website && (
            <Badge variant="outline" className="text-muted-foreground text-[11px]">
              وبسایت
            </Badge>
          )}
        </div>

        {place.address && (
          <p className="text-muted-foreground mt-2 line-clamp-1 text-[11px] leading-relaxed">
            {place.address}
          </p>
        )}
      </div>
    </div>
  );
}
