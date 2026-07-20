// src/app/api/leads/deduplicate/route.ts

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

function normalizePhone(phone: string): string {
  return phone
    .replace(/[^0-9]/g, '')
    .replace(/^0098/, '0')
    .replace(/^98/, '0')
    .replace(/^\+98/, '0')
    .slice(-10);
}

function normalizeName(name: string): string {
  return name
    .replace(/\u200C/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= a.length; i++) matrix[i] = [i];
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] =
        a[i - 1] === b[j - 1]
          ? matrix[i - 1][j - 1]
          : 1 + Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1]);
    }
  }
  return matrix[a.length][b.length];
}

function nameSimilarity(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 100;
  return Math.round((1 - levenshteinDistance(na, nb) / maxLen) * 100);
}

export async function GET() {
  try {
    const allLeads = await prisma.lead.findMany({
      select: { id: true, businessName: true, phoneNumber: true, industry: true, status: true },
      orderBy: { createdAt: 'desc' },
    });

    const duplicates: Array<{
      lead1: (typeof allLeads)[0];
      lead2: (typeof allLeads)[0];
      similarity: number;
      matchType: 'phone' | 'name' | 'both';
    }> = [];

    const phoneMap = new Map<string, (typeof allLeads)[0]>();

    for (const lead of allLeads) {
      const normalized = normalizePhone(lead.phoneNumber);
      if (!normalized || normalized.length < 7) continue;

      if (phoneMap.has(normalized)) {
        const existing = phoneMap.get(normalized)!;
        duplicates.push({
          lead1: existing,
          lead2: lead,
          similarity: nameSimilarity(lead.businessName, existing.businessName),
          matchType: 'phone',
        });
      } else {
        phoneMap.set(normalized, lead);
      }
    }

    // Update matchType for high name similarity
    for (const dup of duplicates) {
      if (dup.similarity >= 75) dup.matchType = 'both';
    }

    // Name-only duplicates
    for (let i = 0; i < allLeads.length && duplicates.length < 100; i++) {
      for (let j = i + 1; j < allLeads.length && duplicates.length < 100; j++) {
        const a = allLeads[i];
        const b = allLeads[j];
        if (normalizePhone(a.phoneNumber) === normalizePhone(b.phoneNumber)) continue;

        const sim = nameSimilarity(a.businessName, b.businessName);
        if (sim >= 85) {
          duplicates.push({ lead1: a, lead2: b, similarity: sim, matchType: 'name' });
        }
      }
    }

    duplicates.sort((a, b) => b.similarity - a.similarity);

    return NextResponse.json({ duplicates: duplicates.slice(0, 50) });
  } catch (error) {
    console.error('Deduplicate error:', error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}
