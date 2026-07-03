// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET() {
  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  settings.forEach((s) => (map[s.key] = s.value));
  return NextResponse.json(map);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  for (const [key, value] of Object.entries(body)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: value as string },
      create: { key, value: value as string },
    });
  }
  return NextResponse.json({ success: true });
}
