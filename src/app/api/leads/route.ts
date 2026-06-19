// src/app/api/leads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const industry = searchParams.get("industry");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {};

    if (status && status !== "all") where.status = status;
    if (industry) where.industry = industry;
    if (search) {
      where.OR = [
        { businessName: { contains: search } },
        { contactPerson: { contains: search } },
        { phoneNumber: { contains: search } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: {
            select: { activities: true, tasks: true },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      total,
      page,
      hasMore: skip + leads.length < total,
    });
  } catch (error) {
    console.error("GET /api/leads error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت سرنخ‌ها" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const lead = await prisma.lead.create({
      data: {
        businessName: body.businessName,
        contactPerson: body.contactPerson || null,
        phoneNumber: body.phoneNumber,
        secondaryPhone: body.secondaryPhone || null,
        industry: body.industry,
        source: body.source || "DIRECT",
        notes: body.notes || null,
        status: "NEW",
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads error:", error);
    return NextResponse.json({ error: "خطا در ایجاد سرنخ" }, { status: 400 });
  }
}
