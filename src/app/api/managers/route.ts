import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as Record<string, unknown>)?.role as string;
    if (role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const managers = await prisma.manager.findMany({
      orderBy: { addedAt: "desc" },
    });

    return NextResponse.json(managers);
  } catch {
    return NextResponse.json({ error: "Failed to fetch managers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as Record<string, unknown>)?.role as string;
    if (role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { discordId } = body;

    if (!discordId) {
      return NextResponse.json({ error: "Discord ID is required" }, { status: 400 });
    }

    const existing = await prisma.manager.findUnique({ where: { discordId } });
    if (existing) {
      return NextResponse.json({ error: "Manager already exists" }, { status: 400 });
    }

    const manager = await prisma.manager.create({
      data: { discordId },
    });

    return NextResponse.json(manager, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add manager" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as Record<string, unknown>)?.role as string;
    if (role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const discordId = searchParams.get("discordId");

    if (!discordId) {
      return NextResponse.json({ error: "Discord ID is required" }, { status: 400 });
    }

    await prisma.manager.delete({ where: { discordId } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove manager" }, { status: 500 });
  }
}
