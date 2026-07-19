"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Search, ExternalLink, FileText } from "lucide-react";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "REVIEWING", label: "Reviewing" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  REVIEWING: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  INTERVIEW: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  ACCEPTED: "bg-green-500/10 text-green-600 dark:text-green-400",
  REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400",
};

interface Application {
  id: string;
  status: string;
  githubUsername: string | null;
  portfolioUrl: string | null;
  coverLetter: string | null;
  resumeUrl: string | null;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
  job: { id: string; title: string; slug: string };
  answers: Array<{ questionId: string; answer: string }>;
}

export default function ApplicationsPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") router.push("/");
  }, [authStatus, router]);

  useEffect(() => {
    let cancelled = false;
    async function fetchApps() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (search) params.set("search", search);
        const res = await fetch(`/api/applications?${params}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setApplications(data);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchApps();
    return () => { cancelled = true; };
  }, [statusFilter, search]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );
        if (selectedApp?.id === id) {
          setSelectedApp((prev) =>
            prev ? { ...prev, status: newStatus } : prev
          );
        }
      }
    } catch {
      // ignore
    }
  };

  if (authStatus === "loading") return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
        <p className="text-muted-foreground">Review and manage applications.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or GitHub..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Loading...</div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No applications found.
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
                  <th className="px-4 py-3 text-left font-medium">GitHub</th>
                  <th className="px-4 py-3 text-left font-medium">Applied</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
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
                      {app.githubUsername ? (
                        <a
                          href={`https://github.com/${app.githubUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:text-foreground"
                        >
                          {app.githubUsername}
                          <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        "—"
                      )}
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
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setSelectedApp(app)}
                        >
                          <FileText className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog
        open={!!selectedApp}
        onOpenChange={(open) => !open && setSelectedApp(null)}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage src={selectedApp.user.image || undefined} />
                  <AvatarFallback>
                    {selectedApp.user.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedApp.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Applied for {selectedApp.job.title}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">GitHub:</span>{" "}
                  {selectedApp.githubUsername ? (
                    <a
                      href={`https://github.com/${selectedApp.githubUsername}`}
                      target="_blank"
                      className="hover:text-primary"
                    >
                      {selectedApp.githubUsername}
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Portfolio:</span>{" "}
                  {selectedApp.portfolioUrl ? (
                    <a
                      href={selectedApp.portfolioUrl}
                      target="_blank"
                      className="hover:text-primary"
                    >
                      {selectedApp.portfolioUrl}
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Applied:</span>{" "}
                  {formatDate(selectedApp.createdAt)}
                </div>
              </div>

              {selectedApp.coverLetter && (
                <div>
                  <p className="text-sm font-medium mb-2">Cover Letter</p>
                  <div className="rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap">
                    {selectedApp.coverLetter}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.slice(1).map((opt) => (
                    <Button
                      key={opt.value}
                      variant={
                        selectedApp.status === opt.value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => updateStatus(selectedApp.id, opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
