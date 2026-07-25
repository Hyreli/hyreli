import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { getMissingEnvVars } from "@/lib/configured";

export const metadata = {
  title: "Not Configured",
};

export default function NotConfiguredPage() {
  const missing = getMissingEnvVars();

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
              alt="Not configured"
              width={96}
              height={96}
              className="size-24"
            />
            <h1 className="text-2xl font-bold tracking-tight">Not configured!</h1>
            <p className="text-muted-foreground">
              Hyreli is missing required environment variables and cannot start.
              Copy <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">.env.example</code> to{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">.env</code> and fill in the
              values, then restart the application.
            </p>
            {missing.length > 0 && (
              <div className="w-full rounded-lg border bg-muted/50 p-4 text-left">
                <p className="mb-2 text-sm font-medium">Missing variables:</p>
                <ul className="space-y-1">
                  {missing.map((key) => (
                    <li key={key} className="flex items-center gap-2 text-sm font-mono text-destructive">
                      <span className="size-1.5 rounded-full bg-destructive inline-block" />
                      {key}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
