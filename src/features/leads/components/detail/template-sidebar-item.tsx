"use client";

import { Copy, Send } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useCopyToClipboard } from "@/hooks/use-copy";

interface TemplateSidebarItemProps {
  title: string;
  content: string;
  getMessage: (content: string) => string;
  onSend: (content: string) => void;
  canSend: boolean;
}

export function TemplateSidebarItem({
  title,
  content,
  getMessage,
  onSend,
  canSend,
}: TemplateSidebarItemProps) {
  const { copy } = useCopyToClipboard();

  const handleCopy = () => copy(getMessage(content), "متن پیام کپی شد");

  return (
    <div className="bg-muted rounded-lg p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        <Badge variant="outline">{title}</Badge>
      </div>
      <p className="text-muted-foreground mb-2 line-clamp-2 text-xs">{content}</p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={handleCopy}>
          <Copy className="ml-1 h-3 w-3" />
          کپی
        </Button>
        <Button size="sm" onClick={() => onSend(content)} disabled={!canSend}>
          <Send className="ml-1 h-3 w-3" />
          ارسال
        </Button>
      </div>
    </div>
  );
}
