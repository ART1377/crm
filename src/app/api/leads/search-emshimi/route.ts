// src/app/api/leads/search-emshimi/route.ts

import { searchEmshimiStream } from '@/features/leads/components/import/services/emshimi.service';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const maxPages = parseInt(req.nextUrl.searchParams.get('maxPages') || '100');

  const encoder = new TextEncoder();
  let aborted = false;

  let existingPhones = new Set<string>();
  try {
    const existing = await prisma.lead.findMany({ select: { phoneNumber: true } });
    existing.forEach((l) => existingPhones.add(l.phoneNumber));
  } catch {}

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of searchEmshimiStream(maxPages)) {
          if (aborted) break;

          if (event.type === 'place') {
            event.place.isExisting = existingPhones.has(event.place.phoneNumber);
          }

          controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
        }
      } catch (error) {
        console.error('Emshimi stream error:', error);
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: 'error',
              message: 'خطا در جستجو',
            }) + '\n'
          )
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
