// src/app/api/tasks/today/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const tasks = await prisma.task.findMany({
      where: {
        dueDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        lead: {
          select: {
            id: true,
            businessName: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('GET /api/tasks/today error:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت تسک‌ها' },
      { status: 500 }
    )
  }
}