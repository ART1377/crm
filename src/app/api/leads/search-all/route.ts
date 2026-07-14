import { getBrowser } from '@/lib/browser';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// همه صنعت‌ها و کلیدواژه‌هاشون
const ALL_INDUSTRIES: Record<string, string[]> = {
  'آهن\u200Cآلات': ['آهن\u200Cآلات', 'فروش آهن', 'میلگرد', 'ورق آهن', 'پروفیل'],
  فولاد: ['فولاد', 'محصولات فولادی', 'ورق فولاد', 'لوله فولادی'],
  پلیمر: ['پلیمر', 'محصولات پلیمری', 'پلاستیک', 'تزریق پلاستیک'],
  پتروشیمی: ['پتروشیمی', 'محصولات پتروشیمی', 'فرآورده\u200Cهای نفتی'],
  الکترونیک: ['الکترونیک', 'قطعات الکترونیکی', 'لوازم الکترونیک'],
  'مواد غذایی': ['مواد غذایی', 'تولید مواد غذایی', 'بسته\u200Cبندی مواد غذایی'],
  ساختمانی: ['مصالح ساختمانی', 'فروش مصالح', 'تولید مصالح', 'ساختمان'],
  'کاشی و سرامیک': ['کاشی', 'سرامیک', 'فروش کاشی', 'فروش سرامیک'],
  چوب: ['چوب', 'صنایع چوب', 'MDF', 'تولید چوب'],
  شیمیایی: ['شیمیایی', 'مواد شیمیایی', 'صنایع شیمیایی'],
  بازرگانی: ['بازرگانی', 'شرکت بازرگانی', 'واردات', 'صادرات'],
  'لوازم خانگی': ['لوازم خانگی', 'فروش لوازم خانگی', 'تولید لوازم خانگی'],
  ابزارآلات: ['ابزارآلات', 'ابزار صنعتی', 'فروش ابزار'],
  الکتریک: ['الکتریک', 'سیم و کابل', 'تابلو برق', 'تجهیزات الکتریکی'],
  'لوله و اتصالات': ['لوله', 'اتصالات', 'لوله کشی', 'شیرآلات'],
  'تجهیزات صنعتی': ['تجهیزات صنعتی', 'ماشین آلات صنعتی', 'قطعات صنعتی'],
  'آرایشی بهداشتی': ['آرایشی', 'بهداشتی', 'لوازم آرایشی'],
  'کامپیوتر و موبایل': ['کامپیوتر', 'موبایل', 'لپ تاپ', 'گوشی'],
};

async function scrapeNeshan(query: string, browser: any) {
  const page = await browser.newPage();
  try {
    await page.goto(`https://neshan.org/maps/search/${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle2',
      timeout: 20000,
    });

    await page.waitForSelector('.nrFZBE4', { timeout: 10000 }).catch(() => {});
    await wait(1500);

    const placeUrls = await page.evaluate(() => {
      const urls: string[] = [];
      document.querySelectorAll('.nrFZBE4 .WKMp5zo h2 a').forEach((link) => {
        const href = link.getAttribute('href');
        if (href) urls.push(href);
      });
      return urls.slice(0, 5); // هر کلیدواژه فقط ۵ تا
    });

    const places: Array<{
      businessName: string;
      phoneNumber: string;
      address: string;
      category: string;
    }> = [];

    for (const url of placeUrls) {
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
        await wait(800);

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
          return { businessName: name, phoneNumber: phone, address, category };
        });

        if (details.businessName && details.phoneNumber) {
          places.push(details);
        }
      } catch {}
    }

    return places;
  } catch {
    return [];
  } finally {
    await page.close();
  }
}

async function scrapeBalad(query: string, browser: any) {
  const page = await browser.newPage();
  try {
    await page.goto(`https://balad.ir/search/list/iron-shop?q=${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle2',
      timeout: 20000,
    });

    await page.waitForSelector('.BundleItem_item__1nKLl', { timeout: 10000 }).catch(() => {});
    await wait(1500);

    const places = await page.evaluate(() => {
      const items = document.querySelectorAll('.BundleItem_item__1nKLl');
      const results: Array<{
        businessName: string;
        phoneNumber: string;
        address: string;
        category: string;
      }> = [];
      const seen = new Set<string>();

      items.forEach((item) => {
        const nameEl = item.querySelector('.BundleItem_item__name__1DYyY');
        const name = nameEl?.textContent?.trim() || '';
        if (!name || seen.has(name)) return;
        seen.add(name);

        const phoneLink = item.querySelector('a[href^="tel://"]');
        const phone = phoneLink?.getAttribute('href')?.replace('tel://', '') || '';
        const subtitleEl = item.querySelector('.BundleItem_item__subtitle__2a2IA');
        const address = subtitleEl?.textContent?.trim() || '';

        const textsContainer = item.querySelector('.BundleItem_item__texts__2l15O');
        const divs = textsContainer?.querySelectorAll('div');
        let category = '';
        if (divs && divs.length > 1) {
          const catDiv = divs[1];
          if (catDiv && !catDiv.classList.contains('BundleItem_item__subtitle__2a2IA')) {
            category = catDiv.textContent?.trim() || '';
          }
        }

        if (name && phone) {
          results.push({ businessName: name, phoneNumber: phone, address, category });
          if (results.length >= 5) return;
        }
      });

      return results;
    });

    return places;
  } catch {
    return [];
  } finally {
    await page.close();
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const selectedIndustries =
    searchParams.get('industries')?.split(',') || Object.keys(ALL_INDUSTRIES);

  let browser;
  try {
    browser = await getBrowser();

    const allResults: Array<{
      businessName: string;
      phoneNumber: string;
      address: string;
      category: string;
      industry: string;
      keyword: string;
      source: string;
    }> = [];

    const seenPhones = new Set<string>();

    for (const industry of selectedIndustries) {
      const keywords = ALL_INDUSTRIES[industry] || [industry];

      for (const keyword of keywords) {
        // جستجوی نشان
        const neshanResults = await scrapeNeshan(keyword, browser);
        for (const place of neshanResults) {
          if (!seenPhones.has(place.phoneNumber)) {
            seenPhones.add(place.phoneNumber);
            allResults.push({ ...place, industry, keyword, source: 'نشان' });
          }
        }

        // جستجوی بلد
        const baladResults = await scrapeBalad(keyword, browser);
        for (const place of baladResults) {
          if (!seenPhones.has(place.phoneNumber)) {
            seenPhones.add(place.phoneNumber);
            allResults.push({ ...place, industry, keyword, source: 'بلد' });
          }
        }

        await wait(500); // وقفه بین درخواست‌ها
      }
    }

    // چک تکراری با دیتابیس
    const allPhones = allResults.map((r) => r.phoneNumber);
    const existingLeads = await prisma.lead.findMany({
      where: { phoneNumber: { in: allPhones } },
      select: { phoneNumber: true, businessName: true },
    });
    const existingPhoneSet = new Set(existingLeads.map((l) => l.phoneNumber));

    const resultsWithStatus = allResults.map((place) => ({
      ...place,
      isExisting: existingPhoneSet.has(place.phoneNumber),
    }));

    return NextResponse.json({
      total: resultsWithStatus.length,
      newLeads: resultsWithStatus.filter((r) => !r.isExisting).length,
      existing: resultsWithStatus.filter((r) => r.isExisting).length,
      places: resultsWithStatus,
    });
  } catch (error) {
    console.error('Search all error:', error);
    return NextResponse.json({ error: 'خطا در جستجو' }, { status: 500 });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
  }
}
