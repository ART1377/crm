import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  User,
  Tag,
  Copy,
  PhoneCall,
  Check,
  Pencil,
} from "lucide-react";
import { InfoItem } from "./info-item";
import type { Lead } from "@/types";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy";
import { EditLeadDialog } from "../edit-lead-dialog";

interface LeadInfoProps {
  lead: Lead;
}

export function LeadInfo({ lead }: LeadInfoProps) {
  const { copy, copied: primaryCopied } = useCopyToClipboard();
  const { copy: copySecondary, copied: secondaryCopied } = useCopyToClipboard();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          اطلاعات تماس
        </CardTitle>
        <EditLeadDialog lead={lead}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
        </EditLeadDialog>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem
            icon={User}
            label="شخص تماس"
            value={lead.contactPerson || "---"}
          />
          <InfoItem icon={Tag} label="صنعت" value={lead.industry} />
        </div>

        {lead.notes && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-1">یادداشت:</p>
            <p className="text-sm text-muted-foreground">{lead.notes}</p>
          </div>
        )}

        {/* Phone numbers section */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          {/* Primary */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">شماره اصلی</p>
              <a
                href={`tel:${lead.phoneNumber}`}
                className="text-lg font-semibold text-primary hover:underline ltr text-left block"
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
                className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-green-50 text-green-600 hover:bg-green-200 hover:scale-110 transition-all duration-200"
              >
                <PhoneCall className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Secondary */}
          {lead.secondaryPhone && (
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div>
                <p className="text-xs text-muted-foreground mb-1">شماره دوم</p>
                <a
                  href={`tel:${lead.secondaryPhone}`}
                  className="text-lg font-semibold text-primary hover:underline ltr text-left block"
                >
                  {lead.secondaryPhone}
                </a>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    copySecondary(lead.secondaryPhone!, "شماره کپی شد")
                  }
                >
                  {secondaryCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <a
                  href={`tel:${lead.secondaryPhone}`}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-green-50 text-green-600 hover:bg-green-200 hover:scale-110 transition-all duration-200"
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
