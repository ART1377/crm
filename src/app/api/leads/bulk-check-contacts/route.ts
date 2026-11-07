// src/app/api/leads/bulk-check-contacts/route.ts

import { NextRequest, NextResponse } from 'next/server';

import { normalizePhoneForMatch } from '@/lib/phone-utils';
import { prisma } from '@/lib/prisma';

interface MatchedLead {
  id: string;
  businessName: string;
  phoneNumber: string;
  contactSaved: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phones, apply = false } = body as {
      phones: string[];
      apply?: boolean;
    };

    if (!Array.isArray(phones) || phones.length === 0) {
      return NextResponse.json({ error: 'لیست شماره خالی است' }, { status: 400 });
    }

    if (phones.length > 10000) {
      return NextResponse.json({ error: 'حداکثر ۱۰۰۰۰ شماره در هر درخواست' }, { status: 400 });
    }

    // نرمال‌سازی و dedupe
    const normalized = new Set<string>();
    for (const p of phones) {
      const n = normalizePhoneForMatch(p);
      if (n) normalized.add(n);
    }

    if (normalized.size === 0) {
      return NextResponse.json({ error: 'هیچ شماره معتبری پیدا نشد' }, { status: 400 });
    }

    // گرفتن همه لیدها (فقط فیلدهای لازم)
    const leads = await prisma.lead.findMany({
      select: {
        id: true,
        businessName: true,
        phoneNumber: true,
        secondaryPhone: true,
        contactSaved: true,
      },
    });

    // تطبیق
    const matched: MatchedLead[] = [];
    for (const lead of leads) {
      const primary = normalizePhoneForMatch(lead.phoneNumber);
      const secondary = lead.secondaryPhone ? normalizePhoneForMatch(lead.secondaryPhone) : null;

      const isMatch =
        (primary && normalized.has(primary)) || (secondary && normalized.has(secondary));

      if (isMatch) {
        matched.push({
          id: lead.id,
          businessName: lead.businessName,
          phoneNumber: lead.phoneNumber,
          contactSaved: lead.contactSaved,
        });
      }
    }

    // آمار
    const alreadySavedCount = matched.filter((m) => m.contactSaved).length;
    const toUpdate = matched.filter((m) => !m.contactSaved);

    // آپدیت (اگر apply=true)
    let newlySavedCount = 0;
    if (apply && toUpdate.length > 0) {
      const result = await prisma.lead.updateMany({
        where: { id: { in: toUpdate.map((m) => m.id) } },
        data: { contactSaved: true },
      });
      newlySavedCount = result.count;
    }

    return NextResponse.json({
      totalPhones: phones.length,
      uniquePhones: normalized.size,
      matchedCount: matched.length,
      alreadySavedCount,
      newlySavedCount,
      applied: apply,
      // پیش‌نمایش ۱۰۰ تای اول
      matchedLeads: matched.slice(0, 100),
    });
  } catch (e) {
    console.error('bulk-check-contacts error:', e);
    return NextResponse.json({ error: 'خطا در بررسی مخاطبین' }, { status: 500 });
  }
}
