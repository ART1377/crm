import type { Lead } from "@/types";
import { Building2, Check, Copy, Pencil, PhoneCall, Tag, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useCopyToClipboard } from "@/hooks/use-copy";

import { EditLeadDialog } from "../edit-lead-dialog";
import { InfoItem } from "./info-item";

export function LeadInfo({ lead }: { lead: Lead }) {
  const { copy, copied: primaryCopied } = useCopyToClipboard();
  const { copy: copySecondary, copied: secondaryCopied } = useCopyToClipboard();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          اطلاعات
        </CardTitle>
        <EditLeadDialog lead={lead}>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Pencil className="h-3.5 w-3.5" />
            ویرایش
          </Button>
        </EditLeadDialog>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoItem icon={User} label="شخص تماس" value={lead.contactPerson || "---"} />
          <InfoItem icon={Tag} label="صنعت" value={lead.industry} />
        </div>

        {lead.notes && (
          <div className="border-t pt-4">
            <p className="mb-1 text-sm font-medium">یادداشت:</p>
            <p className="text-muted-foreground text-sm">{lead.notes}</p>
          </div>
        )}

        {/* Phone numbers section */}
        <div className="bg-muted/50 space-y-3 rounded-lg p-4">
          {/* Primary */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-1 text-xs">شماره اصلی</p>
              <a
                href={`tel:${lead.phoneNumber}`}
                className="text-primary ltr block text-left text-lg font-semibold hover:underline"
              >
                {lead.phoneNumber}
              </a>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copy(lead.phoneNumber, "شماره کپی شد")}
              >
                {primaryCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <a
                href={`tel:${lead.phoneNumber}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-600 transition-all duration-200 hover:scale-110 hover:bg-green-200"
              >
                <PhoneCall className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Secondary */}
          {lead.secondaryPhone && (
            <div className="border-border/50 flex items-center justify-between border-t pt-3">
              <div>
                <p className="text-muted-foreground mb-1 text-xs">شماره دوم</p>
                <a
                  href={`tel:${lead.secondaryPhone}`}
                  className="text-primary ltr block text-left text-lg font-semibold hover:underline"
                >
                  {lead.secondaryPhone}
                </a>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copySecondary(lead.secondaryPhone!, "شماره کپی شد")}
                >
                  {secondaryCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <a
                  href={`tel:${lead.secondaryPhone}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-600 transition-all duration-200 hover:scale-110 hover:bg-green-200"
                >
                  <PhoneCall className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
