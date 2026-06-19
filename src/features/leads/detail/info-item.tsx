import { type LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface InfoItemProps {
  icon: LucideIcon
  label: string
  value: string
  dir?: 'rtl' | 'ltr'
  href?: string
}

export function InfoItem({ icon: Icon, label, value, dir = 'rtl', href }: InfoItemProps) {
  const content = (
    <>
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium ${href ? 'text-primary hover:underline cursor-pointer' : ''}`} dir={dir}>
          {value}
        </p>
      </div>
    </>
  )

  if (href) {
    return (
      <Link href={href} className="flex items-center gap-2">
        {content}
      </Link>
    )
  }

  return <div className="flex items-center gap-2">{content}</div>
}