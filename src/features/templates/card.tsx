"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Trash2 } from "lucide-react";
import { useDeleteTemplate } from "@/hooks/use-templates";
import type { MessageTemplate } from "@/types";
import toast from "react-hot-toast";
import { useSettings } from "@/hooks/use-settings";
import { replaceTemplateVars } from "@/lib/utils";
import { useState } from "react";
import { DeleteConfirmDialog } from "@/components/shared/delete-dialog";

const PURPOSE_LABELS: Record<string, string> = {
  INITIAL: "معرفی",
  FOLLOW_UP: "پیگیری",
  CLOSING: "تشکر",
  CUSTOM: "سفارشی",
};

export function TemplateCard({ template }: { template: MessageTemplate }) {
  const deleteTemplate = useDeleteTemplate();
  const { data: settings = {} } = useSettings();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleCopy = () => {
    // Copy raw template — users on templates page want the template itself
    navigator.clipboard.writeText(preview);
    toast.success("متن قالب کپی شد");
  };

  // Preview with placeholder values
  const preview = replaceTemplateVars(template.content, {
    senderName: settings.senderName || "صادقی",
    senderPhone: settings.senderPhone || "09191234567",
    senderCompany: settings.senderCompany || "حسابداری کیهان",
    companyName: "شرکت نمونه",
    contactPerson: "آقای نمونه",
  });

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{template.title}</CardTitle>
          <Badge variant="secondary">
            {PURPOSE_LABELS[template.purpose] || template.purpose}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 justify-between flex flex-col">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed flex-1">
          {preview}
        </p>
        <div className="flex items-center gap-2 mt-4 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleCopy}
          >
            <Copy className="ml-2 h-4 w-4" />
            کپی قالب
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          deleteTemplate.mutate(template.id);
          setShowDeleteDialog(false);
        }}
        title="حذف قالب"
        isPending={deleteTemplate.isPending}
      />
    </Card>
  );
}
