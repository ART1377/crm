"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneCall, Calendar } from "lucide-react";
import { activitiesService } from "@/services/activities.service";
import type { ActivityType, Lead } from "@/types";
import toast from "react-hot-toast";
import { LogCallDialog } from "./log-call-dialog";
import { ScheduleTaskDialog } from "./schedule-task-dialog";
import { useCreateActivity } from "@/hooks/use-activities";

interface LeadQuickActionsProps {
  lead: Lead;
  leadId: string;
}

export function LeadQuickActions({ lead, leadId }: LeadQuickActionsProps) {
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);

  const addActivity = useCreateActivity(leadId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>اقدامات سریع</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <LogCallDialog
            open={showCallDialog}
            onOpenChange={setShowCallDialog}
            leadName={lead.businessName}
            onSubmit={(summary, detail) => {
              addActivity.mutate({ type: "CALL", summary, detail });
              setShowCallDialog(false);
            }}
          >
            <Button>
              <PhoneCall className="ml-2 h-4 w-4" />
              ثبت تماس
            </Button>
          </LogCallDialog>

          <ScheduleTaskDialog
            open={showTaskDialog}
            onOpenChange={setShowTaskDialog}
            leadId={leadId}
          >
            <Button variant="outline">
              <Calendar className="ml-2 h-4 w-4" />
              یادآوری پیگیری
            </Button>
          </ScheduleTaskDialog>
        </div>
      </CardContent>
    </Card>
  );
}
