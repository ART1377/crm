import { NextRequest, NextResponse } from "next/server";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Prisma.TaskUpdateInput = {};

    if (body.isCompleted !== undefined) {
      updateData.isCompleted = body.isCompleted;
      updateData.completedAt = body.isCompleted ? new Date() : null;
    }
    if (body.title !== undefined) updateData.title = body.title;
    if (body.dueDate !== undefined) updateData.dueDate = new Date(body.dueDate);

    const task = await prisma.task.update({ where: { id }, data: updateData });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "خطا در بروزرسانی تسک" }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطا در حذف تسک" }, { status: 500 });
  }
}
