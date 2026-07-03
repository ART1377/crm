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
    { type: 'INDUSTRY', value: 'آهن‌آلات' },
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

  await prisma.lead.deleteMany();

  const realLeads = [
    {
      businessName: 'آهن آلات فولاد میلگرد امیر',
      phoneNumber: '09131570030',
      status: 'CALLED',
    },
    {
      businessName: 'آهن آلات راغبی',
      phoneNumber: '09113417782',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات حقیقتیان',
      phoneNumber: '09171163825',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات میرمحمدی',
      phoneNumber: '09127147627',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات عرب پور',
      phoneNumber: '09123958084',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات گودرزی',
      phoneNumber: '09166629240',
      secondaryPhone: '09393620091',
      status: 'MESSAGED',
    },
    {
      businessName: 'آهن آلات تسلیمی',
      phoneNumber: '09130000861',
      secondaryPhone: '09131184430',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن صد',
      phoneNumber: '03185100',
      secondaryPhone: '03134094',
      status: 'CALLED',
    },
    {
      businessName: 'آهن نوین پارس',
      phoneNumber: '05191002002',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات امینی',
      phoneNumber: '09129537411',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات میلاد',
      phoneNumber: '09177057718',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات امینی',
      phoneNumber: '09113279972',
      secondaryPhone: '09112004902',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات دپو',
      phoneNumber: '02155511555',
      status: 'CONTACTED',
    },
    {
      businessName: 'پروفیل یادگاری',
      phoneNumber: '09182210400',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات آهن یاب',
      phoneNumber: '03136004000',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات ضامن',
      phoneNumber: '09123231679',
      secondaryPhone: '02155449831',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات پارسیان',
      phoneNumber: '09131170841',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات پاشا',
      phoneNumber: '09155507004',
      secondaryPhone: '09155507003',
      status: 'MESSAGED',
    },
    {
      businessName: 'آهن آلات برمکی',
      phoneNumber: '09141780773',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات فتحعلیان',
      phoneNumber: '09124313426',
      secondaryPhone: '09127542035',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات حیدرلکی',
      phoneNumber: '09126364812',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات فولادوند',
      phoneNumber: '09166643390',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات عزیزی',
      phoneNumber: '09141468948',
      secondaryPhone: '09144650351',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات ایران برش',
      phoneNumber: '09124000228',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات صادقی',
      phoneNumber: '09124800037',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات عطا',
      phoneNumber: '09125790109',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات مسلمان',
      phoneNumber: '09127506858',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات صبا',
      phoneNumber: '09120435855',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات سرو',
      phoneNumber: '05136904567',
      status: 'CONTACTED',
    },
    {
      businessName: 'آهن آلات خدائی',
      phoneNumber: '09127692411',
      secondaryPhone: '09127664428',
      status: 'CONTACTED',
    },
  ];

  for (const lead of realLeads) {
    await prisma.lead.create({
      data: {
        businessName: lead.businessName,
        phoneNumber: lead.phoneNumber,
        secondaryPhone: lead.secondaryPhone || null,
        industry: 'آهن‌آلات',
        source: 'INSTAGRAM',
        status: lead.status,
      },
    });
  }

  console.log(`✅ ${realLeads.length} real leads created`);
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
    { key: 'senderPhone', value: '09191234567' },
    { key: 'senderCompany', value: 'حسابداری کیهان' },
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
      title: 'معرفی خدمات فاکتور',
      purpose: 'INITIAL',
      type: 'WHATSAPP',
      content: `📢 {senderCompany} – هماهنگی: {senderName}

🔹 ارائه فاکتور رسمی معتبر همراه با ثبت قطعی در سامانه مودیان
🔹 همکاری مستقیم با معتبرترین تولیدی‌ها و شرکت‌ها
🔹 بارنامه رسمی و قابل قبول برای حمل کالا
🔹 انجام مراوده مالی از طریق ثبت، انتقال و پیگیری چک‌های صیادی

📌 آنچه دریافت می‌کنید:
✅ اسناد مورد قبول سازمان امور مالیاتی
✅ بدون نگرانی از رد فاکتور یا بارنامه
✅ تمام مراحل چک و نقل‌وانتقال مالی با خیال راحت

📞 هماهنگی با {senderName}: {senderPhone}
{senderCompany} – همراه مطمئن کسب‌وکار شما`,
    },
    {
      title: 'پیگیری',
      purpose: 'FOLLOW_UP',
      type: 'WHATSAPP',
      content: `با سلام و احترام خدمت {contactPerson} عزیز
پیرو تماس قبلی با مجموعه {companyName}، جهت اطلاع از شرایط همکاری لطفاً پاسخ دهید.

📞 هماهنگی با {senderName}: {senderPhone}
با تشکر`,
    },
    {
      title: 'تشکر نهایی',
      purpose: 'CLOSING',
      type: 'WHATSAPP',
      content: `با سلام و احترام
از حسن انتخاب شما سپاسگزاریم.
جهت هماهنگی‌های بعدی با {senderName} در ارتباط باشید: {senderPhone}

موفق و پیروز باشید 🌹`,
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
