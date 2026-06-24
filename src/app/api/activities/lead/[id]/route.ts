import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.activity.deleteMany({ where: { leadId: id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطا در حذف فعالیت‌ها" }, { status: 500 });
  }
}
