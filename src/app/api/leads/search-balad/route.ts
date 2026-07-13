import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

interface BaladPlace {
  businessName: string;
  phoneNumber: string;
  address: string;
  category: string;
  website: string;
  rating: number | null;
  ratingCount: number | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || 'آهن‌آلات';
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const maxResults = parseInt(searchParams.get('count') || '20');

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // اگه مختصات داشت، با مختصات جستجو کن
    let searchUrl: string;
    if (lat && lng) {
      // بلد از فرمت center=lng,lat توی path استفاده میکنه
      searchUrl = `https://balad.ir/search/list/iron-shop?q=${encodeURIComponent(query)}#15/${lat}/${lng}`;
    } else {
      searchUrl = `https://balad.ir/search/list/iron-shop?q=${encodeURIComponent(query)}`;
    }

    console.log('Balad search URL:', searchUrl);

    await page.goto(searchUrl, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    await page.waitForSelector('.BundleItem_item__1nKLl', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // Scroll to load more
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        const container = document.querySelector('.SearchContent_listWrapper__2IVln');
        if (container) container.scrollTop = container.scrollHeight;
      });
      await page.waitForTimeout(1500);
    }

    const places: BaladPlace[] = await page.evaluate(() => {
      const items = document.querySelectorAll('.BundleItem_item__1nKLl');
      const results: BaladPlace[] = [];
      const seenNames = new Set<string>();

      items.forEach((item) => {
        const contentEl = item.querySelector('.BundleItem_item__content__3l8hl');
        if (!contentEl) return;

        const nameEl = item.querySelector('.BundleItem_item__name__1DYyY');
        const businessName = nameEl?.textContent?.trim() || '';
        if (!businessName || seenNames.has(businessName)) return;
        seenNames.add(businessName);

        const subtitleEl = item.querySelector('.BundleItem_item__subtitle__2a2IA');
        const address = subtitleEl?.textContent?.trim() || '';

        const textsContainer = item.querySelector('.BundleItem_item__texts__2l15O');
        const categoryDivs = textsContainer?.querySelectorAll('div');
        let category = '';
        if (categoryDivs && categoryDivs.length > 0) {
          // دسته‌بندی معمولاً div دومه
          for (let j = 1; j < Math.min(categoryDivs.length, 3); j++) {
            const div = categoryDivs[j];
            if (
              div &&
              !div.classList.contains('BundleItem_item__subtitle__2a2IA') &&
              !div.classList.contains('BundleItem_ratings__20DWQ') &&
              !div.classList.contains('BundleItem_item__header__aU9uJ')
            ) {
              const text = div.textContent?.trim() || '';
              if (text && text.length < 50) {
                category = text;
                break;
              }
            }
          }
        }

        const phoneLink = item.querySelector('a[href^="tel://"]');
        const phoneNumber = phoneLink?.getAttribute('href')?.replace('tel://', '') || '';

        const webLink = item.querySelector('a[href^="http"]');
        const website = webLink?.getAttribute('href') || '';

        const ratingValueEl = item.querySelector('.RatingDetail_ratingValue__3uM_E');
        const rating = ratingValueEl ? parseFloat(ratingValueEl.textContent?.trim() || '') : null;

        const ratingCountEl = item.querySelector('.RatingDetail_ratingCount__Hl21f');
        const ratingCountText = ratingCountEl?.textContent?.trim() || '';
        const ratingCountMatch = ratingCountText.match(/(\d+)/);
        const ratingCount = ratingCountMatch ? parseInt(ratingCountMatch[1]) : null;

        results.push({
          businessName,
          phoneNumber,
          address,
          category,
          website,
          rating,
          ratingCount,
        });
      });

      return results;
    });

    await browser.close();

    // فیلتر کردن: فقط آیتم‌هایی که شماره تلفن دارن
    const placesWithPhone = places.filter((p) => p.phoneNumber).slice(0, maxResults);

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
    console.error('Balad scraping error:', error);
    if (browser) await browser.close();
    return NextResponse.json({ error: 'خطا در جستجوی بلد' }, { status: 500 });
  }
}
