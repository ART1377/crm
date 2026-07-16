import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function generateGridPoints(centerLat: number, centerLng: number, radiusKm: number) {
  const points: Array<{ lat: number; lng: number }> = [];
  const stepKm = 0.5;
  const latStep = stepKm / 111.32;
  const lngStep = stepKm / (111.32 * Math.cos((centerLat * Math.PI) / 180));
  const gridSize = Math.ceil(radiusKm / stepKm) + 1;
  for (let i = -gridSize; i <= gridSize; i++) {
    for (let j = -gridSize; j <= gridSize; j++) {
      const pointLat = centerLat + latStep * i;
      const pointLng = centerLng + lngStep * j;
      const distLat = (pointLat - centerLat) * 111.32;
      const distLng = (pointLng - centerLng) * 111.32 * Math.cos((centerLat * Math.PI) / 180);
      if (Math.sqrt(distLat ** 2 + distLng ** 2) <= radiusKm) {
        points.push({ lat: +pointLat.toFixed(6), lng: +pointLng.toFixed(6) });
      }
    }
  }
  return points;
}

export async function GET(req: NextRequest) {
  const keywordParam = (req.nextUrl.searchParams.get('keyword') || 'آهن')
    .replace(/\u200C/g, ' ')
    .trim();
  const lat = parseFloat(req.nextUrl.searchParams.get('lat') || '35.6607');
  const lng = parseFloat(req.nextUrl.searchParams.get('lng') || '51.3156');
  const radiusKm = parseFloat(req.nextUrl.searchParams.get('radius') || '2');

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const keywords = keywordParam
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    const gridPoints = generateGridPoints(lat, lng, radiusKm);

    console.log(`Neshan: ${keywords.length} keywords × ${gridPoints.length} grid points`);

    const allPlaceUrls = new Set<string>();

    for (const kw of keywords.slice(0, 3)) {
      // Limit to 3 keywords to avoid timeout
      for (const point of gridPoints.slice(0, 5)) {
        // Limit grid points
        try {
          // نشان search URL با مختصات
          const searchUrl = `https://neshan.org/maps/@${point.lat},${point.lng},19z,0p/search/${encodeURIComponent(kw)}`;

          await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 20000 });
          await wait(2000);

          const urls: string[] = await page.evaluate(() => {
            const urls: string[] = [];
            document.querySelectorAll('.nrFZBE4 .WKMp5zo h2 a').forEach((a) => {
              const href = a.getAttribute('href');
              if (href) urls.push(href);
            });
            return urls;
          });

          urls.forEach((u) => allPlaceUrls.add(u));
        } catch {}
      }
    }

    console.log(`Neshan unique URLs: ${allPlaceUrls.size}`);

    const results: any[] = [];
    const seenPhones = new Set<string>();

    for (const url of [...allPlaceUrls].slice(0, 30)) {
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        await wait(1500);

        const details = await page.evaluate(() => {
          const name = document.querySelector('.ZzIY7hD')?.textContent?.trim() || '';
          const phoneEl = document.querySelector('.tSxcP7q .SWIQUYQ img[src*="call"]');
          const phone =
            phoneEl?.closest('.tSxcP7q')?.querySelector('span font')?.textContent?.trim() || '';
          const addrEl = document.querySelector('.tSxcP7q .SWIQUYQ img[src*="pin"]');
          const address =
            addrEl?.closest('.tSxcP7q')?.querySelector('span')?.textContent?.trim() || '';
          const category = document.querySelector('.qpxuHlU')?.textContent?.trim() || '';
          return { name, phone, address, category };
        });

        const phone = details.phone.replace(/[^0-9]/g, '');
        if (details.name && phone.length >= 7 && !seenPhones.has(phone)) {
          seenPhones.add(phone);
          results.push({
            id: crypto.randomUUID(),
            businessName: details.name,
            phoneNumber: phone,
            address: details.address,
            category: details.category,
            isExisting: false,
          });
        }
      } catch {}
    }

    await page.close();
    await browser.close();

    const phones = results.map((r) => r.phoneNumber);
    const existing = phones.length
      ? await prisma.lead.findMany({
          where: { phoneNumber: { in: phones } },
          select: { phoneNumber: true },
        })
      : [];
    const existingSet = new Set(existing.map((l) => l.phoneNumber));

    return NextResponse.json({
      places: results.map((p) => ({ ...p, isExisting: existingSet.has(p.phoneNumber) })),
      total: results.length,
    });
  } catch (error) {
    console.error('Neshan:', error);
    return NextResponse.json({ error: 'خطا', places: [] });
  } finally {
    if (browser)
      try {
        await browser.close();
      } catch {}
  }
}
