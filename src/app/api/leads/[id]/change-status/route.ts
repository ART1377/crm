import { NextRequest, NextResponse } from "next/server";

import { LEAD_STATUSES, OVERDUE_DAYS } from "@/constants/constants";

import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, previousStatus } = body;

    const newLabel = LEAD_STATUSES.find((s) => s.value === status)?.label || status;
    const oldLabel = previousStatus
      ? LEAD_STATUSES.find((s) => s.value === previousStatus)?.label || previousStatus
      : null;

    // Update lead status
    await prisma.lead.update({ where: { id }, data: { status } });

    // Log activity
    await prisma.activity.create({
      data: {
        leadId: id,
        type: "STATUS_CHANGE",
        summary: oldLabel
          ? `تغییر وضعیت از "${oldLabel}" به "${newLabel}"`
          : `تغییر وضعیت به "${newLabel}"`,
      },
    });

    // Auto-create follow-up task
    if (status === "CALLED" || status === "MESSAGED") {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + OVERDUE_DAYS);
      await prisma.task.create({
        data: {
          leadId: id,
          title: status === "CALLED" ? "پیگیری تماس" : "پیگیری پیام",
          dueDate,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/leads/[id]/change-status error:", error);
    return NextResponse.json({ error: "خطا در تغییر وضعیت" }, { status: 400 });
  }
}
