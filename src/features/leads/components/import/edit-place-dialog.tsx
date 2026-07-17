'use client';

import { Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BaladPlace } from './types';

interface EditPlaceDialogProps {
  place: BaladPlace;
  onSave: (id: string, updatedPlace: BaladPlace) => void;
  isExisting?: boolean;
}

export function EditPlaceDialog({ place, onSave, isExisting }: EditPlaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    businessName: place.businessName || '',
    phoneNumber: place.phoneNumber || '',
    address: place.address || '',
  });

  useEffect(() => {
    setForm({
      businessName: place.businessName || '',
      phoneNumber: place.phoneNumber || '',
      address: place.address || '',
    });
  }, [place]);

  function handleSave() {
    onSave(place.id, {
      ...place,
      businessName: form.businessName,
      phoneNumber: form.phoneNumber,
      address: form.address,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-muted hover:text-foreground h-8 w-8 rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ویرایش اطلاعات</DialogTitle>
          <DialogDescription>می‌توانید اطلاعات را قبل از وارد کردن ویرایش کنید</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>نام کسب‌وکار</Label>
            <Input
              value={form.businessName}
              onChange={(e) => setForm((prev) => ({ ...prev, businessName: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>شماره تماس</Label>
            <Input
              value={form.phoneNumber}
              onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label>آدرس</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>
          {isExisting && (
            <Badge variant="secondary" className="w-fit text-[10px]">
              این مورد قبلاً ثبت شده
            </Badge>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            انصراف
          </Button>
          <Button onClick={handleSave}>ذخیره</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
