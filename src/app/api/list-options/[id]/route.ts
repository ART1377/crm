import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const option = await prisma.listOption.update({ where: { id }, data: body });
  return NextResponse.json(option);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.listOption.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
