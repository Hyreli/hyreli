"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Settings {
  name?: string;
  description?: string;
  website?: string;
  githubRepo?: string;
  discordServer?: string;
  logoUrl?: string;
  primaryColor?: string;
  careersUrl?: string;
  defaultTheme?: string;
}

export default function SettingsPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({});
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "unauthenticated") router.push("/");
  }, [authStatus, router]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok && !cancelled) {
          const data = await res.json();
          setSettings(data);
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        alert("Settings saved!");
      } else {
        alert("Failed to save settings");
      }
    } catch {
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your organization.</p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label>Organization Name</Label>
            <Input
              value={settings.name || ""}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              placeholder="Hyreli"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={settings.description || ""}
              onChange={(e) =>
                setSettings({ ...settings, description: e.target.value })
              }
              placeholder="Tell the world about your organization..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Website</Label>
            <Input
              value={settings.website || ""}
              onChange={(e) =>
                setSettings({ ...settings, website: e.target.value })
              }
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label>GitHub Repository</Label>
            <Input
              value={settings.githubRepo || ""}
              onChange={(e) =>
                setSettings({ ...settings, githubRepo: e.target.value })
              }
              placeholder="https://github.com/org/repo"
            />
          </div>

          <div className="space-y-2">
            <Label>Discord Server</Label>
            <Input
              value={settings.discordServer || ""}
              onChange={(e) =>
                setSettings({ ...settings, discordServer: e.target.value })
              }
              placeholder="https://discord.gg/invite"
            />
          </div>

          <div className="space-y-2">
            <Label>Careers URL</Label>
            <Input
              value={settings.careersUrl || ""}
              onChange={(e) =>
                setSettings({ ...settings, careersUrl: e.target.value })
              }
              placeholder="/careers"
            />
          </div>

          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                className="w-12 h-10 p-1 cursor-pointer"
                value={settings.primaryColor || "#FBA53B"}
                onChange={(e) =>
                  setSettings({ ...settings, primaryColor: e.target.value })
                }
              />
              <Input
                value={settings.primaryColor || "#FBA53B"}
                onChange={(e) =>
                  setSettings({ ...settings, primaryColor: e.target.value })
                }
                placeholder="#FBA53B"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
