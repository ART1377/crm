// src/app/api/leads/search-google/route.ts

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PLACES_API = 'https://places.googleapis.com/v1/places:searchText';

export async function GET(req: NextRequest) {
  try {
    const keyword = (req.nextUrl.searchParams.get('keyword') || 'آهن آلات')
      .replace(/\u200C/g, ' ')
      .trim();
    const lat = parseFloat(req.nextUrl.searchParams.get('lat') || '35.6892');
    const lng = parseFloat(req.nextUrl.searchParams.get('lng') || '51.3890');
    const radiusMeters = parseFloat(req.nextUrl.searchParams.get('radius') || '5000');

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'API key not configured', places: [] });

    const keywords = keyword
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    const allResults: any[] = [];
    const seenPhones = new Set<string>();

    for (const kw of keywords) {
      const res = await fetch(PLACES_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'places.displayName,places.nationalPhoneNumber,places.formattedAddress,places.rating,places.websiteUri,places.location',
        },
        body: JSON.stringify({
          textQuery: kw,
          languageCode: 'fa',
          maxResultCount: 20,
          locationBias: {
            circle: { center: { latitude: lat, longitude: lng }, radius: radiusMeters },
          },
        }),
      });

      if (!res.ok) continue;
      const data = await res.json();

      for (const place of data.places || []) {
        const name = place.displayName?.text || '';
        const phone = (place.nationalPhoneNumber || '').replace(/[^0-9]/g, '');
        if (!name || !phone || phone.length < 7 || seenPhones.has(phone)) continue;
        seenPhones.add(phone);

        allResults.push({
          id: crypto.randomUUID(),
          businessName: name,
          phoneNumber: phone,
          address: place.formattedAddress || '',
          website: place.websiteUri || '',
          rating: place.rating ?? null,
          isExisting: false,
        });
      }
    }

    const phones = allResults.map((r) => r.phoneNumber);
    const existing = phones.length
      ? await prisma.lead.findMany({
          where: { phoneNumber: { in: phones } },
          select: { phoneNumber: true },
        })
      : [];
    const existingSet = new Set(existing.map((l) => l.phoneNumber));

    return NextResponse.json({
      places: allResults.map((p) => ({ ...p, isExisting: existingSet.has(p.phoneNumber) })),
      total: allResults.length,
    });
  } catch (error) {
    console.error('Google:', error);
    return NextResponse.json({ error: 'خطا', places: [] });
  }
}
