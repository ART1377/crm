"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { MessageSquare } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useMessengers } from "@/hooks/use-messengers";
import { useSettings } from "@/hooks/use-settings";
import { useTemplates } from "@/hooks/use-templates";

import { getMessengerLink, replaceTemplateVars } from "@/lib/utils";

import { TemplateSidebarItem } from "./template-sidebar-item";

interface TemplateSidebarProps {
  phone: string;
  companyName: string;
  contactPerson?: string | null;
}

export function TemplateSidebar({ phone, companyName, contactPerson }: TemplateSidebarProps) {
  const { data: templates = [] } = useTemplates();
  const { data: settings = {} } = useSettings();
  const { data: messengers = [] } = useMessengers();
  const [selectedMessengerId, setSelectedMessengerId] = useState("");

  const activeMessengers = messengers.filter((m) => m.isActive);
  const selectedMessenger = activeMessengers.find((m) => m.id === selectedMessengerId);

  const getMessage = (content: string) =>
    replaceTemplateVars(content, {
      senderName: settings.senderName || "صادقی",
      senderPhone: settings.senderPhone || "09191234567",
      senderCompany: settings.senderCompany || "حسابداری کیهان",
      companyName,
      contactPerson,
    });

  const handleSend = (content: string) => {
    if (!selectedMessenger) {
      toast.error("لطفاً پیام‌رسان را انتخاب کنید");
      return;
    }
    window.open(
      getMessengerLink(selectedMessenger.key, phone, getMessage(content), selectedMessenger.linkTemplate),
      "_blank"
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />قالب‌های پیام
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedMessengerId} onValueChange={setSelectedMessengerId}>
          <SelectTrigger>
            <SelectValue placeholder="انتخاب پیام‌رسان" />
          </SelectTrigger>
          <SelectContent>
            {activeMessengers.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-3">
          {templates.map((template) => (
            <TemplateSidebarItem
              key={template.id}
              title={template.title}
              content={template.content}
              getMessage={getMessage}
              onSend={handleSend}
              canSend={!!selectedMessengerId}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}