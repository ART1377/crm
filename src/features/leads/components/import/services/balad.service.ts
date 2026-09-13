// src/features/leads/components/import/services/balad.service.ts

import { sanitizePhone } from '@/lib/sanitize';
import type { BaladPlace } from '../types';

const SEARCH_API = 'https://search.raah.ir/v4/submit/';
const DETAIL_API = 'https://poi.raah.ir/web/v4';

// ✅ تعداد درخواست همزمان
const SEARCH_CONCURRENCY = 5;
const DETAIL_CONCURRENCY = 10;

// ✅ کش در حافظه
const CACHE_TTL = 5 * 60 * 1000; // 5 دقیقه
const tokensCache = new Map<string, { tokens: string[]; timestamp: number }>();
const placeCache = new Map<string, { place: BaladPlace | null; timestamp: number }>();

function headers() {
  return {
    accept: 'application/json',
    origin: 'https://balad.ir',
    referer: 'https://balad.ir/',
    platform: 'web',
    'device-id': '0ad90fcd-ed5f-455c-88c8-722fea0bed0c',
    'app-session': crypto.randomUUID(),
    'user-agent':
      'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/150.0.0.0 Mobile Safari/537.36',
  };
}

function polygonFromCenter(lat: number, lng: number, radiusKm: number): string {
  const dLat = radiusKm / 111.32;
  const dLng = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  const nw = `${(lng - dLng).toFixed(6)},${(lat + dLat).toFixed(6)}`;
  const ne = `${(lng + dLng).toFixed(6)},${(lat + dLat).toFixed(6)}`;
  const se = `${(lng + dLng).toFixed(6)},${(lat - dLat).toFixed(6)}`;
  const sw = `${(lng - dLng).toFixed(6)},${(lat - dLat).toFixed(6)}`;
  return `${nw}|${ne}|${se}|${sw}|${nw}`;
}

export function generateGridPoints(
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  stepKm: number = 0.2
): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
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

// ✅ جستجو با کش
async function searchTokens(keyword: string, lat: number, lng: number): Promise<string[]> {
  const cacheKey = `${keyword}:${lat.toFixed(4)}:${lng.toFixed(4)}`;
  const cached = tokensCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.tokens;
  }

  const polygon = polygonFromCenter(lat, lng, 0.5);
  const params = new URLSearchParams({
    text: keyword,
    query: keyword,
    polygon,
    camera: `${lng},${lat}`,
    zoom: '20',
  });

  try {
    const res = await fetch(`${SEARCH_API}?${params}`, { headers: headers() });
    if (!res.ok) return [];
    const data = await res.json();
    const tokens = data['poi-tokens'] ?? [];

    tokensCache.set(cacheKey, { tokens, timestamp: Date.now() });
    return tokens;
  } catch {
    return [];
  }
}

// ✅ دریافت جزئیات با کش
async function getPlace(token: string): Promise<BaladPlace | null> {
  const cached = placeCache.get(token);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.place;
  }

  try {
    const res = await fetch(`${DETAIL_API}/${token}`, { headers: headers() });
    if (!res.ok) {
      placeCache.set(token, { place: null, timestamp: Date.now() });
      return null;
    }

    const place = await res.json();
    let phone = '',
      address = '',
      website = '';

    for (const field of place.fields ?? []) {
      if (field.type === 'link' && field.value?.startsWith('tel://'))
        phone = sanitizePhone(field.value.replace('tel://', ''));
      if (field.type === 'link' && field.value?.startsWith('http')) website = field.value;
      if (field.type === 'text' && !address) address = field.value ?? '';
    }

    if (!phone || phone.length < 7) {
      placeCache.set(token, { place: null, timestamp: Date.now() });
      return null;
    }

    const result: BaladPlace = {
      id: crypto.randomUUID(),
      businessName: place.name || '',
      phoneNumber: phone,
      address,
      category: place.category || '',
      website,
      rating: place.rating?.score ?? null,
      ratingCount: place.rating?.count ?? null,
      isExisting: false,
    };

    placeCache.set(token, { place: result, timestamp: Date.now() });
    return result;
  } catch {
    placeCache.set(token, { place: null, timestamp: Date.now() });
    return null;
  }
}

// ✅ پردازش همزمان با محدودیت
async function processConcurrently<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
  onProgress?: (processed: number) => void
): Promise<R[]> {
  const results: R[] = [];
  let processed = 0;

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(batch.map(fn));

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    }

    processed += batch.length;
    onProgress?.(processed);
  }

  return results;
}

export async function* searchBaladStream(
  keyword: string,
  lat: number,
  lng: number,
  radiusKm: number,
  stepKm: number = 0.2
): AsyncGenerator<
  | {
      type: 'progress';
      message: string;
      current: number;
      total: number;
      point?: { lat: number; lng: number };
    }
  | { type: 'place'; place: BaladPlace }
  | { type: 'done'; total: number }
> {
  const keywords = keyword
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  const gridPoints = generateGridPoints(lat, lng, radiusKm, stepKm);
  const totalSearches = keywords.length * gridPoints.length;

  yield { type: 'progress', message: 'در حال جستجو...', current: 0, total: totalSearches };

  const seenPhones = new Set<string>();
  let searchCount = 0;

  // ✅ ساخت همه taskها
  const tasks: Array<{ keyword: string; point: { lat: number; lng: number } }> = [];
  for (const kw of keywords) {
    for (const point of gridPoints) {
      tasks.push({ keyword: kw, point });
    }
  }

  // ✅ پردازش دسته‌ای searchTokens
  for (let i = 0; i < tasks.length; i += SEARCH_CONCURRENCY) {
    const batch = tasks.slice(i, i + SEARCH_CONCURRENCY);

    // اجرای همزمان searchTokens
    const tokenResults = await Promise.allSettled(
      batch.map(async ({ keyword: kw, point }) => {
        const tokens = await searchTokens(kw, point.lat, point.lng);
        return { tokens, point };
      })
    );

    // جمع‌آوری توکن‌ها
    const allTokens: string[] = [];
    let lastPoint: { lat: number; lng: number } | undefined;

    for (const result of tokenResults) {
      searchCount++;
      if (result.status === 'fulfilled') {
        allTokens.push(...result.value.tokens);
        lastPoint = result.value.point;
      }
    }

    // ✅ حذف تکراری‌ها و فیلتر کش‌شده‌ها
    const uniqueTokens = [...new Set(allTokens)].filter((t) => !placeCache.has(t));

    // ✅ دریافت جزئیات POIها به صورت همزمان
    if (uniqueTokens.length > 0) {
      const places = await processConcurrently(uniqueTokens, DETAIL_CONCURRENCY, getPlace);

      for (const place of places) {
        if (place && !seenPhones.has(place.phoneNumber) && place.phoneNumber.length >= 7) {
          seenPhones.add(place.phoneNumber);
          yield { type: 'place', place };
        }
      }
    }

    // گزارش پیشرفت
    yield {
      type: 'progress',
      message: `جستجو: ${searchCount}/${totalSearches} - ${seenPhones.size} سرنخ`,
      current: searchCount,
      total: totalSearches,
      point: lastPoint,
    };
  }

  yield { type: 'done', total: seenPhones.size };
}
