// src/app/api/leads/staged/route.ts

import { prisma } from '@/lib/prisma';
import { sanitizePhone, sanitizeText } from '@/lib/sanitize';
import { NextRequest, NextResponse } from 'next/server';

// ✅ POST: اضافه کردن به انبار
export async function POST(req: NextRequest) {
  try {
    const { leads } = await req.json();
    if (!leads?.length) return NextResponse.json({ added: 0, skipped: 0 });

    const phones = leads.map((l: any) => sanitizePhone(l.phoneNumber)).filter(Boolean);
    
    // چک کردن تکراری در StagedLead
    const existingStaged = await prisma.stagedLead.findMany({
      where: { phoneNumber: { in: phones } },
      select: { phoneNumber: true },
    });
    const existingStagedPhones = new Set(existingStaged.map((l) => l.phoneNumber));

    // چک کردن تکراری در Lead اصلی
    const existingLeads = await prisma.lead.findMany({
      where: { phoneNumber: { in: phones } },
      select: { phoneNumber: true },
    });
    const existingLeadPhones = new Set(existingLeads.map((l) => l.phoneNumber));

    const seenPhones = new Set<string>();
    const data: any[] = [];
    let skipped = 0;

    for (const lead of leads) {
      const phone = sanitizePhone(lead.phoneNumber);
      if (!phone || !lead.businessName) {
        skipped++;
        continue;
      }
      // تکراری در StagedLead یا Lead اصلی
      if (existingStagedPhones.has(phone) || existingLeadPhones.has(phone)) {
        skipped++;
        continue;
      }
      if (seenPhones.has(phone)) {
        skipped++;
        continue;
      }
      seenPhones.add(phone);

      data.push({
        businessName: lead.businessName,
        phoneNumber: phone,
        secondaryPhone: null,
        industry: sanitizeText(lead.searchedIndustry || lead.industry || ''),
        source: lead.source || 'نامشخص',
        category: lead.category || null,
        address: lead.address || null,
        website: lead.website || null,
        rating: lead.rating ? parseFloat(lead.rating) : null,
        notes: lead.notes || null,
        matchedKeyword: lead.matchedKeyword || null,
        searchedIndustry: lead.searchedIndustry || null,
        status: 'PENDING',
      });
    }

    if (data.length) await prisma.stagedLead.createMany({ data });

    return NextResponse.json({ added: data.length, skipped });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

// ✅ GET: دریافت لیست انبار
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING';
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.stagedLead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.stagedLead.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, hasMore: skip + items.length < total });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}