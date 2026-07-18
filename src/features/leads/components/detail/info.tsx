import {
  Building2,
  Check,
  Contact,
  Copy,
  Pencil,
  Phone,
  PhoneCall,
  Tag,
  Trash2,
  User,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { useCopyToClipboard } from '@/hooks/use-copy';

import { downloadVCard } from '@/lib/utils';

import { Lead } from '../../types/leads-types';
import { EditLeadDialog } from '../table/edit-lead/dialog';

export function LeadInfo({ lead, onDelete }: { lead: Lead; onDelete: () => void }) {
  const { copy, copied: primaryCopied } = useCopyToClipboard();
  const { copy: copySecondary, copied: secondaryCopied } = useCopyToClipboard();

  return (
    <Card className="border-muted/60 overflow-hidden border-2 shadow-sm">
      {/* Header */}
      <div className="bg-muted/20 flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
            <Building2 className="text-primary h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">{lead.businessName}</p>
            <p className="text-muted-foreground text-[11px]">{lead.industry}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 transition-all hover:scale-110 hover:bg-blue-100 hover:text-blue-600"
            onClick={() => downloadVCard(lead)}
            title="ذخیره مخاطب"
          >
            <Contact className="h-4 w-4" />
          </Button>
          <EditLeadDialog lead={lead} key={`info-${lead.id}-${lead.status}-${lead.updatedAt}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-gray-100 text-gray-600 transition-all hover:scale-110 hover:bg-gray-200"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </EditLeadDialog>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-red-50 text-red-600 transition-all hover:scale-110 hover:bg-red-100 hover:text-red-600"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="space-y-0 p-0">
        {/* Phone numbers - main section */}
        <div className="divide-y">
          {/* Primary phone */}
          <div className="hover:bg-muted/20 flex items-center justify-between px-5 py-4 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <Phone className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">شماره اصلی</p>
                <a
                  href={`tel:${lead.phoneNumber}`}
                  className="text-lg font-semibold tracking-wide transition-colors hover:text-emerald-600"
                  dir="ltr"
                >
                  {lead.phoneNumber}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => copy(lead.phoneNumber, 'کپی شد')}
              >
                {primaryCopied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
              <a
                href={`tel:${lead.phoneNumber}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-all hover:scale-110 hover:bg-emerald-100"
              >
                <PhoneCall className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Secondary phone */}
          {lead.secondaryPhone && (
            <div className="hover:bg-muted/20 flex items-center justify-between px-5 py-4 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                  <Phone className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px]">شماره دوم</p>
                  <a
                    href={`tel:${lead.secondaryPhone}`}
                    className="text-lg font-semibold tracking-wide transition-colors hover:text-amber-600"
                    dir="ltr"
                  >
                    {lead.secondaryPhone}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => copySecondary(lead.secondaryPhone!, 'کپی شد')}
                >
                  {secondaryCopied ? (
                    <Check className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
                <a
                  href={`tel:${lead.secondaryPhone}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600 transition-all hover:scale-110 hover:bg-amber-100"
                >
                  <PhoneCall className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <Separator />
        <div className="grid grid-cols-2 divide-x">
          <div className="flex items-center gap-2.5 px-5 py-3">
            <User className="text-muted-foreground h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-muted-foreground text-[10px]">شخص تماس</p>
              <p className="truncate text-sm font-medium">{lead.contactPerson || '---'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-5 py-3">
            <Tag className="text-muted-foreground h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-muted-foreground text-[10px]">صنعت</p>
              <p className="truncate text-sm font-medium">{lead.industry}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {lead.notes && (
          <>
            <Separator />
            <div className="bg-muted/10 px-5 py-3">
              <p className="text-muted-foreground mb-1 text-[10px] font-medium">یادداشت</p>
              <p className="text-muted-foreground text-[13px] leading-relaxed">{lead.notes}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
