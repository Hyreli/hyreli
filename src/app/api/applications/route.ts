import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, githubUsername, portfolioUrl, coverLetter, customAnswers } = body;

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || !job.isPublished) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const existing = await prisma.application.findUnique({
      where: { userId_jobId: { userId: session.user.id, jobId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already applied to this position" },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        jobId,
        githubUsername,
        portfolioUrl: portfolioUrl || null,
        coverLetter: coverLetter || null,
        answers: customAnswers
          ? {
              create: Object.entries(customAnswers).map(
                ([questionId, answer]) => ({
                  questionId,
                  answer: answer as string,
                })
              ),
            }
          : undefined,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as Record<string, unknown>)?.role as string;
    if (role !== "owner" && role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const jobId = searchParams.get("jobId");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (jobId) where.jobId = jobId;
    if (search) {
      where.OR = [
        { githubUsername: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
        job: { select: { id: true, title: true, slug: true } },
        answers: { include: { application: false } },
      },
    });

    return NextResponse.json(applications);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const { id, status: newStatus } = body;

    if (!id || !newStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const application = await prisma.application.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json(application);
  } catch {
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}
