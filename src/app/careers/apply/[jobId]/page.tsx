"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

const applicationSchema = z.object({
  githubUsername: z.string().min(1, "GitHub username is required"),
  portfolioUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  coverLetter: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface CustomQuestion {
  id: string;
  question: string;
  type: string;
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  customQuestions: CustomQuestion[];
}

export default function ApplyPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  useEffect(() => {
    params.then(({ jobId: id }) => {
      setJobId(id);
      fetch(`/api/jobs/${id}`)
        .then((res) => res.json())
        .then((data) => setJob(data))
        .catch(() => setJob(null));
    });
  }, [params]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-2">Sign in to Apply</h1>
              <p className="text-muted-foreground mb-6">
                You need to sign in with Discord to submit your application.
              </p>
              <Button onClick={() => signIn("discord")} className="w-full gap-2">
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                </svg>
                Sign in with Discord
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          githubUsername: data.githubUsername,
          portfolioUrl: data.portfolioUrl || null,
          coverLetter: data.coverLetter || null,
          customAnswers,
        }),
      });

      if (res.ok) {
        router.push("/careers/success");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit application");
      }
    } catch {
      alert("Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <Link
            href={`/careers`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="size-4" />
            Back to careers
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Apply for {job.title}
            </h1>
            <p className="mt-2 text-muted-foreground">{job.department}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="githubUsername">GitHub Username *</Label>
              <Input
                id="githubUsername"
                placeholder="octocat"
                {...register("githubUsername")}
              />
              {errors.githubUsername && (
                <p className="text-sm text-destructive">
                  {errors.githubUsername.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolioUrl">Portfolio URL</Label>
              <Input
                id="portfolioUrl"
                placeholder="https://yoursite.com"
                {...register("portfolioUrl")}
              />
              {errors.portfolioUrl && (
                <p className="text-sm text-destructive">
                  {errors.portfolioUrl.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <Textarea
                id="coverLetter"
                placeholder="Tell us about yourself..."
                rows={6}
                {...register("coverLetter")}
              />
            </div>

            {job.customQuestions.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Additional Questions</h3>
                {job.customQuestions.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <Label>{q.question}</Label>
                    <Textarea
                      rows={3}
                      value={customAnswers[q.id] || ""}
                      onChange={(e) =>
                        setCustomAnswers((prev) => ({
                          ...prev,
                          [q.id]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Submit Application
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
