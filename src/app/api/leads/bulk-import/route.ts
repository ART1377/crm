import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leads: incomingLeads } = body;

    const results = {
      imported: 0,
      skipped: 0,
      errors: 0,
      details: [] as { name: string; status: string; reason?: string }[],
    };

    for (const lead of incomingLeads) {
      try {
        // Check duplicate
        const existing = await prisma.lead.findFirst({
          where: {
            OR: [{ phoneNumber: lead.phoneNumber }, { businessName: lead.businessName }],
          },
        });

        if (existing) {
          results.skipped++;
          results.details.push({
            name: lead.businessName,
            status: 'skipped',
            reason: 'تکراری - قبلاً ثبت شده',
          });
          continue;
        }

        await prisma.lead.create({
          data: {
            businessName: lead.businessName,
            phoneNumber: lead.phoneNumber,
            industry: lead.industry || '',
            source: lead.source || 'گوگل مپ',
            notes: lead.address
              ? `${lead.address}${lead.rating ? ` | ⭐ ${lead.rating}` : ''}`
              : '',
            status: 'NEW',
          },
        });

        results.imported++;
        results.details.push({
          name: lead.businessName,
          status: 'imported',
        });
      } catch {
        results.errors++;
        results.details.push({
          name: lead.businessName,
          status: 'error',
          reason: 'خطا در ذخیره‌سازی',
        });
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ error: 'خطا در وارد کردن سرنخ‌ها' }, { status: 400 });
  }
}
