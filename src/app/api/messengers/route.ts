import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET() {
  const messengers = await prisma.messenger.findMany({
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(messengers);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const messenger = await prisma.messenger.create({ data: body });
  return NextResponse.json(messenger, { status: 201 });
}
