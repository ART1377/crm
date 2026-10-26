// src/app/api/leads/scrape-avval/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'url required' }, { status: 400 });
  }

  // فقط دامنه avval.ir مجاز باشه (امنیت)
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'avval.ir' && parsed.hostname !== 'www.avval.ir') {
      return NextResponse.json({ error: 'invalid domain' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'fa-IR,fa;q=0.9,en;q=0.8',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream ${res.status}` }, { status: res.status });
    }

    const html = await res.text();
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 });
  }
}
