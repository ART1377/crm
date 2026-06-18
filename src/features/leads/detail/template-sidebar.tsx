'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Copy, ExternalLink } from 'lucide-react'
import { useTemplates } from '@/hooks/use-templates'
import { MESSENGER_TYPES } from '@/lib/constants'
import { getMessengerLink } from '@/lib/utils'
import toast from 'react-hot-toast'

interface TemplateSidebarProps {
  phone: string
}

export function TemplateSidebar({ phone }: TemplateSidebarProps) {
  const { data: templates = [] } = useTemplates()

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('متن پیام کپی شد')
  }

  const handleOpen = (type: string, message: string) => {
    window.open(getMessengerLink(type, phone, message), '_blank')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          قالب‌های پیام
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {templates.map((template) => (
          <div key={template.id} className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{template.title}</span>
              <Badge variant="outline">
                {MESSENGER_TYPES.find(m => m.value === template.type)?.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{template.content}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleCopy(template.content)}>
                <Copy className="ml-1 h-3 w-3" />کپی
              </Button>
              <Button size="sm" onClick={() => handleOpen(template.type, template.content)}>
                <ExternalLink className="ml-1 h-3 w-3" />ارسال
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}