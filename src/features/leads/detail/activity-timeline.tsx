"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneCall, MessageSquare, Hash, Tag, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/config/axios";
import { formatDate } from "@/lib/utils";
import type { Activity } from "@/types";
import toast from "react-hot-toast";
import { DeleteConfirmDialog } from "@/components/shared/delete-dialog";
import { useState } from "react";

interface ActivityTimelineProps {
  activities: Activity[];
  leadId: string;
}

const iconMap = {
  CALL: { Icon: PhoneCall, color: "text-blue-500" },
  MESSAGE: { Icon: MessageSquare, color: "text-green-500" },
  NOTE: { Icon: Hash, color: "text-gray-500" },
  STATUS_CHANGE: { Icon: Tag, color: "text-purple-500" },
};

export function ActivityTimeline({
  activities,
  leadId,
}: ActivityTimelineProps) {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const deleteActivity = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/activities/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", leadId] });
      toast.success("فعالیت حذف شد");
    },
  });

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
              const { Icon, color } = iconMap[activity.type] ?? iconMap.NOTE;
              return (
                <div
                  key={activity.id}
                  className="flex gap-3 pb-4 border-b last:border-0"
                >
                  <div className="mt-1">
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.summary}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(new Date(activity.createdAt))}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setDeleteTarget(activity.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {activity.detail && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.detail}
                      </p>
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
    </Card>
  );
}
