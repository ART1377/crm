import { getBrowser } from '@/lib/browser';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || 'آهن‌آلات';
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  let browser;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();

    let searchUrl: string;
    if (lat && lng) {
      searchUrl = `https://neshan.org/maps/@${lat},${lng},15z,0p/places/${lat},${lng}/search/${encodeURIComponent(query)}`;
    } else {
      searchUrl = `https://neshan.org/maps/search/${encodeURIComponent(query)}`;
    }

    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    await page.waitForSelector('.nrFZBE4', { timeout: 15000 }).catch(() => {});
    await wait(2000);

    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        const container = document.querySelector('.LmsM6Yo');
        if (container) container.scrollTop = container.scrollHeight;
      });
      await wait(1000);
    }

    const placeUrls = await page.evaluate(() => {
      const urls: string[] = [];
      document.querySelectorAll('.nrFZBE4 .WKMp5zo h2 a').forEach((link) => {
        const href = link.getAttribute('href');
        if (href) urls.push(href);
      });
      return urls;
    });

    const places: Array<{
      businessName: string;
      phoneNumber: string;
      address: string;
      category: string;
      rating: number | null;
      ratingCount: number | null;
    }> = [];

    for (const url of placeUrls.slice(0, 20)) {
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
        await wait(1000);

        const details = await page.evaluate(() => {
          const name = document.querySelector('.ZzIY7hD')?.textContent?.trim() || '';
          const phoneElement = document.querySelector('.tSxcP7q .SWIQUYQ img[src*="call"]');
          const phone =
            phoneElement?.closest('.tSxcP7q')?.querySelector('span font')?.textContent?.trim() ||
            '';
          const addressElement = document.querySelector('.tSxcP7q .SWIQUYQ img[src*="pin"]');
          const address =
            addressElement?.closest('.tSxcP7q')?.querySelector('span')?.textContent?.trim() || '';
          const category = document.querySelector('.qpxuHlU')?.textContent?.trim() || '';
          const ratingText = document.querySelector('.PA1daCn')?.textContent?.trim() || '';
          const rating = ratingText ? parseFloat(ratingText.replace(',', '.')) : null;
          const ratingCountText = document.querySelector('.QyMUYla')?.textContent?.trim() || '';
          const ratingCount = ratingCountText ? parseInt(ratingCountText) : null;

          return { businessName: name, phoneNumber: phone, address, category, rating, ratingCount };
        });

        if (details.businessName) {
          places.push(details);
        }
      } catch {
        // Skip failed pages
      }
    }

    await page.close();

    const placesWithPhone = places.filter((p) => p.phoneNumber);

    const existingLeads = await prisma.lead.findMany({
      where: {
        OR: [
          { phoneNumber: { in: placesWithPhone.map((p) => p.phoneNumber).filter(Boolean) } },
          { businessName: { in: placesWithPhone.map((p) => p.businessName) } },
        ],
      },
      select: { phoneNumber: true, businessName: true },
    });

    const existingPhoneSet = new Set(existingLeads.map((l) => l.phoneNumber));
    const existingNameSet = new Set(existingLeads.map((l) => l.businessName));

    const placesWithStatus = placesWithPhone.map((place) => ({
      ...place,
      isExisting:
        existingPhoneSet.has(place.phoneNumber) || existingNameSet.has(place.businessName),
    }));

    return NextResponse.json({
      query,
      total: placesWithStatus.length,
      withPhone: placesWithStatus.filter((p) => p.phoneNumber).length,
      places: placesWithStatus,
    });
  } catch (error) {
    console.error('Neshan scraping error:', error);
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
    return NextResponse.json({ error: 'خطا در جستجوی نشان' }, { status: 500 });
  }
}
