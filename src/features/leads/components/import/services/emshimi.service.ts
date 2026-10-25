// src/features/leads/components/import/services/emshimi.service.ts

import { toEnglishDigits } from '@/lib/sanitize';
import * as cheerio from 'cheerio';
import { Agent } from 'undici';
import type { BaladPlace } from '../types';

const BASE_URL = 'https://emshimi.ir';
const LIST_PATH = '/%D9%84%DB%8C%D8%B3%D8%AA-%D8%A7%D8%B9%D8%B6%D8%A7/';
const SEARCH_CONCURRENCY = 3;

// ✅ Agent با غیرفعال کردن بررسی SSL (چون گواهی سایت منقضی شده)
const insecureAgent = new Agent({
  connect: {
    rejectUnauthorized: false,
  },
});

function headers() {
  return {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-language': 'fa-IR,fa;q=0.9,en;q=0.8',
    'user-agent':
      'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/150.0.0.0 Mobile Safari/537.36',
    referer: 'https://emshimi.ir/',
  };
}

// ✅ fetch امن با agent
async function safeFetch(url: string): Promise<Response> {
  return fetch(url, {
    headers: headers(),
    // @ts-expect-error - undici dispatcher is not in standard fetch types
    dispatcher: insecureAgent,
  });
}

// ✅ استخراج اطلاعات با cheerio
function parseCards(html: string): BaladPlace[] {
  const $ = cheerio.load(html);
  const results: BaladPlace[] = [];

  $('.card').each((_, element) => {
    const $card = $(element);

    const personName = $card.find('h3').first().text().trim();

    let businessName = '';
    let rawPhone = '';
    let address = '';

    $card.find('p').each((_, p) => {
      const text = $(p).text().trim();

      if (text.includes('عنوان واحد صنفي:')) {
        businessName = text.replace('عنوان واحد صنفي:', '').trim();
      } else if (text.includes('تلفن:')) {
        rawPhone = text.replace('تلفن:', '').trim();
      } else if (text.includes('آدرس:')) {
        address = text.replace('آدرس:', '').trim();
      }
    });

    const phone = toEnglishDigits(rawPhone).replace(/[^0-9-]/g, '');

    if (!businessName || !phone || phone.replace(/-/g, '').length < 7) return;

    results.push({
      id: crypto.randomUUID(),
      businessName,
      phoneNumber: phone,
      address,
      category: '',
      website: '',
      rating: null,
      ratingCount: null,
      isExisting: false,
      matchedKeyword: personName,
      searchedIndustry: 'شیمیایی',
    });
  });

  return results;
}

async function fetchPage(pageNumber: number): Promise<BaladPlace[]> {
  const url = `${BASE_URL}${LIST_PATH}?page_number=${pageNumber}&search=`;

  try {
    const res = await safeFetch(url);
    if (!res.ok) {
      console.error(`Page ${pageNumber} returned ${res.status}`);
      return [];
    }
    const html = await res.text();
    return parseCards(html);
  } catch (error) {
    console.error(`Error fetching page ${pageNumber}:`, error);
    return [];
  }
}

async function getTotalPages(): Promise<number> {
  try {
    const res = await safeFetch(`${BASE_URL}${LIST_PATH}?page_number=1&search=`);
    if (!res.ok) return 1;
    const html = await res.text();

    const $ = cheerio.load(html);
    const pageNumbers: number[] = [];

    $('.pagination a').each((_, element) => {
      const href = $(element).attr('href') || '';
      const match = href.match(/page_number=(\d+)/);
      if (match) {
        pageNumbers.push(parseInt(match[1]));
      }
    });

    return pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1;
  } catch {
    return 1;
  }
}

export async function* searchEmshimiStream(
  maxPages: number = 50
): AsyncGenerator<
  | { type: 'progress'; message: string; current: number; total: number }
  | { type: 'place'; place: BaladPlace }
  | { type: 'done'; total: number }
> {
  yield { type: 'progress', message: 'در حال دریافت لیست صفحات...', current: 0, total: 0 };

  const totalPages = Math.min(await getTotalPages(), maxPages);

  yield {
    type: 'progress',
    message: `${totalPages} صفحه پیدا شد`,
    current: 0,
    total: totalPages,
  };

  const seenPhones = new Set<string>();
  let processedPages = 0;

  for (let i = 1; i <= totalPages; i += SEARCH_CONCURRENCY) {
    const batch: number[] = [];
    for (let j = i; j < i + SEARCH_CONCURRENCY && j <= totalPages; j++) {
      batch.push(j);
    }

    const results = await Promise.allSettled(batch.map((pageNum) => fetchPage(pageNum)));

    for (const result of results) {
      processedPages++;
      if (result.status === 'fulfilled') {
        for (const place of result.value) {
          if (!seenPhones.has(place.phoneNumber)) {
            seenPhones.add(place.phoneNumber);
            yield { type: 'place', place };
          }
        }
      }
    }

    yield {
      type: 'progress',
      message: `صفحه ${processedPages}/${totalPages} - ${seenPhones.size} سرنخ`,
      current: processedPages,
      total: totalPages,
    };
  }

  yield { type: 'done', total: seenPhones.size };
}
