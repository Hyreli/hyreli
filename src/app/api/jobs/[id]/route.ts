import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await prisma.job.findUnique({
      where: { id },
      include: { customQuestions: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch {
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, slug, description, requirements, isPublished, isDraft, customQuestions } = body;

    if (slug) {
      const existing = await prisma.job.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
      }
    }

    await prisma.job.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(description && { description }),
        ...(requirements && { requirements }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isDraft !== undefined && { isDraft }),
      },
      include: { customQuestions: true },
    });

    if (customQuestions) {
      await prisma.customQuestion.deleteMany({ where: { jobId: id } });
      if (customQuestions.length > 0) {
        await prisma.customQuestion.createMany({
          data: customQuestions.map((q: { question: string; type?: string }) => ({
            jobId: id,
            question: q.question,
            type: q.type || "text",
          })),
        });
      }
    }

    const updated = await prisma.job.findUnique({
      where: { id },
      include: { customQuestions: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.job.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
