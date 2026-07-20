// src/features/templates/components/card.tsx

'use client';

import { Copy, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { DeleteConfirmDialog } from '@/components/shared/delete-dialog';

import { useSettings } from '@/features/settings/hooks/use-settings';
import { useDeleteTemplate } from '@/features/templates/hooks/use-templates';

import { useCopyToClipboard } from '@/hooks/use-copy';
import { replaceTemplateVars } from '@/lib/utils';

import { MessageTemplate } from '../types/templates-types';
import { CreateTemplateDialog } from './create-dialog';

export function TemplateCard({ template }: { template: MessageTemplate }) {
  const deleteTemplate = useDeleteTemplate();
  const { data: settings = {} } = useSettings();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { copy, copied } = useCopyToClipboard();

  const preview = replaceTemplateVars(template.content, {
    senderName: settings.senderName || 'صادقی',
    senderPhone: settings.senderPhone || '09193587737',
    senderCompany: settings.senderCompany || 'حسابداری آریا',
    companyName: 'شرکت نمونه',
    contactPerson: 'آقای نمونه',
  });

  const handleCopy = () => copy(preview, 'متن قالب کپی شد');

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{template.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
        <p className="text-muted-foreground flex-1 text-sm leading-relaxed whitespace-pre-wrap">
          {preview}
        </p>
        <div className="mt-4 flex items-center gap-2 border-t pt-3">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleCopy}>
            <Copy className="ml-2 h-4 w-4" />
            {copied ? 'کپی شد' : 'کپی قالب'}
          </Button>
          <CreateTemplateDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            template={template}
          >
            <Button variant="ghost" size="icon" onClick={() => setShowEditDialog(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </CreateTemplateDialog>
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
