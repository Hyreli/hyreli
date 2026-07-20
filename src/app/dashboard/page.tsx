import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { timeAgo, formatDate } from "@/lib/utils";
import {
  Briefcase,
  FileText,
  Plus,
  ExternalLink,
  Users,
} from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  REVIEWING: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  INTERVIEW: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  ACCEPTED: "bg-green-500/10 text-green-600 dark:text-green-400",
  REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/");

  const role = (session.user as Record<string, unknown>)?.role as string;

  let jobs: Array<{
    id: string;
    title: string;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: { applications: number };
  }> = [];

  let applications: Array<{
    id: string;
    status: string;
    createdAt: Date;
    user: { name: string | null; image: string | null };
    job: { title: string };
  }> = [];

  try {
    jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { applications: true } } },
    });

    applications = await prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true, image: true } },
        job: { select: { title: true } },
      },
    });
  } catch {
    // Database may not be configured
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user?.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Briefcase className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{jobs.length}</p>
              <p className="text-sm text-muted-foreground">Job Openings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{applications.length}</p>
              <p className="text-sm text-muted-foreground">Applications</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold capitalize">{role}</p>
              <p className="text-sm text-muted-foreground">Your Role</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/jobs/new">
          <Button className="gap-2">
            <Plus className="size-4" />
            Create Job
          </Button>
        </Link>
        <a href="/careers" target="_blank">
          <Button variant="outline" className="gap-2">
            <ExternalLink className="size-4" />
            View Careers Page
          </Button>
        </a>
        {role === "owner" && (
          <Link href="/dashboard/managers">
            <Button variant="outline" className="gap-2">
              <Users className="size-4" />
              Manage Managers
            </Button>
          </Link>
        )}
      </div>

      {/* Recent Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Job Openings</h2>
          <Link href="/dashboard/jobs">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No jobs yet. Create your first job opening.
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Title</th>
                    <th className="px-4 py-3 text-left font-medium">Applications</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/jobs/${job.id}/edit`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {job._count.applications}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={
                            job.isPublished
                              ? "bg-green-500/10 text-green-600 dark:text-green-400"
                              : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                          }
                        >
                          {job.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {timeAgo(job.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recent Applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Applications</h2>
          <Link href="/dashboard/applications">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No applications received yet.
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Applicant</th>
                    <th className="px-4 py-3 text-left font-medium">Job</th>
                    <th className="px-4 py-3 text-left font-medium">Applied</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarImage src={app.user.image || undefined} />
                            <AvatarFallback className="text-xs">
                              {app.user.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span>{app.user.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {app.job.title}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(app.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={statusColors[app.status] || ""}
                        >
                          {app.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
