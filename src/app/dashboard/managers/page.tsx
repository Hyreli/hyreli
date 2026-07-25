"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Plus, Trash2 } from "lucide-react";

interface Manager {
  id: string;
  discordId: string;
  addedAt: string;
}

export default function ManagersPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [discordId, setDiscordId] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const role = (session?.user as Record<string, unknown>)?.role as string;

  useEffect(() => {
    if (authStatus === "unauthenticated") router.push("/");
    if (authStatus === "authenticated" && role !== "owner") router.push("/dashboard");
  }, [authStatus, role, router]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/managers");
        if (res.ok && !cancelled) {
          const data = await res.json();
          setManagers(data);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const addManager = async () => {
    if (!discordId.trim()) return;
    setIsAdding(true);
    try {
      const res = await fetch("/api/managers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discordId: discordId.trim() }),
      });
      if (res.ok) {
        toast.success("Manager added successfully");
        setDiscordId("");
        setDialogOpen(false);
        const listRes = await fetch("/api/managers");
        if (listRes.ok) setManagers(await listRes.json());
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add manager");
      }
    } catch {
      toast.error("Failed to add manager");
    } finally {
      setIsAdding(false);
    }
  };

  const removeManager = async (mgrDiscordId: string) => {
    if (!confirm("Remove this manager?")) return;
    try {
      const res = await fetch(`/api/managers?discordId=${mgrDiscordId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Manager removed");
        const listRes = await fetch("/api/managers");
        if (listRes.ok) setManagers(await listRes.json());
      }
    } catch {
      // ignore
    }
  };

  if (authStatus === "loading" || role !== "owner") return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Managers</h1>
          <p className="text-muted-foreground">
            Manage who can access the dashboard.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="gap-1.5" />}>
              <Plus className="size-3.5" />
              Add Manager
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Manager</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the Discord User ID of the person you want to add as a manager.
                They will gain access once they log in to Hyreli.
              </p>
              <div className="space-y-2">
                <Label>Discord User ID</Label>
                <Input
                  placeholder="123456789012345678"
                  value={discordId}
                  onChange={(e) => setDiscordId(e.target.value)}
                />
              </div>
              <Button
                onClick={addManager}
                disabled={isAdding || !discordId.trim()}
                className="w-full"
              >
                {isAdding ? "Adding..." : "Add Manager"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Loading...</div>
      ) : managers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="size-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No managers</h3>
            <p className="text-sm text-muted-foreground">
              Add managers to give them access to the dashboard.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Discord ID</th>
                  <th className="px-4 py-3 text-left font-medium">Added</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {managers.map((manager) => (
                  <tr key={manager.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono text-sm">
                      {manager.discordId}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(manager.addedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeManager(manager.discordId)}
                        >
                          <Trash2 className="size-3.5" />
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
    </div>
  );
}
