"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useMounted } from "@/hooks/use-mounted";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  Settings,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Job Openings",
    href: "/dashboard/jobs",
    icon: Briefcase,
  },
  {
    label: "Applications",
    href: "/dashboard/applications",
    icon: FileText,
  },
  {
    label: "Managers",
    href: "/dashboard/managers",
    icon: Users,
    ownerOnly: true,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

function SidebarContent({ role }: { role: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme } = useTheme();
  const mounted = useMounted();

  const filteredNav = navItems.filter(
    (item) => !item.ownerOnly || role === "owner"
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-4">
        {mounted ? (
          <Image
            src={theme === "dark" ? "/logo.svg" : "/blacklogo.svg"}
            alt="Hyreli"
            width={24}
            height={24}
          />
        ) : (
          <div className="size-6" />
        )}
        <span className="font-semibold tracking-tight">Hyreli</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {filteredNav.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <a
          href="https://github.com/Hyreli/hyreli"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ExternalLink className="size-4" />
          GitHub Repository
        </a>

        <div className="mt-3 flex items-center gap-3 px-3">
          <Avatar className="size-8">
            <AvatarImage src={session?.user?.image || undefined} />
            <AvatarFallback className="text-xs">
              {session?.user?.name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{session?.user?.name}</p>
            <Badge variant="secondary" className="text-xs capitalize">
              {role}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const { data: session } = useSession();
  const role = (session?.user as Record<string, unknown>)?.role as string || "user";
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r bg-background">
        <SidebarContent role={role} />
      </aside>

      {/* Mobile */}
      <div className="lg:hidden sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <Menu className="size-5" />
            </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="font-semibold">Navigation</span>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <SidebarContent role={role} />
          </SheetContent>
        </Sheet>
        <span className="font-semibold">Hyreli</span>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}

export function DashboardTopBar() {
  return (
    <div className="hidden lg:flex sticky top-0 z-30 h-14 items-center justify-end gap-2 border-b bg-background/80 backdrop-blur-lg px-6">
      <ThemeToggle />
    </div>
  );
}
