'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowRight } from 'lucide-react'
import { useUpdateLead } from '@/hooks/use-leads'
import { LEAD_STATUSES } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { Lead } from '@/types'

interface LeadHeaderProps {
  lead: Lead
  leadId: string
  onBack: () => void
}

export function LeadHeader({ lead, leadId, onBack }: LeadHeaderProps) {
  const updateLead = useUpdateLead()

  const handleStatusChange = async (newStatus: string) => {
    await updateLead.mutateAsync({ id: leadId, data: { status: newStatus } })
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{lead.businessName}</h1>
          <p className="text-muted-foreground mt-1">
            آخرین بروزرسانی: {formatDate(new Date(lead.updatedAt))}
          </p>
        </div>
      </div>
      <Select value={lead.status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-45">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LEAD_STATUSES.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}