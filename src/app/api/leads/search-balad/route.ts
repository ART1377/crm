// src/app/api/leads/search-balad/route.ts

import { searchBalad } from '@/features/leads/components/import/services/balad.service';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const keyword = (req.nextUrl.searchParams.get('keyword') || 'آهن')
      .replace(/\u200C/g, ' ')
      .trim();
    const lat = parseFloat(req.nextUrl.searchParams.get('lat') || '35.6607');
    const lng = parseFloat(req.nextUrl.searchParams.get('lng') || '51.3156');
    const radiusKm = parseFloat(req.nextUrl.searchParams.get('radius') || '2');

    const places = await searchBalad(keyword, lat, lng, radiusKm);

    const phones = places.map((p) => p.phoneNumber);
    const existing = phones.length
      ? await prisma.lead.findMany({
          where: { phoneNumber: { in: phones } },
          select: { phoneNumber: true },
        })
      : [];
    const existingSet = new Set(existing.map((l) => l.phoneNumber));

    return NextResponse.json({
      places: places.map((p) => ({ ...p, isExisting: existingSet.has(p.phoneNumber) })),
      total: places.length,
    });
  } catch (error) {
    console.error('Balad:', error);
    return NextResponse.json({ error: 'خطا', places: [] });
  }
}
