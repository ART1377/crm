//src/app/api/leads/import/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { places } = await req.json();

    if (!Array.isArray(places)) {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
    }

    const phones = places.map((p) => p.phoneNumber).filter(Boolean);

    const names = places.map((p) => p.businessName).filter(Boolean);

    const existing = await prisma.lead.findMany({
      where: {
        OR: [{ phoneNumber: { in: phones } }, { businessName: { in: names } }],
      },
      select: {
        phoneNumber: true,
        businessName: true,
      },
    });

    const existingPhones = new Set(existing.map((x) => x.phoneNumber));
    const existingNames = new Set(existing.map((x) => x.businessName));

    let imported = 0;
    let skipped = 0;

    for (const place of places) {
      if (existingPhones.has(place.phoneNumber) || existingNames.has(place.businessName)) {
        skipped++;
        continue;
      }

      await prisma.lead.create({
        data: {
          businessName: place.businessName,
          phoneNumber: place.phoneNumber,
          source: 'بلد',
          industry: place.category ?? '',
          notes: place.address ?? '',
          status: 'NEW',
        },
      });

      imported++;
    }

    return NextResponse.json({
      imported,
      skipped,
    });
  } catch (e) {
    console.error(e);

    return NextResponse.json(
      {
        message: 'Import failed',
      },
      {
        status: 500,
      }
    );
  }
}
