import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import type { HealthError } from "@/lib/health";

export const metadata = {
  title: "Invalid Configuration",
};

export default function InvalidPage({ error }: { error?: HealthError | null }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-lg font-semibold tracking-tight">Hyreli</span>
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
            <Image
              src="/notconfigured.svg"
              alt="Invalid configuration"
              width={96}
              height={96}
              className="size-24"
            />
            <h1 className="text-2xl font-bold tracking-tight">
              {error?.title ?? "Invalid configuration!"}
            </h1>
            <p className="text-muted-foreground">
              {error?.message ??
                "Something is wrong with your configuration. Fix the issue and restart the application."}
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
