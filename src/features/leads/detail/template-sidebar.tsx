"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Copy, Send } from "lucide-react";
import { useTemplates } from "@/hooks/use-templates";
import { useSettings } from "@/hooks/use-settings";
import { useMessengers } from "@/hooks/use-messengers";
import { getMessengerLink, replaceTemplateVars } from "@/lib/utils";
import toast from "react-hot-toast";
import { useCopyToClipboard } from "@/hooks/use-copy";

interface TemplateSidebarProps {
  phone: string;
  companyName: string;
  contactPerson?: string | null;
}

export function TemplateSidebar({
  phone,
  companyName,
  contactPerson,
}: TemplateSidebarProps) {
  const { data: templates = [] } = useTemplates();
  const { data: settings = {} } = useSettings();
  const { data: messengers = [] } = useMessengers();
  const [selectedMessengerId, setSelectedMessengerId] = useState("");
  const { copy } = useCopyToClipboard();

  const activeMessengers = messengers.filter((m) => m.isActive);

  const selectedMessenger = activeMessengers.find(
    (m) => m.id === selectedMessengerId,
  );

  const getMessage = (content: string) =>
    replaceTemplateVars(content, {
      senderName: settings.senderName || "صادقی",
      senderPhone: settings.senderPhone || "09191234567",
      senderCompany: settings.senderCompany || "حسابداری کیهان",
      companyName,
      contactPerson,
    });

  const handleCopy = (content: string) =>
    copy(getMessage(content), "متن پیام کپی شد");

  const handleSend = (content: string) => {
    if (!selectedMessenger) {
      toast.error("لطفاً پیام‌رسان را انتخاب کنید");
      return;
    }
    window.open(
      getMessengerLink(
        selectedMessenger.key,
        phone,
        getMessage(content),
        selectedMessenger.linkTemplate,
      ),
      "_blank",
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          قالب‌های پیام
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Platform selector */}
        <Select
          value={selectedMessengerId}
          onValueChange={setSelectedMessengerId}
        >
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

        {/* Templates */}
        <div className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{template.title}</span>
                <Badge variant="outline">{template.title}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {template.content}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(template.content)}
                >
                  <Copy className="ml-1 h-3 w-3" />
                  کپی
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSend(template.content)}
                  disabled={!selectedMessengerId}
                >
                  <Send className="ml-1 h-3 w-3" />
                  ارسال
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
