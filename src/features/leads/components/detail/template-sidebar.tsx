"use client";

import { MessageSquare } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTemplates } from "@/features/templates/hooks/use-templates";

import { useMessageSender } from "./hooks/use-message-sender";
import { TemplateSidebarItem } from "./template-sidebar-item";

interface TemplateSidebarProps {
  phone: string;
  companyName: string;
  contactPerson?: string | null;
}

export function TemplateSidebar({ phone, companyName, contactPerson }: TemplateSidebarProps) {
  const { data: templates = [] } = useTemplates();
  const {
    getMessage,
    handleSend,
    canSend,
    selectedMessengerId,
    setSelectedMessengerId,
    activeMessengers,
  } = useMessageSender({ phone, companyName, contactPerson });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          قالب‌های پیام
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedMessengerId} onValueChange={setSelectedMessengerId}>
          <SelectTrigger>
            <SelectValue placeholder="انتخاب پیام‌رسان" />
          </SelectTrigger>
          <SelectContent>
            {activeMessengers.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
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
              canSend={canSend}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
