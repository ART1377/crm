// src/features/leads/components/import/services/balad.service.ts

import type { BaladPlace } from '../types';

const SEARCH_API = 'https://search.raah.ir/v4/submit/';
const DETAIL_API = 'https://poi.raah.ir/web/v4';

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

async function searchTokens(keyword: string, lat: number, lng: number): Promise<string[]> {
  const polygon = polygonFromCenter(lat, lng, 0.5);
  const params = new URLSearchParams({
    text: keyword,
    query: keyword,
    polygon,
    camera: `${lng},${lat}`,
    zoom: '20',
  });
  const res = await fetch(`${SEARCH_API}?${params}`, { headers: headers() });
  if (!res.ok) return [];
  const data = await res.json();
  return data['poi-tokens'] ?? [];
}

async function getPlace(token: string): Promise<BaladPlace | null> {
  const res = await fetch(`${DETAIL_API}/${token}`, { headers: headers() });
  if (!res.ok) return null;
  const place = await res.json();
  let phone = '',
    address = '',
    website = '';
  for (const field of place.fields ?? []) {
    if (field.type === 'link' && field.value?.startsWith('tel://'))
      phone = field.value.replace('tel://', '').replace(/[^0-9]/g, '');
    if (field.type === 'link' && field.value?.startsWith('http')) website = field.value;
    if (field.type === 'text' && !address) address = field.value ?? '';
  }
  if (!phone || phone.length < 7) return null;
  return {
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
}

export async function searchBalad(
  keyword: string,
  lat: number,
  lng: number,
  radiusKm: number
): Promise<BaladPlace[]> {
  const keywords = keyword
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
  const gridPoints = generateGridPoints(lat, lng, radiusKm);
  const allTokens = new Set<string>();

  for (const kw of keywords) {
    for (const point of gridPoints) {
      let tokens: string[] = [];
      for (let r = 0; r < 2; r++) {
        tokens = await searchTokens(kw, point.lat, point.lng);
        if (tokens.length > 0) break;
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      tokens.forEach((t) => allTokens.add(t));
    }
  }

  const results: BaladPlace[] = [];
  const seenPhones = new Set<string>();

  for (const token of allTokens) {
    try {
      const place = await getPlace(token);
      if (place && !seenPhones.has(place.phoneNumber)) {
        seenPhones.add(place.phoneNumber);
        results.push(place);
      }
    } catch {}
  }

  return results;
}
