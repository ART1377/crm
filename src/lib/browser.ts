import puppeteer, { Browser } from 'puppeteer-core';

let browserPromise: Promise<Browser> | null = null;

export async function getBrowser(): Promise<Browser> {
  if (browserPromise) {
    return browserPromise;
  }

  const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

  if (isProduction) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chromium: any = await import('@sparticuz/chromium');

    browserPromise = puppeteer.launch({
      args: chromium.args || [],
      defaultViewport: chromium.defaultViewport || { width: 1280, height: 720 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless ?? true,
    });
  } else {
    // Development - use local Chrome or Chromium
    const fs = await import('fs');

    const macPath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    const linuxPath = '/usr/bin/google-chrome';
    const winPath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

    let executablePath: string | undefined;

    if (fs.existsSync(macPath)) {
      executablePath = macPath;
    } else if (fs.existsSync(linuxPath)) {
      executablePath = linuxPath;
    } else if (fs.existsSync(winPath)) {
      executablePath = winPath;
    }

    browserPromise = puppeteer.launch({
      headless: true,
      executablePath,
      channel: executablePath ? undefined : 'chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  return browserPromise;
}
