// src/app/api/leads/search-balad/route.ts

import { searchBaladStream } from '@/features/leads/components/import/services/balad.service';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const keyword = (req.nextUrl.searchParams.get('keyword') || 'آهن').replace(/\u200C/g, ' ').trim();
  const lat = parseFloat(req.nextUrl.searchParams.get('lat') || '35.6607');
  const lng = parseFloat(req.nextUrl.searchParams.get('lng') || '51.3156');
  const radiusKm = parseFloat(req.nextUrl.searchParams.get('radius') || '2');

  const encoder = new TextEncoder();
  let aborted = false;

  // Get existing phones upfront
  let existingPhones = new Set<string>();
  try {
    const existing = await prisma.lead.findMany({ select: { phoneNumber: true } });
    existing.forEach((l) => existingPhones.add(l.phoneNumber));
  } catch {}

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of searchBaladStream(keyword, lat, lng, radiusKm)) {
          if (aborted) break;

          if (event.type === 'place') {
            event.place.isExisting = existingPhones.has(event.place.phoneNumber);
          }

          controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
        }
      } catch (error) {
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: 'error', message: 'خطا در جستجو' }) + '\n')
        );
      }
      controller.close();
    },
    cancel() {
      aborted = true;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
