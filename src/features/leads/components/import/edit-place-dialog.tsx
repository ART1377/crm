// src/features/leads/components/import/edit-place-dialog.tsx

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
    website: place.website || '',
    category: place.category || '',
    rating: place.rating?.toString() || '',
  });

  useEffect(() => {
    setForm({
      businessName: place.businessName || '',
      phoneNumber: place.phoneNumber || '',
      address: place.address || '',
      website: place.website || '',
      category: place.category || '',
      rating: place.rating?.toString() || '',
    });
  }, [place]);

  function handleSave() {
    onSave(place.id, {
      ...place,
      businessName: form.businessName,
      phoneNumber: form.phoneNumber,
      address: form.address,
      website: form.website,
      category: form.category,
      rating: form.rating ? parseFloat(form.rating) : undefined,
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
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ویرایش اطلاعات</DialogTitle>
          <DialogDescription>می‌توانید اطلاعات را قبل از وارد کردن ویرایش کنید</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>نام کسب‌وکار *</Label>
            <Input
              value={form.businessName}
              onChange={(e) => setForm((prev) => ({ ...prev, businessName: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>شماره تماس *</Label>
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
          <div className="space-y-2">
            <Label>وبسایت</Label>
            <Input
              value={form.website}
              onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
              dir="ltr"
              placeholder="example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>دسته‌بندی</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>امتیاز</Label>
              <Input
                value={form.rating}
                onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
                dir="ltr"
                type="number"
                min="0"
                max="5"
                step="0.1"
                placeholder="0-5"
              />
            </div>
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
