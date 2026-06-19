import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Phone,
  User,
  Tag,
  Hash,
  Copy,
  PhoneCall,
} from "lucide-react";
import { InfoItem } from "./info-item";
import { LEAD_SOURCES } from "@/lib/constants";
import type { Lead } from "@/types";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface LeadInfoProps {
  lead: Lead;
}

export function LeadInfo({ lead }: LeadInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          اطلاعات تماس
        </CardTitle>
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
        <InfoItem
          icon={Hash}
          label="منبع"
          value={
            LEAD_SOURCES.find((s) => s.value === lead.source)?.label ||
            lead.source
          }
        />

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
                onClick={() => {
                  navigator.clipboard.writeText(lead.phoneNumber);
                  toast.success("شماره کپی شد");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600"
                asChild
              >
                <a
                  href={`tel:${lead.phoneNumber}`}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-green-50 text-green-600 hover:bg-green-200 hover:scale-110 transition-all duration-200 hover:text-green-600"
                >
                  <PhoneCall className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Secondary — same style */}
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
                  onClick={() => {
                    navigator.clipboard.writeText(lead.secondaryPhone!);
                    toast.success("شماره کپی شد");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-green-600"
                  asChild
                >
                  <a
                    href={`tel:${lead.phoneNumber}`}
                    className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-green-50 text-green-600 hover:bg-green-200 hover:scale-110 transition-all duration-200 hover:text-green-600"
                  >
                    <PhoneCall className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
