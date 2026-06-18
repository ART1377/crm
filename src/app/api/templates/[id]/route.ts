// src/app/api/templates/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const template = await prisma.messageTemplate.findUnique({ where: { id } });
    if (!template) {
      return NextResponse.json({ error: "قالب پیدا نشد" }, { status: 404 });
    }

    const updated = await prisma.messageTemplate.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
        type: body.type,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/templates/[id] error:", error);
    return NextResponse.json({ error: "خطا در بروزرسانی" }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const template = await prisma.messageTemplate.findUnique({ where: { id } });
    if (!template) {
      return NextResponse.json({ error: "قالب پیدا نشد" }, { status: 404 });
    }

    await prisma.messageTemplate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/templates/[id] error:", error);
    return NextResponse.json({ error: "خطا در حذف" }, { status: 500 });
  }
}
