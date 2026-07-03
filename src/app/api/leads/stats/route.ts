import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const [total, newLeads, called, followedUp, messaged, contacted, customers] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count({ where: { status: "CALLED" } }),
    prisma.lead.count({ where: { status: "FOLLOW_UP" } }),
    prisma.lead.count({ where: { status: "MESSAGED" } }),
    prisma.lead.count({ where: { status: "CONTACTED" } }),
    prisma.lead.count({ where: { status: "CUSTOMER" } }),
  ]);

  return NextResponse.json({
    total,
    newLeads,
    called,
    followedUp,
    messaged,
    contacted,
    customers,
  });
}