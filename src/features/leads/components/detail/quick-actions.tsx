"use client";

import { useState } from "react";

import { Calendar, PhoneCall } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useCreateActivity } from "@/features/leads/hooks/use-activities";

import { Lead } from "../../types/leads-types";
import { LogCallDialog } from "./log-call-dialog";
import { ScheduleTaskDialog } from "./schedule-task-dialog";

export function LeadQuickActions({ lead, leadId }: { lead: Lead; leadId: string }) {
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
