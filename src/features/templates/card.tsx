'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import { useDeleteTemplate } from '@/hooks/use-templates'
import { MESSENGER_TYPES } from '@/lib/constants'
import type { MessageTemplate } from '@/types'

interface TemplateCardProps {
  template: MessageTemplate
}

export function TemplateCard({ template }: TemplateCardProps) {
  const deleteTemplate = useDeleteTemplate()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{template.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge>
              {MESSENGER_TYPES.find(m => m.value === template.type)?.label}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteTemplate.mutate(template.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {template.content}
        </p>
      </CardContent>
    </Card>
  )
}