import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get("published");

    const where: Record<string, unknown> = {};
    if (published === "true") {
      where.isPublished = true;
      where.isDraft = false;
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true } } },
    });

    return NextResponse.json(jobs);
  } catch {
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, description, requirements, isPublished, isDraft, customQuestions } = body;

    if (!title || !slug || !description || !requirements) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.job.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const job = await prisma.job.create({
      data: {
        title,
        slug,
        description,
        requirements,
        isPublished: isPublished || false,
        isDraft: isDraft !== undefined ? isDraft : true,
        customQuestions: customQuestions?.length
          ? {
              create: customQuestions.map((q: { question: string; type: string; required: boolean; options: string[] }) => ({
                question: q.question,
                type: q.type || "text",
              })),
            }
          : undefined,
      },
      include: { customQuestions: true },
    });

    return NextResponse.json(job, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
