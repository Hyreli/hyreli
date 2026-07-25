"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  requirements: z.string().min(1, "Requirements are required"),
  isPublished: z.boolean().default(false),
  isDraft: z.boolean().default(true),
});

interface CustomQuestion {
  id: string;
  question: string;
  type: string;
  required: boolean;
  options: string[];
}

interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements: string;
  isPublished: boolean;
  isDraft: boolean;
  customQuestions: CustomQuestion[];
}

const questionTypes = [
  { value: "text", label: "Short Answer" },
  { value: "textarea", label: "Paragraph" },
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "checkboxes", label: "Checkboxes" },
  { value: "dropdown", label: "Dropdown" },
  { value: "file", label: "File Upload" },
  { value: "date", label: "Date" },
  { value: "email", label: "Email" },
  { value: "url", label: "URL" },
  { value: "number", label: "Number" },
  { value: "phone", label: "Phone Number" },
];

export default function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [jobId, setJobId] = useState<string>("");
  const [job, setJob] = useState<Job | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
  });

  useEffect(() => {
    params.then(({ id }) => {
      setJobId(id);
      fetch(`/api/jobs/${id}`)
        .then((res) => res.json())
        .then((data: Job) => {
          setJob(data);
          setCustomQuestions(data.customQuestions || []);
          reset({
            title: data.title,
            slug: data.slug,
            description: data.description,
            requirements: data.requirements,
            isPublished: data.isPublished,
            isDraft: data.isDraft,
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [params, reset]);

  const addQuestion = () => {
    setCustomQuestions([
      ...customQuestions,
      { id: "", question: "", type: "text", required: false, options: [] },
    ]);
  };

  const removeQuestion = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof CustomQuestion, value: unknown) => {
    const updated = [...customQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setCustomQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...customQuestions];
    updated[questionIndex].options.push("");
    setCustomQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...customQuestions];
    updated[questionIndex].options[optionIndex] = value;
    setCustomQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...customQuestions];
    updated[questionIndex].options = updated[questionIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    setCustomQuestions(updated);
  };

  const needsOptions = (type: string) =>
    ["multiple-choice", "checkboxes", "dropdown"].includes(type);

  const onSubmit = async (data: z.input<typeof jobSchema>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          customQuestions: customQuestions.filter((q) => q.question.trim()),
        }),
      });

      if (res.ok) {
        toast.success("Job updated successfully");
        router.push("/dashboard/jobs");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update job");
      }
    } catch {
      toast.error("Failed to update job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePublished = async (publish: boolean) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublished: publish,
          isDraft: !publish,
        }),
      });

      if (res.ok) {
        setJob((prev) =>
          prev ? { ...prev, isPublished: publish, isDraft: !publish } : prev
        );
        toast.success(publish ? "Job published" : "Applications closed");
      }
    } catch {
      toast.error("Failed to update job");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20 text-muted-foreground">Job not found</div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/jobs">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Edit Job</h1>
          <p className="text-muted-foreground">{job.title}</p>
        </div>
        <div className="flex gap-2">
          {job.isPublished ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => togglePublished(false)}
              disabled={isSubmitting}
            >
              Close Applications
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => togglePublished(true)}
              disabled={isSubmitting}
            >
              Open Applications
            </Button>
          )}
          <a href={`/${job.slug}`} target="_blank">
            <Button variant="outline" size="sm">
              View
            </Button>
          </a>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" {...register("title")} />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" {...register("slug")} />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                rows={6}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements *</Label>
              <Textarea
                id="requirements"
                rows={6}
                {...register("requirements")}
              />
              {errors.requirements && (
                <p className="text-sm text-destructive">
                  {errors.requirements.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Custom Questions</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={addQuestion}
                >
                  <Plus className="size-3.5" />
                  Add Question
                </Button>
              </div>

              {customQuestions.map((q, i) => (
                <div key={q.id || i} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-3">
                      <Input
                        placeholder="Question"
                        value={q.question}
                        onChange={(e) => updateQuestion(i, "question", e.target.value)}
                      />

                      <div className="flex gap-2">
                        <Select
                          value={q.type}
                          onValueChange={(v) => {
                            if (!v) return;
                            updateQuestion(i, "type", v);
                            if (!needsOptions(v)) {
                              updateQuestion(i, "options", []);
                            }
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {questionTypes.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) =>
                              updateQuestion(i, "required", e.target.checked)
                            }
                            className="rounded"
                          />
                          Required
                        </label>
                      </div>

                      {needsOptions(q.type) && (
                        <div className="space-y-2">
                          {q.options.map((opt, j) => (
                            <div key={j} className="flex gap-2">
                              <Input
                                placeholder={`Option ${j + 1}`}
                                value={opt}
                                onChange={(e) => updateOption(i, j, e.target.value)}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => removeOption(i, j)}
                              >
                                <X className="size-3.5" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() => addOption(i)}
                          >
                            <Plus className="size-3" />
                            Add option
                          </Button>
                        </div>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeQuestion(i)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {customQuestions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No questions yet. Click &quot;Add Question&quot; to start.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Link href="/dashboard/jobs">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
