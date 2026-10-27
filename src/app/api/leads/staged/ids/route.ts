// src/app/api/leads/staged/ids/route.ts

import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const where: Prisma.StagedLeadWhereInput = { status: 'PENDING' };

    const search = searchParams.get('search');
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const source = searchParams.get('source');
    if (source) {
      const list = source.split(',').filter(Boolean);
      where.source = list.length === 1 ? list[0] : { in: list };
    }

    const industry = searchParams.get('industry');
    if (industry) {
      const list = industry.split(',').filter(Boolean);
      where.industry = list.length === 1 ? list[0] : { in: list };
    }

    const rows = await prisma.stagedLead.findMany({
      where,
      select: { id: true },
    });

    return NextResponse.json({ ids: rows.map((r) => r.id) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}
