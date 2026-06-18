import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PhoneCall, MessageSquare, Hash, Tag } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Activity } from '@/types'

interface ActivityTimelineProps {
  activities: Activity[]
}

const iconMap = {
  CALL: { Icon: PhoneCall, color: 'text-blue-500' },
  MESSAGE: { Icon: MessageSquare, color: 'text-green-500' },
  NOTE: { Icon: Hash, color: 'text-gray-500' },
  STATUS_CHANGE: { Icon: Tag, color: 'text-purple-500' },
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>تاریخچه فعالیت‌ها</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            هنوز فعالیتی ثبت نشده است
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const { Icon, color } = iconMap[activity.type] ?? iconMap.NOTE
              return (
                <div key={activity.id} className="flex gap-3 pb-4 border-b last:border-0">
                  <div className="mt-1">
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.summary}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(new Date(activity.createdAt))}
                      </span>
                    </div>
                    {activity.detail && (
                      <p className="text-sm text-muted-foreground mt-1">{activity.detail}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}