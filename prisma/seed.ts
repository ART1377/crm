// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // ساخت قالب‌های پیام پیش‌فرض
  const templates = [
    {
      title: 'معرفی اولیه',
      content: 'با سلام و احترام\nشرکت حسابداری ما ارائه دهنده خدمات صدور فاکتور رسمی خرید و فروش می‌باشد.\nدر صورت نیاز به راهنمایی بیشتر در خدمتم.',
      type: 'WHATSAPP',
    },
    {
      title: 'پیگیری اول',
      content: 'با سلام\nپیرو تماس قبلی، جهت اطلاع از شرایط همکاری لطفاً پاسخ دهید.\nبا تشکر',
      type: 'WHATSAPP',
    },
    {
      title: 'پیامک رسمی',
      content: 'با سلام\nشرکت حسابداری معتبر، ارائه دهنده خدمات فاکتور رسمی خرید و فروش.\nجهت مشاوره رایگان تماس بگیرید.',
      type: 'SMS',
    },
    {
      title: 'پیام ایتا',
      content: 'سلام و وقت بخیر\nخدمات فاکتور رسمی خرید و فروش ارائه می‌دهیم.\nدر صورت نیاز در خدمتم.',
      type: 'ETA',
    },
  ]

  for (const template of templates) {
    await prisma.messageTemplate.upsert({
      where: { id: template.title },
      update: template,
      create: template,
    })
  }

  console.log('✅ Seed completed: Templates created')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })