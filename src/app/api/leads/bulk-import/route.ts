import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

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

    // یکبار همه موجودی‌ها رو بگیریم
    const allPhones = incomingLeads
      .map((l: { phoneNumber: string }) => l.phoneNumber)
      .filter(Boolean);
    const allNames = incomingLeads
      .map((l: { businessName: string }) => l.businessName)
      .filter(Boolean);

    const existingLeads = await prisma.lead.findMany({
      where: {
        OR: [{ phoneNumber: { in: allPhones } }, { businessName: { in: allNames } }],
      },
      select: { phoneNumber: true, businessName: true },
    });

    const existingPhones = new Set(existingLeads.map((l) => l.phoneNumber));
    const existingNames = new Set(existingLeads.map((l) => l.businessName));

    // چک تکراری داخل خود لیست import
    const seenPhones = new Set<string>();
    const seenNames = new Set<string>();

    for (const lead of incomingLeads) {
      try {
        // اعتبارسنجی اولیه
        if (!lead.businessName || !lead.phoneNumber) {
          results.skipped++;
          results.details.push({
            name: lead.businessName || 'بدون نام',
            status: 'skipped',
            reason: 'نام یا شماره تماس خالی است',
          });
          continue;
        }

        // چک تکراری داخل خود لیست
        if (seenPhones.has(lead.phoneNumber)) {
          results.skipped++;
          results.details.push({
            name: lead.businessName,
            status: 'skipped',
            reason: 'تکراری - در همین لیست',
          });
          continue;
        }

        if (seenNames.has(lead.businessName)) {
          results.skipped++;
          results.details.push({
            name: lead.businessName,
            status: 'skipped',
            reason: 'تکراری - در همین لیست',
          });
          continue;
        }

        // چک تکراری در دیتابیس
        if (existingPhones.has(lead.phoneNumber)) {
          results.skipped++;
          results.details.push({
            name: lead.businessName,
            status: 'skipped',
            reason: `تکراری - شماره ${lead.phoneNumber} قبلاً ثبت شده`,
          });
          seenPhones.add(lead.phoneNumber);
          seenNames.add(lead.businessName);
          continue;
        }

        if (existingNames.has(lead.businessName)) {
          results.skipped++;
          results.details.push({
            name: lead.businessName,
            status: 'skipped',
            reason: 'تکراری - این نام قبلاً ثبت شده',
          });
          seenPhones.add(lead.phoneNumber);
          seenNames.add(lead.businessName);
          continue;
        }

        // ذخیره در دیتابیس
        await prisma.lead.create({
          data: {
            businessName: lead.businessName,
            phoneNumber: lead.phoneNumber,
            industry: lead.industry || '',
            source: lead.source || 'نامشخص',
            notes: lead.address
              ? `${lead.address}${lead.rating ? ` | ⭐ ${lead.rating}` : ''}`
              : lead.notes || '',
            status: 'NEW',
          },
        });

        seenPhones.add(lead.phoneNumber);
        seenNames.add(lead.businessName);

        results.imported++;
        results.details.push({
          name: lead.businessName,
          status: 'imported',
        });
      } catch (error) {
        console.error('Import error for lead:', lead.businessName, error);
        results.errors++;
        results.details.push({
          name: lead.businessName || 'نامشخص',
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
