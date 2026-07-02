"use client";

import { useState } from "react";

import { Hash, MessageSquare, PhoneCall, Tag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { DeleteConfirmDialog } from "@/components/shared/delete-dialog";

import { useDeleteActivity, useDeleteAllActivities } from "@/features/leads/hooks/use-activities";

import { formatDate } from "@/lib/utils";

import { Activity } from "../../types/leads-types";

const iconMap = {
  CALL: { Icon: PhoneCall, color: "text-blue-500" },
  MESSAGE: { Icon: MessageSquare, color: "text-green-500" },
  NOTE: { Icon: Hash, color: "text-gray-500" },
  STATUS_CHANGE: { Icon: Tag, color: "text-purple-500" },
};

export function ActivityTimeline({
  activities,
  leadId,
}: {
  activities: Activity[];
  leadId: string;
}) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const deleteActivity = useDeleteActivity(leadId);
  const deleteAllActivities = useDeleteAllActivities(leadId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>تاریخچه فعالیت‌ها</CardTitle>
        {activities.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive bg-destructive/10 hover:bg-destructive/15 hover:text-destructive h-7 gap-1 text-xs"
            onClick={() => setShowDeleteAll(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            حذف همه
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            هنوز فعالیتی ثبت نشده است
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const { Icon, color } = iconMap[activity.type] ?? iconMap.NOTE;
              return (
                <div key={activity.id} className="flex gap-3 border-b pb-4 last:border-0">
                  <div className="mt-1">
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.summary}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                          {formatDate(new Date(activity.createdAt))}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setDeleteTarget(activity.id)}
                        >
                          <Trash2 className="text-destructive h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {activity.detail && (
                      <p className="text-muted-foreground mt-1 text-sm">{activity.detail}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteActivity.mutate(deleteTarget);
            setDeleteTarget(null);
          }
        }}
        title="حذف فعالیت"
        description="آیا از حذف این فعالیت اطمینان دارید؟"
        isPending={deleteActivity.isPending}
      />
      <DeleteConfirmDialog
        open={showDeleteAll}
        onClose={() => setShowDeleteAll(false)}
        onConfirm={() => {
          deleteAllActivities.mutate();
          setShowDeleteAll(false);
        }}
        title="حذف همه فعالیت‌ها"
        description="آیا از حذف تمام فعالیت‌های این سرنخ اطمینان دارید؟"
        isPending={deleteAllActivities.isPending}
      />
    </Card>
  );
}
