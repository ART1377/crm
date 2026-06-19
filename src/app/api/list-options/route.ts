import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type')
  const where = type ? { type } : {}
  const options = await prisma.listOption.findMany({ where, orderBy: { value: 'asc' } })
  return NextResponse.json(options)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const option = await prisma.listOption.create({ data: body })
  return NextResponse.json(option, { status: 201 })
}