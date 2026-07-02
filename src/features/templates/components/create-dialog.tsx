"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useCreateTemplate } from "@/features/templates/hooks/use-templates";

import { MESSENGER_TYPES, TEMPLATE_PURPOSES } from "../constants/templates-constants";
import { MessengerType } from "../types/templates-types";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function CreateTemplateDialog({ open, onOpenChange, children }: CreateTemplateDialogProps) {
  const createTemplate = useCreateTemplate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [purpose, setPurpose] = useState("CUSTOM");
  const [type, setType] = useState<MessengerType>("WHATSAPP");

  const handleCreate = async () => {
    await createTemplate.mutateAsync({ title, content, type, purpose });
    onOpenChange(false);
    setTitle("");
    setContent("");
    setPurpose("CUSTOM");
    setType("WHATSAPP");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ایجاد قالب پیام جدید</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="عنوان قالب"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Select value={purpose} onValueChange={setPurpose}>
            <SelectTrigger>
              <SelectValue placeholder="نوع قالب" />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_PURPOSES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder="متن پیام"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-25"
          />
          <p className="text-muted-foreground -mt-2 text-xs">
            متغیرهای قابل استفاده: {"{senderName}"} {"{senderPhone}"} {"{senderCompany}"}{" "}
            {"{companyName}"} {"{contactPerson}"}
          </p>

          <Select value={type} onValueChange={(value) => setType(value as MessengerType)}>
            <SelectTrigger>
              <SelectValue placeholder="پلتفرم پیش‌فرض" />
            </SelectTrigger>
            <SelectContent>
              {MESSENGER_TYPES.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button className="w-full" onClick={handleCreate} disabled={!title || !content}>
            ذخیره قالب
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
