import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

interface LeadFormActionsProps {
  onCancel: () => void
  isPending: boolean
}

export function LeadFormActions({ onCancel, isPending }: LeadFormActionsProps) {
  return (
    <div className="flex gap-3 justify-end pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        انصراف
      </Button>
      <Button type="submit" disabled={isPending}>
        <Save className="ml-2 h-4 w-4" />
        {isPending ? 'در حال ذخیره...' : 'ذخیره سرنخ'}
      </Button>
    </div>
  )
}