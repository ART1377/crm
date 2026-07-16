import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { leads } = await req.json();
    if (!leads?.length) return NextResponse.json({ imported: 0, skipped: 0 });

    const phones = leads.map((l: any) => l.phoneNumber).filter(Boolean);
    const names = leads.map((l: any) => l.businessName).filter(Boolean);

    const existing = await prisma.lead.findMany({
      where: { OR: [{ phoneNumber: { in: phones } }, { businessName: { in: names } }] },
      select: { phoneNumber: true, businessName: true },
    });

    const existingPhones = new Set(existing.map((l) => l.phoneNumber));
    const existingNames = new Set(existing.map((l) => l.businessName));
    const seenPhones = new Set<string>();
    const data: any[] = [];
    let skipped = 0;

    for (const lead of leads) {
      if (!lead.phoneNumber || !lead.businessName) {
        skipped++;
        continue;
      }
      if (existingPhones.has(lead.phoneNumber) || existingNames.has(lead.businessName)) {
        skipped++;
        continue;
      }
      if (seenPhones.has(lead.phoneNumber)) {
        skipped++;
        continue;
      }
      seenPhones.add(lead.phoneNumber);

      data.push({
        businessName: lead.businessName,
        phoneNumber: lead.phoneNumber,
        industry: lead.industry || lead.category || '',
        source: lead.source || 'بلد',
        status: 'NEW',
        notes: [
          lead.address,
          lead.category,
          lead.website,
          lead.rating ? `⭐ ${lead.rating}` : undefined,
        ]
          .filter(Boolean)
          .join(' | '),
      });
    }

    if (data.length) await prisma.lead.createMany({ data, skipDuplicates: true });

    return NextResponse.json({ imported: data.length, skipped });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}
