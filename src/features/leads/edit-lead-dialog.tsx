"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUpdateLead } from "@/hooks/use-leads";
import { ComboboxInput } from "@/components/shared/combobox-input";
import { useListOptions } from "@/hooks/use-list-options";
import { User, Building2, Phone, Tag, Hash, StickyNote } from "lucide-react";
import type { Lead } from "@/types";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_STATUSES } from "@/lib/constants";

interface EditLeadDialogProps {
  lead: Lead;
  children: React.ReactNode;
}

export function EditLeadDialog({ lead, children }: EditLeadDialogProps) {
  const updateLead = useUpdateLead();
  const { data: sourceOptions = [] } = useListOptions("SOURCE");
  const { data: industryOptions = [] } = useListOptions("INDUSTRY");
  const sources = sourceOptions.map((o) => o.value);
  const industries = industryOptions.map((o) => o.value);

  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    businessName: lead.businessName,
    contactPerson: lead.contactPerson || "",
    phoneNumber: lead.phoneNumber,
    secondaryPhone: lead.secondaryPhone || "",
    industry: lead.industry,
    source: lead.source as string,
    status: lead.status as string,
    notes: lead.notes || "",
  });

  const handleSubmit = async () => {
    if (!form.businessName || !form.phoneNumber || !form.industry) {
      toast.error("فیلدهای ستاره‌دار الزامی هستند");
      return;
    }
    await updateLead.mutateAsync({ id: lead.id, data: form });
    setOpen(false);
  };

  return (
    <Dialog key={lead.id} open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ویرایش سرنخ</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نام کسب‌وکار *</Label>
              <div className="relative">
                <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pr-10"
                  value={form.businessName}
                  onChange={(e) =>
                    setForm({ ...form, businessName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>شخص تماس</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pr-10"
                  value={form.contactPerson}
                  onChange={(e) =>
                    setForm({ ...form, contactPerson: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>شماره اصلی *</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pr-10"
                  dir="ltr"
                  value={form.phoneNumber}
                  onChange={(e) =>
                    setForm({ ...form, phoneNumber: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>شماره دوم</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pr-10"
                  dir="ltr"
                  value={form.secondaryPhone}
                  onChange={(e) =>
                    setForm({ ...form, secondaryPhone: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>حوزه فعالیت *</Label>
              <ComboboxInput
                value={form.industry}
                onChange={(value) => setForm({ ...form, industry: value })}
                options={industries}
                placeholder="انتخاب صنعت"
                icon={<Tag className="h-4 w-4" />}
              />
            </div>
            <div className="space-y-2">
              <Label>منبع سرنخ</Label>
              <ComboboxInput
                value={form.source}
                onChange={(value) => setForm({ ...form, source: value })}
                options={sources}
                placeholder="انتخاب منبع"
                icon={<Hash className="h-4 w-4" />}
              />
            </div>
            <div className="space-y-2">
              <Label>وضعیت</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>یادداشت</Label>
            <div className="relative">
              <StickyNote className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                className="min-h-24 pr-10"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={updateLead.isPending}
          >
            {updateLead.isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
