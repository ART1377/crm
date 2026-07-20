import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Add in prisma/seed.ts before "✅ Seed completed"

  await prisma.listOption.deleteMany();

  const listOptions = [
    // Sources
    { type: 'SOURCE', value: 'ایران سایت' },
    { type: 'SOURCE', value: 'نیاز روز' },
    { type: 'SOURCE', value: 'کتاب اول' },
    { type: 'SOURCE', value: 'اینستاگرام' },
    { type: 'SOURCE', value: 'سایر دایرکتوری‌ها' },
    { type: 'SOURCE', value: 'مستقیم' },
    { type: 'SOURCE', value: 'معرفی دوستان' },
    { type: 'SOURCE', value: 'نمایشگاه' },
    { type: 'SOURCE', value: 'تبلیغات پیامکی' },
    // Industries
    { type: 'INDUSTRY', value: 'آهن آلات' },
    { type: 'INDUSTRY', value: 'فولاد' },
    { type: 'INDUSTRY', value: 'پلیمر' },
    { type: 'INDUSTRY', value: 'پتروشیمی' },
    { type: 'INDUSTRY', value: 'الکترونیک' },
    { type: 'INDUSTRY', value: 'مواد غذایی' },
    { type: 'INDUSTRY', value: 'ساختمانی' },
    { type: 'INDUSTRY', value: 'سیمان' },
    { type: 'INDUSTRY', value: 'کاشی و سرامیک' },
    { type: 'INDUSTRY', value: 'چوب' },
    { type: 'INDUSTRY', value: 'نساجی' },
    { type: 'INDUSTRY', value: 'پوشاک' },
    { type: 'INDUSTRY', value: 'خودرو' },
    { type: 'INDUSTRY', value: 'دارویی' },
    { type: 'INDUSTRY', value: 'شیمیایی' },
    { type: 'INDUSTRY', value: 'بسته‌بندی' },
    { type: 'INDUSTRY', value: 'حمل و نقل' },
    { type: 'INDUSTRY', value: 'بازرگانی' },
    { type: 'INDUSTRY', value: 'کشاورزی' },
    { type: 'INDUSTRY', value: 'لوازم خانگی' },
  ];

  for (const opt of listOptions) {
    await prisma.listOption.create({ data: opt });
  }

  console.log(`✅ ${listOptions.length} list options seeded`);

  // prisma/seed.ts — add before templates
  await prisma.messenger.deleteMany();

  const messengers = [
    {
      name: 'واتساپ',
      key: 'WHATSAPP',
      linkTemplate: 'https://wa.me/{phone}?text={message}',
    },
    {
      name: 'ایتا',
      key: 'ETA',
      linkTemplate: 'https://eitaa.com/share?url={message}',
    },
    {
      name: 'بله',
      key: 'BALE',
      linkTemplate: 'https://ble.ir/share?text={message}',
    },
    {
      name: 'روبیکا',
      key: 'RUBIKA',
      linkTemplate: 'https://rubika.ir/share?text={message}',
    },
    { name: 'پیامک', key: 'SMS', linkTemplate: 'sms:{phone}?body={message}' },
  ];

  for (const m of messengers) {
    await prisma.messenger.create({ data: m });
  }
  // تنظیمات
  const settings = [
    { key: 'senderName', value: 'صادقی' },
    { key: 'senderPhone', value: '09193587737' },
    { key: 'senderCompany', value: 'حسابداری آریا' },
    { key: 'whatsappLink', value: 'https://wa.me/{phone}?text={message}' },
    { key: 'eitaaLink', value: 'https://eitaa.com/share?url={message}' },
    { key: 'baleLink', value: 'https://ble.ir/share?text={message}' },
    { key: 'rubikaLink', value: 'https://rubika.ir/share?text={message}' },
    { key: 'smsLink', value: 'sms:{phone}?body={message}' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('✅ Settings seeded');

  // پاک کردن و ساخت قالب‌های جدید
  await prisma.messageTemplate.deleteMany();

  const templates = [
    {
      title: 'معرفی و کارمزد',
      content: `📢 {senderCompany}

🔹 فاکتور رسمی معتبر با ثبت در سامانه مودیان
🔹 بارنامه رسمی و خدمات چک صیادی
🔹 همکاری با شرکت‌ها و تولیدی‌های معتبر

💰 کارمزد خدمات

🔹 تا ۱۰۰ میلیون: ۳.۵٪ تا ۴٪
🔹 ۱۰۰ میلیون تا ۱ میلیارد: ۲.۵٪ تا ۳.۵٪
🔹 ۱ تا ۵ میلیارد: ۲٪
🔹 ۵ تا ۲۰ میلیارد: ۱.۵٪ تا ۱.۹٪
🔹 بالای ۲۰ میلیارد: ۱.۳٪ تا ۱.۴٪

✅ اسناد مورد قبول سازمان امور مالیاتی

📞 هماهنگی: {senderName}
{senderPhone}`,
    },
    {
      title: 'معرفی (بدون کارمزد)',
      content: `📢 {senderCompany}

🔹 ارائه فاکتور رسمی معتبر با ثبت قطعی در سامانه مودیان
🔹 بارنامه رسمی و قابل استناد
🔹 ثبت، انتقال و پیگیری چک‌های صیادی
🔹 همکاری با شرکت‌ها و تولیدی‌های معتبر

✅ اسناد مورد قبول سازمان امور مالیاتی

📞 هماهنگی: {senderName}
{senderPhone}`,
    },
    {
      title: 'کارمزد (بدون معرفی)',
      content: `💰 کارمزد خدمات

🔹 تا ۱۰۰ میلیون تومان: ۳.۵٪ تا ۴٪
🔹 ۱۰۰ میلیون تا ۱ میلیارد: ۲.۵٪ تا ۳.۵٪
🔹 ۱ تا ۵ میلیارد: ۲٪
🔹 ۵ تا ۲۰ میلیارد: ۱.۵٪ تا ۱.۹٪
🔹 بالای ۲۰ میلیارد: ۱.۳٪ تا ۱.۴٪

📞 هماهنگی: {senderName}
{senderPhone}`,
    },
  ];

  for (const template of templates) {
    await prisma.messageTemplate.create({ data: template });
  }

  console.log('✅ Seed completed');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
