// src/features/leads/components/table/bulk-delete-dialog.tsx

'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BulkDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isPending: boolean;
  count: number;
}

export function BulkDeleteDialog({
  open,
  onClose,
  onConfirm,
  isPending,
  count,
}: BulkDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>حذف گروهی سرنخ‌ها</DialogTitle>
          <DialogDescription>
            آیا از حذف {count} سرنخ انتخاب شده اطمینان دارید؟
            <br />
            این عملیات غیرقابل بازگشت است و تمام فعالیت‌ها و وظایف مرتبط نیز حذف می‌شوند.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            انصراف
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? 'در حال حذف...' : `حذف ${count} سرنخ`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
