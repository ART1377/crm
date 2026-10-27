// src/features/leads/components/staged/components/staged-lead-card.tsx

'use client';

import { Building2, Loader2, MapPin, Phone, Plus, Tag, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import { cn } from '@/lib/utils';

import type { StagedLead } from './types';

interface StagedLeadCardProps {
  lead: StagedLead;
  checked: boolean;
  importing?: boolean;
  deleting?: boolean;
  onToggle: (e?: React.MouseEvent) => void;
  onImport: () => void;
  onDelete: () => void;
}

export function StagedLeadCard({
  lead,
  checked,
  importing,
  deleting,
  onToggle,
  onImport,
  onDelete,
}: StagedLeadCardProps) {
  return (
    <div
      onClick={(e) => onToggle(e)} // ✅ event پاس داده می‌شود
      className={cn(
        'group relative flex cursor-pointer items-start gap-3 overflow-hidden rounded-xl border-2 p-4 transition-all duration-200',
        checked
          ? 'border-primary/30 bg-primary/5 shadow-sm'
          : 'border-muted hover:border-primary/20 bg-white hover:shadow-sm'
      )}
    >
      {/* Checkbox */}
      <div className="flex shrink-0 flex-col items-center gap-1.5">
        <Checkbox
          checked={checked}
          onCheckedChange={() => onToggle()} // checkbox بدون event
          className="pointer-events-none"
        />
      </div>

      {/* محتوا */}
      <div className="min-w-0 flex-1">
        {/* ردیف اول: نام + بج‌ها */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-foreground text-sm font-semibold wrap-break-word">
                {lead.businessName}
              </h4>
              {lead.searchedIndustry && (
                <Badge
                  variant="outline"
                  className="shrink-0 gap-1 border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {lead.searchedIndustry}
                </Badge>
              )}
            </div>

            {/* شماره تماس */}
            {lead.phoneNumber && (
              <div className="mt-1.5">
                <a
                  href={`tel:${lead.phoneNumber}`}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-primary/5 text-primary hover:bg-primary/10 flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
                  dir="ltr"
                >
                  <Phone className="h-3 w-3" />
                  {lead.phoneNumber}
                </a>
              </div>
            )}
          </div>

          {/* دکمه‌های عملیات */}
          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary hover:bg-primary/10 h-8 w-8 rounded-lg transition-all"
              disabled={importing}
              onClick={(e) => {
                e.stopPropagation();
                onImport();
              }}
              title="وارد کردن به عنوان سرنخ"
            >
              {importing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive h-8 w-8 rounded-lg transition-all hover:bg-red-50"
              disabled={deleting}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="حذف از انبار"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* آدرس */}
        {lead.address && (
          <div className="mt-2 flex items-start gap-1.5">
            <MapPin className="text-muted-foreground mt-0.5 h-3 w-3 shrink-0" />
            <p className="text-muted-foreground line-clamp-2 text-[11px] leading-relaxed">
              {lead.address}
            </p>
          </div>
        )}

        {/* بج‌های پایین */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {lead.industry && (
            <Badge variant="outline" className="text-muted-foreground gap-1 text-[10px]">
              <Building2 className="h-2.5 w-2.5" />
              {lead.industry}
            </Badge>
          )}
          {lead.source && (
            <Badge variant="outline" className="text-muted-foreground text-[10px]">
              📍 {lead.source}
            </Badge>
          )}
          {lead.matchedKeyword && (
            <Badge
              variant="outline"
              className="gap-1 border-blue-200 bg-blue-50 text-[10px] text-blue-700"
            >
              🔍 {lead.matchedKeyword}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
