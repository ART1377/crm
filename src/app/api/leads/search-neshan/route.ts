import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || 'آهن‌آلات';
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius');

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // اگه مختصات داشت، از NearBy استفاده کن
    let searchUrl: string;
    if (lat && lng) {
      searchUrl = `https://neshan.org/maps/@${lat},${lng},15z,0p/places/${lat},${lng}/search/${encodeURIComponent(query)}`;
    } else {
      searchUrl = `https://neshan.org/maps/search/${encodeURIComponent(query)}`;
    }

    await page.goto(searchUrl, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    await page.waitForSelector('.nrFZBE4', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Scroll to load more
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        const container = document.querySelector('.LmsM6Yo');
        if (container) container.scrollTop = container.scrollHeight;
      });
      await page.waitForTimeout(1000);
    }

    // Step 1: Get all place URLs
    const placeUrls = await page.evaluate(() => {
      const urls: string[] = [];
      document.querySelectorAll('.nrFZBE4 .WKMp5zo h2 a').forEach((link) => {
        const href = link.getAttribute('href');
        if (href) urls.push(href);
      });
      return urls;
    });

    // Step 2: Visit each place page to get phone number
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
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(1000);

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

    await browser.close();

    // فیلتر کردن: فقط آیتم‌هایی که شماره تلفن دارن
    const placesWithPhone = places.filter((p) => p.phoneNumber);

    // چک کردن تکراری‌ها در دیتابیس
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
    if (browser) await browser.close();
    return NextResponse.json({ error: 'خطا در جستجوی نشان' }, { status: 500 });
  }
}
