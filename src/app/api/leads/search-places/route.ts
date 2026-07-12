// src/app/api/leads/search-places/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface GooglePlace {
  displayName?: { text?: string };
  nationalPhoneNumber?: string;
  formattedAddress?: string;
  rating?: number;
  websiteUri?: string;
  location?: { latitude: number; longitude: number };
}

interface PlaceResult {
  businessName: string;
  phoneNumber: string;
  address: string;
  rating: number | null;
  website: string;
  location?: { lat: number; lng: number };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const industry = searchParams.get('industry') || 'آهن‌آلات';
  const keywords = searchParams.get('keywords') || industry;
  const latitude = searchParams.get('lat') || '35.6892';
  const longitude = searchParams.get('lng') || '51.3890';
  const radius = searchParams.get('radius') || '5000';
  const count = parseInt(searchParams.get('count') || '15');

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const queryParts = keywords.split(',').map((k) => k.trim());
    const query = queryParts.join(' ');

    const body = {
      textQuery: query,
      languageCode: 'fa',
      maxResultCount: Math.min(count, 20),
      locationBias: {
        circle: {
          center: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
          },
          radius: parseInt(radius),
        },
      },
    };

    const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.displayName,places.nationalPhoneNumber,places.formattedAddress,places.rating,places.location,places.websiteUri',
      },
      body: JSON.stringify(body),
    });

    // بررسی وضعیت پاسخ
    if (!searchRes.ok) {
      const errorText = await searchRes.text();
      console.error('Google Places API Error:', searchRes.status, errorText);

      // خطاهای رایج
      if (searchRes.status === 403) {
        return NextResponse.json(
          {
            error: 'API Key معتبر نیست یا دسترسی به Places API فعال نشده است',
            details:
              'لطفاً API Key را در Google Cloud Console بررسی کنید و Places API را فعال کنید.',
          },
          { status: 403 }
        );
      }

      if (searchRes.status === 404) {
        return NextResponse.json(
          {
            error: 'API endpoint یافت نشد',
            details: 'آدرس API را بررسی کنید.',
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error: `خطای ${searchRes.status} از سرویس گوگل`,
          details: errorText.substring(0, 200),
        },
        { status: searchRes.status }
      );
    }

    // دریافت و parse JSON
    const text = await searchRes.text();

    // بررسی اینکه آیا پاسخ JSON معتبر است
    if (!text.startsWith('{')) {
      console.error('Invalid response (not JSON):', text.substring(0, 200));
      return NextResponse.json(
        {
          error: 'پاسخ نامعتبر از سرویس گوگل',
          details: 'احتمالاً API Key مشکل دارد یا نیاز به تنظیمات اضافی دارد.',
        },
        { status: 500 }
      );
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return NextResponse.json(
        {
          error: 'خطا در پردازش پاسخ گوگل',
          details: 'پاسخ دریافتی معتبر نیست.',
        },
        { status: 500 }
      );
    }

    const places: PlaceResult[] = ((data.places || []) as GooglePlace[]).map((place) => ({
      businessName: place.displayName?.text || 'بدون نام',
      phoneNumber: place.nationalPhoneNumber || '',
      address: place.formattedAddress || '',
      rating: place.rating ?? null,
      website: place.websiteUri || '',
      location: place.location
        ? { lat: place.location.latitude, lng: place.location.longitude }
        : undefined,
    }));

    // فیلتر کردن نتایج بدون نام
    const validPlaces = places.filter((p) => p.businessName !== 'بدون نام');

    // چک کردن تکراری‌ها در دیتابیس
    const existingPhones = await prisma.lead.findMany({
      where: {
        phoneNumber: { in: validPlaces.map((p) => p.phoneNumber).filter(Boolean) },
      },
      select: { phoneNumber: true, businessName: true },
    });

    const existingPhoneSet = new Set(existingPhones.map((l) => l.phoneNumber));

    const placesWithStatus = validPlaces.map((place) => ({
      ...place,
      isExisting: existingPhoneSet.has(place.phoneNumber),
    }));

    return NextResponse.json({
      query: keywords,
      industry,
      total: placesWithStatus.length,
      withPhone: placesWithStatus.filter((p) => p.phoneNumber).length,
      places: placesWithStatus,
    });
  } catch (error) {
    console.error('Places API error:', error);
    return NextResponse.json(
      {
        error: 'خطا در جستجوی گوگل مپ',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
