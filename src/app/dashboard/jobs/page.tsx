import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { timeAgo } from "@/lib/utils";
import { Plus, ExternalLink, Pencil, Trash2, Copy } from "lucide-react";

export default async function JobsPage() {
  const session = await auth();
  if (!session) redirect("/");

  let jobs: Array<{
    id: string;
    title: string;
    slug: string;
    department: string;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: { applications: number };
  }> = [];

  try {
    jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true } } },
    });
  } catch {
    // Database may not be configured
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Openings</h1>
          <p className="text-muted-foreground">Manage your open positions.</p>
        </div>
        <div className="flex gap-2">
          <a href="/careers" target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="size-3.5" />
              View Page
            </Button>
          </a>
          <Link href="/dashboard/jobs/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              New Job
            </Button>
          </Link>
        </div>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <BriefcaseIcon className="size-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No jobs yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first job opening to start receiving applications.
            </p>
            <Link href="/dashboard/jobs/new">
              <Button className="gap-1.5">
                <Plus className="size-3.5" />
                Create Job
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Title</th>
                  <th className="px-4 py-3 text-left font-medium">Department</th>
                  <th className="px-4 py-3 text-left font-medium">Applications</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Updated</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
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
                      {job.department}
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
                      {timeAgo(job.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/jobs/${job.id}/edit`}>
                          <Button variant="ghost" size="icon-xs">
                            <Pencil className="size-3.5" />
                          </Button>
                        </Link>
                        <form
                          action={async (formData: FormData) => {
                            "use server";
                            const jobId = formData.get("jobId") as string;
                            if (!jobId) return;
                            try {
                              const foundJob = await prisma.job.findUnique({
                                where: { id: jobId },
                              });
                              if (foundJob) {
                                await prisma.job.create({
                                  data: {
                                    title: `${foundJob.title} (Copy)`,
                                    slug: `${foundJob.slug}-copy-${Date.now()}`,
                                    department: foundJob.department,
                                    description: foundJob.description,
                                    requirements: foundJob.requirements,
                                    responsibilities: foundJob.responsibilities,
                                    tags: foundJob.tags,
                                    location: foundJob.location,
                                    isPublished: false,
                                    isDraft: true,
                                  },
                                });
                              }
                            } catch {
                              // ignore
                            }
                          }}
                        >
                          <input type="hidden" name="jobId" value={job.id} />
                          <Button variant="ghost" size="icon-xs" type="submit">
                            <Copy className="size-3.5" />
                          </Button>
                        </form>
                        <form
                          action={async (formData: FormData) => {
                            "use server";
                            const jobId = formData.get("jobId") as string;
                            if (!jobId) return;
                            try {
                              await prisma.job.delete({ where: { id: jobId } });
                            } catch {
                              // ignore
                            }
                          }}
                        >
                          <input type="hidden" name="jobId" value={job.id} />
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            type="submit"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}
