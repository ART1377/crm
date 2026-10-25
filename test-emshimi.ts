// test-emshimi.ts
import { Agent } from 'undici';

async function test() {
  const url =
    'https://emshimi.ir/%D9%84%DB%8C%D8%B3%D8%AA-%D8%A7%D8%B9%D8%B6%D8%A7/?page_number=1&search=';

  const res = await fetch(url, {
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'user-agent':
        'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/150.0.0.0 Mobile Safari/537.36',
    },
    // @ts-ignore
    dispatcher: new Agent({ connect: { rejectUnauthorized: false } }),
  });

  console.log('Status:', res.status);
  const html = await res.text();
  console.log('HTML length:', html.length);
  console.log('Has cards:', html.includes('class="card"'));
  console.log('Has pagination:', html.includes('class="pagination"'));
}

test();
