import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const settings = await prisma.organization.findFirst();
    return NextResponse.json(settings || {});
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as Record<string, unknown>)?.role as string;
    if (role !== "owner" && role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const existing = await prisma.organization.findFirst();

    if (existing) {
      const settings = await prisma.organization.update({
        where: { id: existing.id },
        data: body,
      });
      return NextResponse.json(settings);
    } else {
      const settings = await prisma.organization.create({
        data: body,
      });
      return NextResponse.json(settings, { status: 201 });
    }
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
