import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Phone, User, Tag, Hash } from 'lucide-react'
import { InfoItem } from './info-item'
import { LEAD_SOURCES } from '@/lib/constants'
import type { Lead } from '@/types'

interface LeadInfoProps {
  lead: Lead
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
          <InfoItem icon={User} label="شخص تماس" value={lead.contactPerson || '---'} />
          <InfoItem icon={Phone} label="شماره اصلی" value={lead.phoneNumber} dir="ltr" />
          {lead.secondaryPhone && (
            <InfoItem icon={Phone} label="شماره دوم" value={lead.secondaryPhone} dir="ltr" />
          )}
          <InfoItem icon={Tag} label="صنعت" value={lead.industry} />
          <InfoItem icon={Hash} label="منبع" value={LEAD_SOURCES.find(s => s.value === lead.source)?.label || lead.source} />
        </div>
        {lead.notes && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-1">یادداشت:</p>
            <p className="text-sm text-muted-foreground">{lead.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}