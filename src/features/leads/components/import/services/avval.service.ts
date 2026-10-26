// src/features/leads/components/import/services/avval.service.ts

import type { BaladPlace } from '../types';

const BASE_URL = 'https://avval.ir';
const MAX_PAGES = 2; // فقط ۲ صفحه (بقیه پولی)

export interface AvvalScrapeParams {
  /** اسلاگ مسیر در URL، مثلاً 'میلگرد-صنعتی' یا 'فروش-آهن' */
  slug: string;
  /** نام صنعت/دسته برای ذخیره در دیتابیس، مثلاً 'آهن آلات' */
  industry: string;
}

export interface AvvalScrapeResult {
  places: BaladPlace[];
  total: number;
  pagesScraped: number;
  hasMore: boolean;
}

export async function scrapeAvval({
  slug,
  industry,
}: AvvalScrapeParams): Promise<AvvalScrapeResult> {
  const allPlaces: BaladPlace[] = [];
  const seenIds = new Set<string>();
  let pagesScraped = 0;
  let hasMore = false;

  // اسلاگ رو normalize کن (حذف / اضافی و encode)
  const cleanSlug = slug.trim().replace(/^\/+|\/+$/g, '');
  if (!cleanSlug) {
    throw new Error('اسلاگ دسته الزامی است');
  }

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${BASE_URL}/search/${cleanSlug}?page=${page}`;

    try {
      const res = await fetch(`/api/leads/scrape-avval?url=${encodeURIComponent(url)}`);
      if (!res.ok) {
        console.error(`Failed page ${page}: ${res.status}`);
        break;
      }

      const html = await res.text();
      const places = parseAvvalPage(html, industry);

      if (places.length === 0) break;

      for (const p of places) {
        if (!seenIds.has(p.id)) {
          seenIds.add(p.id);
          allPlaces.push(p);
        }
      }

      pagesScraped++;

      if (page === 2) {
        hasMore = /page=3/.test(html);
      }

      if (page < MAX_PAGES) {
        await new Promise((r) => setTimeout(r, 600));
      }
    } catch (err) {
      console.error(`Error page ${page}:`, err);
      break;
    }
  }

  return { places: allPlaces, total: allPlaces.length, pagesScraped, hasMore };
}

function parseAvvalPage(html: string, industry: string): BaladPlace[] {
  const places: BaladPlace[] = [];
  const marker = '<div class="card job-entity "';
  const chunks = html.split(marker);

  for (let i = 1; i < chunks.length; i++) {
    const cardHtml = marker + chunks[i];

    const getAttr = (name: string): string => {
      const m = cardHtml.match(new RegExp(`data-map-marker-${name}="([^"]*)"`));
      return m ? m[1] : '';
    };

    const title = getAttr('title');
    const activity = getAttr('activity');
    const location = getAttr('location');
    const rating = parseFloat(getAttr('rating') || '0');
    const ratingCount = parseInt(getAttr('rating-count') || '0', 10);
    const phoneRaw = getAttr('phone');
    const smallcode = getAttr('smallcode');

    if (!title || !smallcode) continue;

    let latitude: number | undefined;
    let longitude: number | undefined;
    if (location) {
      const c = location.match(/\[([\d.]+),([\d.]+)\]/);
      if (c) {
        latitude = parseFloat(c[1]);
        longitude = parseFloat(c[2]);
      }
    }

    const phones: string[] = [];
    if (phoneRaw) {
      const cleaned = phoneRaw.replace(/^tel:/i, '').replace(/[^\d+]/g, '');
      if (cleaned) phones.push(cleaned);
    }
    const seqMatch = cardHtml.match(/data-print-adv="phone">[\s\S]*?<\/div>/);
    if (seqMatch) {
      const phoneSpans = seqMatch[0].matchAll(/<span>([^<]+)<\/span>/g);
      for (const ps of phoneSpans) {
        const p = ps[1].replace(/[^\d+]/g, '');
        if (p && !phones.includes(p)) phones.push(p);
      }
    }

    let email: string | undefined;
    const emailMatch = cardHtml.match(/data-print-adv="email">[\s\S]*?<span>([^<]+)<\/span>/);
    if (emailMatch && emailMatch[1].includes('@')) {
      email = emailMatch[1].trim();
    }

    let address: string | undefined;
    const addrMatch = cardHtml.match(
      /class="address print-adv-hidden" data-print-adv="address" title="([^"]*)"/
    );
    if (addrMatch) address = addrMatch[1].trim();

    let keywords: string[] = [];
    const kwMatch = cardHtml.match(/data-print-adv="activity">\s*([^<]+)\s*<\/div>/);
    if (kwMatch) {
      keywords = kwMatch[1]
        .split('،')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    let slogan: string | undefined;
    const sloganMatch = cardHtml.match(
      /class="slogan print-postal-hidden print-adv-hidden">\s*([\s\S]*?)\s*<\/p>/
    );
    if (sloganMatch) {
      slogan = sloganMatch[1]
        .replace(/<[^>]+>/g, '')
        .trim()
        .slice(0, 300);
    }

    places.push({
      id: `avval-${smallcode}`,
      businessName: title,
      phoneNumber: phones[0] || '',
      secondaryPhone: phones[1],
      address,
      category: industry, // ✅ پارامتری
      rating: rating > 0 ? rating : undefined,
      ratingCount: ratingCount > 0 ? ratingCount : undefined,
      latitude,
      longitude,
      searchedIndustry: industry, // ✅ پارامتری
      matchedKeyword: activity || industry, // اطلاعات اصلی avval به‌عنوان کلیدواژه
      source: 'کتاب اول',
      isExisting: false,
      email,
      notes: slogan,
    } as BaladPlace);
  }

  return places;
}
