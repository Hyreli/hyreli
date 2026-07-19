"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  department: z.string().min(1, "Department is required"),
  description: z.string().min(1, "Description is required"),
  requirements: z.string().min(1, "Requirements are required"),
  responsibilities: z.string().min(1, "Responsibilities are required"),
  location: z.string().default("remote"),
  isPublished: z.boolean().default(false),
  isDraft: z.boolean().default(true),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewJobPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<z.input<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      location: "remote",
      isPublished: false,
      isDraft: true,
    },
  });

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const onSubmit = async (data: z.input<typeof jobSchema>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          tags,
          customQuestions: customQuestions
            .filter((q) => q.trim())
            .map((q) => ({ question: q })),
        }),
      });

      if (res.ok) {
        router.push("/dashboard/jobs");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create job");
      }
    } catch {
      alert("Failed to create job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const publish = async (data: z.input<typeof jobSchema>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          slug: slugify(data.title),
          tags,
          isPublished: true,
          isDraft: false,
          customQuestions: customQuestions
            .filter((q) => q.trim())
            .map((q) => ({ question: q })),
        }),
      });

      if (res.ok) {
        router.push("/dashboard/jobs");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to publish job");
      }
    } catch {
      alert("Failed to publish job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/jobs">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Job</h1>
          <p className="text-muted-foreground">Add a new job opening.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Software Engineer"
                  {...register("title", {
                    onChange: (e) => {
                      setValue("slug", slugify(e.target.value));
                    },
                  })}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  placeholder="software-engineer"
                  {...register("slug")}
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  placeholder="Engineering"
                  {...register("department")}
                />
                {errors.department && (
                  <p className="text-sm text-destructive">
                    {errors.department.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Select
                  defaultValue="remote"
                  onValueChange={(v) => v && setValue("location", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the role..."
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
                placeholder="List the requirements..."
                rows={6}
                {...register("requirements")}
              />
              {errors.requirements && (
                <p className="text-sm text-destructive">
                  {errors.requirements.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsibilities *</Label>
              <Textarea
                id="responsibilities"
                placeholder="List the responsibilities..."
                rows={6}
                {...register("responsibilities")}
              />
              {errors.responsibilities && (
                <p className="text-sm text-destructive">
                  {errors.responsibilities.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label>Custom Questions</Label>
              {customQuestions.map((q, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder={`Question ${i + 1}`}
                    value={q}
                    onChange={(e) => {
                      const updated = [...customQuestions];
                      updated[i] = e.target.value;
                      setCustomQuestions(updated);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      setCustomQuestions(customQuestions.filter((_, j) => j !== i))
                    }
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 mt-2"
                onClick={() => setCustomQuestions([...customQuestions, ""])}
              >
                <Plus className="size-3.5" />
                Add Question
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Link href="/dashboard/jobs">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button type="submit" variant="outline" disabled={isSubmitting}>
              Save as Draft
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleSubmit(publish)()}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Publish"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
