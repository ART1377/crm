// src/app/api/leads/[id]/activities/route.ts
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // چک کن lead وجود داره
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: "سرنخ پیدا نشد" }, { status: 404 });
    }

    const activity = await prisma.activity.create({
      data: {
        leadId: id,
        type: body.type,
        summary: body.summary,
        detail: body.detail || null,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads/[id]/activities error:", error);
    return NextResponse.json({ error: "خطا در ثبت فعالیت" }, { status: 400 });
  }
}
