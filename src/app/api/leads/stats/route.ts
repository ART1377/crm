import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const [total, newLeads, active, customers] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count({
      where: { status: { in: ["CALLED", "FOLLOW_UP", "MESSAGED"] } },
    }),
    prisma.lead.count({ where: { status: "CUSTOMER" } }),
  ]);

  return NextResponse.json({ total, newLeads, active, customers });
}
