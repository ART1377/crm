import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || 'آهن‌آلات';

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(`https://neshan.org/maps/search/${encodeURIComponent(query)}`, {
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

          // Find phone by looking for the call icon
          const phoneElement = document.querySelector('.tSxcP7q .SWIQUYQ img[src*="call"]');
          const phone =
            phoneElement?.closest('.tSxcP7q')?.querySelector('span font')?.textContent?.trim() ||
            '';

          // Address - first tSxcP7q with pin icon
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

    return NextResponse.json({
      query,
      total: places.length,
      withPhone: places.filter((p) => p.phoneNumber).length,
      places,
    });
  } catch (error) {
    console.error('Neshan scraping error:', error);
    if (browser) await browser.close();
    return NextResponse.json({ error: 'خطا در جستجوی نشان' }, { status: 500 });
  }
}
