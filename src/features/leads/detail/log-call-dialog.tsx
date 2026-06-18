'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface LogCallDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leadName: string
  onSubmit: (summary: string, detail: string) => void
  children: React.ReactNode
}

export function LogCallDialog({ open, onOpenChange, leadName, onSubmit, children }: LogCallDialogProps) {
  const [summary, setSummary] = useState('')
  const [detail, setDetail] = useState('')

  const handleSubmit = () => {
    onSubmit(summary, detail)
    setSummary('')
    setDetail('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ثبت تماس جدید</DialogTitle>
          <DialogDescription>
            نتیجه تماس با {leadName} را ثبت کنید
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="خلاصه تماس *" value={summary} onChange={(e) => setSummary(e.target.value)} />
          <Textarea placeholder="جزئیات بیشتر (اختیاری)" value={detail} onChange={(e) => setDetail(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>انصراف</Button>
          <Button onClick={handleSubmit} disabled={!summary}>ثبت تماس</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}