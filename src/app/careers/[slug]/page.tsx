import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Clock } from "lucide-react";

async function getJob(slug: string) {
  try {
    const job = await prisma.job.findUnique({
      where: { slug, isPublished: true, isDraft: false },
      include: { customQuestions: true },
    });
    return job;
  } catch {
    return null;
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

export default async function JobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJob(slug);

  if (!job) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <Link
            href="/careers"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="size-4" />
            Back to careers
          </Link>

          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Badge variant="secondary">{job.department}</Badge>
              <Badge variant="outline">
                {locationLabels[job.location] || job.location}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {job.title}
            </h1>

            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" />
                Posted {timeAgo(job.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {locationLabels[job.location] || job.location}
              </span>
            </div>

            {job.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">About the Role</h2>
              <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {job.description}
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Requirements</h2>
              <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {job.requirements}
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Responsibilities</h2>
              <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {job.responsibilities}
              </div>
            </section>
          </div>

          <div className="mt-8 rounded-xl border bg-card p-6">
            <Link href={`/careers/apply/${job.id}`}>
              <Button size="lg" className="w-full gap-2">
                Apply for this position
              </Button>
            </Link>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              You&apos;ll need to sign in with Discord to apply.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
