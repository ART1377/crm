"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTemplate } from "@/hooks/use-templates";
import { MESSENGER_TYPES } from "@/lib/constants";
import { MessengerType } from "@/types";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function CreateTemplateDialog({
  open,
  onOpenChange,
  children,
}: CreateTemplateDialogProps) {
  const createTemplate = useCreateTemplate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<MessengerType>("WHATSAPP");

  const handleCreate = async () => {
    await createTemplate.mutateAsync({ title, content, type });
    onOpenChange(false);
    setTitle("");
    setContent("");
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
          <Textarea
            placeholder="متن پیام"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-25"
          />
          <Select
            value={type}
            onValueChange={(value) => setType(value as MessengerType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MESSENGER_TYPES.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={!title || !content}
          >
            ذخیره قالب
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
