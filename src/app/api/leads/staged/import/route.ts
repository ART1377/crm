// src/app/api/leads/staged/import/route.ts

import { prisma } from '@/lib/prisma';
import { sanitizePhone, sanitizeText } from '@/lib/sanitize';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json();
    if (!ids?.length) return NextResponse.json({ imported: 0, skipped: 0 });

    const stagedLeads = await prisma.stagedLead.findMany({
      where: { id: { in: ids }, status: 'PENDING' },
    });

    let imported = 0;
    let skipped = 0;

    for (const staged of stagedLeads) {
      try {
        // چک کردن تکراری در Lead اصلی
        const existing = await prisma.lead.findFirst({
          where: { phoneNumber: staged.phoneNumber },
        });

        if (existing) {
          skipped++;
          await prisma.stagedLead.update({
            where: { id: staged.id },
            data: { status: 'IGNORED' },
          });
          continue;
        }

        // ✅ ساخت Lead بدون contactPerson
        await prisma.lead.create({
          data: {
            businessName: staged.businessName,
            // contactPerson: حذف شد
            phoneNumber: sanitizePhone(staged.phoneNumber),
            secondaryPhone: staged.secondaryPhone ? sanitizePhone(staged.secondaryPhone) : null,
            industry: sanitizeText(staged.industry),
            source: staged.source,
            notes: staged.notes || null,
            address: staged.address || null,
            website: staged.website || null,
            rating: staged.rating || null,
            category: staged.category || null,
            status: 'NEW',
          },
        });

        await prisma.stagedLead.update({
          where: { id: staged.id },
          data: { status: 'IMPORTED', importedAt: new Date() },
        });

        imported++;
      } catch (error) {
        console.error(`Error importing staged lead ${staged.id}:`, error);
        skipped++;
      }
    }

    return NextResponse.json({ imported, skipped });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}
