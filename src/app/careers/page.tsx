import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, ArrowRight } from "lucide-react";

async function getJobs() {
  try {
    const jobs = await prisma.job.findMany({
      where: { isPublished: true, isDraft: false },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true } } },
    });
    return jobs;
  } catch {
    return [];
  }
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

const locationLabels: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

export default async function CareersPage() {
  const jobs = await getJobs();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Open Positions
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Join our team and help build the future of hiring.
            </p>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 text-center">
              <p className="text-lg text-muted-foreground">
                No open positions at the moment.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Check back later for new opportunities.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Link key={job.id} href={`/careers/${job.slug}`}>
                  <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-brand/30">
                    <CardContent className="flex items-center justify-between gap-4 p-6">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold group-hover:text-brand transition-colors">
                            {job.title}
                          </h3>
                          <Badge variant="secondary" className="shrink-0">
                            {job.department}
                          </Badge>
                        </div>

                        <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
                          {job.description}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3" />
                            {locationLabels[job.location] || job.location}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" />
                            {timeAgo(job.createdAt)}
                          </span>
                          {job.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ArrowRight className="size-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
