import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Add in prisma/seed.ts before "✅ Seed completed"

await prisma.listOption.deleteMany();

const listOptions = [
  // Sources
  { type: "SOURCE", value: "ایران سایت" },
  { type: "SOURCE", value: "نیاز روز" },
  { type: "SOURCE", value: "کتاب اول" },
  { type: "SOURCE", value: "اینستاگرام" },
  { type: "SOURCE", value: "سایر دایرکتوری‌ها" },
  { type: "SOURCE", value: "مستقیم" },
  { type: "SOURCE", value: "معرفی دوستان" },
  { type: "SOURCE", value: "نمایشگاه" },
  { type: "SOURCE", value: "تبلیغات پیامکی" },
  // Industries
  { type: "INDUSTRY", value: "آهن‌آلات" },
  { type: "INDUSTRY", value: "فولاد" },
  { type: "INDUSTRY", value: "پلیمر" },
  { type: "INDUSTRY", value: "پتروشیمی" },
  { type: "INDUSTRY", value: "الکترونیک" },
  { type: "INDUSTRY", value: "مواد غذایی" },
  { type: "INDUSTRY", value: "ساختمانی" },
  { type: "INDUSTRY", value: "سیمان" },
  { type: "INDUSTRY", value: "کاشی و سرامیک" },
  { type: "INDUSTRY", value: "چوب" },
  { type: "INDUSTRY", value: "نساجی" },
  { type: "INDUSTRY", value: "پوشاک" },
  { type: "INDUSTRY", value: "خودرو" },
  { type: "INDUSTRY", value: "دارویی" },
  { type: "INDUSTRY", value: "شیمیایی" },
  { type: "INDUSTRY", value: "بسته‌بندی" },
  { type: "INDUSTRY", value: "حمل و نقل" },
  { type: "INDUSTRY", value: "بازرگانی" },
  { type: "INDUSTRY", value: "کشاورزی" },
  { type: "INDUSTRY", value: "لوازم خانگی" },
];

for (const opt of listOptions) {
  await prisma.listOption.create({ data: opt });
}

console.log(`✅ ${listOptions.length} list options seeded`);

  await prisma.lead.deleteMany();
  const sampleLeads = [
    {
      businessName: "آهن‌آلات فلاحی",
      contactPerson: "آقای فلاحی",
      phoneNumber: "09121234567",
      secondaryPhone: "02112345678",
      industry: "آهن‌آلات",
      source: "IRAN_SITE",
      status: "NEW",
      notes: "نیاز به فاکتور رسمی برای بار هفتگی دارد",
    },
    {
      businessName: "پلیمر پاسارگاد",
      contactPerson: "خانم محمدی",
      phoneNumber: "09131234567",
      industry: "پلیمر",
      source: "NIAZ_ROOZ",
      status: "CONTACTED",
    },
    {
      businessName: "الکترونیک سامان",
      contactPerson: "آقای سامانی",
      phoneNumber: "09141234567",
      secondaryPhone: "09141234568",
      industry: "الکترونیک",
      source: "INSTAGRAM",
      status: "FOLLOW_UP",
      notes: "پاسخگو نبود - پیگیری مجدد هفته بعد",
    },
    {
      businessName: "مواد غذایی تبریز",
      contactPerson: null,
      phoneNumber: "09151234567",
      industry: "مواد غذایی",
      source: "KETAB_AVAL",
      status: "NEGOTIATION",
    },
    {
      businessName: "چوب و الوار شمال",
      contactPerson: "مهندس رضایی",
      phoneNumber: "09161234567",
      industry: "چوب",
      source: "DIRECT",
      status: "CUSTOMER",
      notes: "مشتری دائمی - هر ماه فاکتور می‌خواهد",
    },
    {
      businessName: "شرکت ساختمانی مهراز",
      contactPerson: "آقای احمدی",
      phoneNumber: "09171234567",
      secondaryPhone: "02198765432",
      industry: "ساختمانی",
      source: "OTHER_DIRECTORY",
      status: "NOT_INTERESTED",
    },
    {
      businessName: "فولاد مبارکه اصفهان",
      contactPerson: "آقای هاشمی",
      phoneNumber: "09181234567",
      industry: "فولاد",
      source: "IRAN_SITE",
      status: "NEW",
    },
    {
      businessName: "نساجی کاشان",
      contactPerson: null,
      phoneNumber: "09191234567",
      industry: "نساجی",
      source: "NIAZ_ROOZ",
      status: "INVALID",
      notes: "شماره اشتباه - شخص دیگری پاسخ داد",
    },
    {
      businessName: "پتروشیمی خلیج فارس",
      contactPerson: "دکتر امینی",
      phoneNumber: "09201234567",
      secondaryPhone: "09201234568",
      industry: "پتروشیمی",
      source: "DIRECT",
      status: "NEGOTIATION",
      notes: "درخواست نمونه فاکتور داده شد",
    },
    {
      businessName: "بازرگانی تهران",
      contactPerson: "آقای کریمی",
      phoneNumber: "09211234567",
      industry: "بازرگانی",
      source: "INSTAGRAM",
      status: "CONTACTED",
    },
    {
      businessName: "سیمان فارس",
      contactPerson: "مهندس شیرازی",
      phoneNumber: "09221234567",
      industry: "سیمان",
      source: "KETAB_AVAL",
      status: "FOLLOW_UP",
      notes: "پیگیری مجدد سه‌شنبه",
    },
    {
      businessName: "خودروسازی البرز",
      contactPerson: null,
      phoneNumber: "09231234567",
      secondaryPhone: "02612345678",
      industry: "خودرو",
      source: "IRAN_SITE",
      status: "NEW",
    },
    {
      businessName: "کاشی و سرامیک یزد",
      contactPerson: "آقای یزدی",
      phoneNumber: "09241234567",
      industry: "کاشی",
      source: "NIAZ_ROOZ",
      status: "CUSTOMER",
      notes: "هر دو هفته یکبار فاکتور می‌خواهد",
    },
    {
      businessName: "داروسازی تهران",
      contactPerson: "دکتر موسوی",
      phoneNumber: "09251234567",
      secondaryPhone: "02155667788",
      industry: "دارویی",
      source: "OTHER_DIRECTORY",
      status: "NEGOTIATION",
    },
    {
      businessName: "صنایع بسته‌بندی نوین",
      contactPerson: "خانم رضوی",
      phoneNumber: "09261234567",
      industry: "بسته‌بندی",
      source: "DIRECT",
      status: "CONTACTED",
    },
    {
      businessName: "شرکت حمل و نقل پارس",
      contactPerson: "آقای پارسا",
      phoneNumber: "09271234567",
      industry: "حمل و نقل",
      source: "INSTAGRAM",
      status: "NEW",
    },
    {
      businessName: "تولیدی پوشاک نفیس",
      contactPerson: null,
      phoneNumber: "09281234567",
      industry: "پوشاک",
      source: "KETAB_AVAL",
      status: "FOLLOW_UP",
      notes: "صاحب کار در سفر - هفته بعد تماس",
    },
    {
      businessName: "مواد شیمیایی اکسیر",
      contactPerson: "مهندس جعفری",
      phoneNumber: "09291234567",
      secondaryPhone: "09291234568",
      industry: "شیمیایی",
      source: "IRAN_SITE",
      status: "CUSTOMER",
    },
    {
      businessName: "لوازم خانگی الماس",
      contactPerson: "آقای الماسی",
      phoneNumber: "09301234567",
      industry: "لوازم خانگی",
      source: "NIAZ_ROOZ",
      status: "NOT_INTERESTED",
      notes: "قیمت‌ها براش بالا بود",
    },
    {
      businessName: "کشت و صنعت خراسان",
      contactPerson: "دکتر خراسانی",
      phoneNumber: "09311234567",
      secondaryPhone: "05112345678",
      industry: "کشاورزی",
      source: "DIRECT",
      status: "NEGOTIATION",
      notes: "در انتظار تایید نهایی از طرف مدیریت",
    },
  ];

  for (const lead of sampleLeads) {
    await prisma.lead.create({ data: lead });
  }

  console.log("✅ 20 sample leads created");
  // prisma/seed.ts — add before templates
  await prisma.messenger.deleteMany();

  const messengers = [
    {
      name: "واتساپ",
      key: "WHATSAPP",
      linkTemplate: "https://wa.me/{phone}?text={message}",
    },
    {
      name: "ایتا",
      key: "ETA",
      linkTemplate: "https://eitaa.com/share?url={message}",
    },
    {
      name: "بله",
      key: "BALE",
      linkTemplate: "https://ble.ir/share?text={message}",
    },
    {
      name: "روبیکا",
      key: "RUBIKA",
      linkTemplate: "https://rubika.ir/share?text={message}",
    },
    { name: "پیامک", key: "SMS", linkTemplate: "sms:{phone}?body={message}" },
  ];

  for (const m of messengers) {
    await prisma.messenger.create({ data: m });
  }
  // تنظیمات
  const settings = [
    { key: "senderName", value: "صادقی" },
    { key: "senderPhone", value: "09191234567" },
    { key: "senderCompany", value: "حسابداری کیهان" },
    { key: "whatsappLink", value: "https://wa.me/{phone}?text={message}" },
    { key: "eitaaLink", value: "https://eitaa.com/share?url={message}" },
    { key: "baleLink", value: "https://ble.ir/share?text={message}" },
    { key: "rubikaLink", value: "https://rubika.ir/share?text={message}" },
    { key: "smsLink", value: "sms:{phone}?body={message}" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log("✅ Settings seeded");

  // پاک کردن و ساخت قالب‌های جدید
  await prisma.messageTemplate.deleteMany();

  const templates = [
    {
      title: "معرفی خدمات فاکتور",
      purpose: "INITIAL",
      type: "WHATSAPP",
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
      title: "پیگیری",
      purpose: "FOLLOW_UP",
      type: "WHATSAPP",
      content: `با سلام و احترام خدمت {contactPerson} عزیز
پیرو تماس قبلی با مجموعه {companyName}، جهت اطلاع از شرایط همکاری لطفاً پاسخ دهید.

📞 هماهنگی با {senderName}: {senderPhone}
با تشکر`,
    },
    {
      title: "تشکر نهایی",
      purpose: "CLOSING",
      type: "WHATSAPP",
      content: `با سلام و احترام
از حسن انتخاب شما سپاسگزاریم.
جهت هماهنگی‌های بعدی با {senderName} در ارتباط باشید: {senderPhone}

موفق و پیروز باشید 🌹`,
    },
  ];

  for (const template of templates) {
    await prisma.messageTemplate.create({ data: template });
  }

  console.log("✅ Seed completed");
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
