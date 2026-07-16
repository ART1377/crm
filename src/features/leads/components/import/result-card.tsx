'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
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
      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
        place.isExisting ? 'border-yellow-200 bg-yellow-50 opacity-60' : 'hover:bg-muted/50'
      }`}
    >
      <Checkbox checked={checked} disabled={place.isExisting} onCheckedChange={onCheckedChange} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{place.businessName}</p>
              {place.isExisting && (
                <Badge variant="secondary" className="text-[10px]">
                  قبلاً ثبت شده
                </Badge>
              )}
            </div>
            {place.phoneNumber && (
              <p dir="ltr" className="text-primary mt-1 text-xs">
                {place.phoneNumber}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 items-center gap-1">
            {!place.isExisting && onImportOne && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-[10px]"
                disabled={importing}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onImportOne(place);
                }}
              >
                <Plus className="h-3 w-3" />
                ایمپورت
              </Button>
            )}
            <EditPlaceDialog place={place} onSave={onSave} isExisting={place.isExisting} />
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {place.category && (
            <Badge variant="outline" className="text-[10px]">
              {place.category}
            </Badge>
          )}
          {place.rating && (
            <Badge variant="outline" className="text-[10px]">
              ⭐ {place.rating}
            </Badge>
          )}
          {place.ratingCount && (
            <Badge variant="secondary" className="text-[10px]">
              {place.ratingCount} نظر
            </Badge>
          )}
          {place.website && (
            <Badge variant="outline" className="text-[10px]">
              وبسایت
            </Badge>
          )}
        </div>
        {place.address && <p className="text-muted-foreground mt-2 text-xs">{place.address}</p>}
      </div>
    </div>
  );
}
