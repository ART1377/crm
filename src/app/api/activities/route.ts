import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  try {
    const leadId = request.nextUrl.searchParams.get("leadId");
    if (!leadId) {
      return NextResponse.json({ error: "leadId required" }, { status: 400 });
    }
    await prisma.activity.deleteMany({ where: { leadId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطا در حذف فعالیت‌ها" }, { status: 500 });
  }
}
