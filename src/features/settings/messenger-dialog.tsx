"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useSaveMessenger } from "@/hooks/use-messengers";

import type { Messenger } from "@/types";

interface MessengerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messenger: Messenger | null;
  onClose: () => void;
}

export function MessengerDialog({ open, onOpenChange, messenger, onClose }: MessengerDialogProps) {
  const save = useSaveMessenger();
  const isEditing = !!messenger;

  const [name, setName] = useState(messenger?.name ?? "");
  const [key, setKey] = useState(messenger?.key ?? "");
  const [linkTemplate, setLinkTemplate] = useState(messenger?.linkTemplate ?? "");

  const handleSubmit = () => {
    save.mutate(
      isEditing
        ? { id: messenger!.id, data: { name, key, linkTemplate } }
        : { data: { name, key, linkTemplate } },
      {
        onSuccess: () => {
          onOpenChange(false);
          onClose();
        },
      }
    );
  };

  const isValid = name && key && linkTemplate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "ویرایش پیام‌رسان" : "افزودن پیام‌رسان جدید"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>نام</Label>
            <Input placeholder="مثال: واتساپ" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>کلید (لاتین)</Label>
            <Input
              placeholder="مثال: WHATSAPP"
              dir="ltr"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>لینک قالب</Label>
            <Input
              placeholder="https://wa.me/{phone}?text={message}"
              dir="ltr"
              value={linkTemplate}
              onChange={(e) => setLinkTemplate(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            از {"{phone}"} و {"{message}"} در لینک استفاده کنید
          </p>
          <Button className="w-full" onClick={handleSubmit} disabled={!isValid}>
            {isEditing ? "بروزرسانی" : "افزودن"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}