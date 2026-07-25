"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";

const errors: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Server Error",
    description:
      "There is a problem with the server configuration. Contact the administrator to resolve this.",
  },
  AccessDenied: {
    title: "Access Denied",
    description:
      "You do not have permission to sign in. If you believe this is a mistake, contact the administrator.",
  },
  OAuthSignin: {
    title: "Sign-in Error",
    description:
      "An error occurred while starting the sign-in process. Please try again.",
  },
  OAuthCallback: {
    title: "Callback Error",
    description:
      "An error occurred while processing the sign-in callback. Please try again.",
  },
  OAuthCreateAccount: {
    title: "Account Error",
    description:
      "Could not create an account. Please try again or contact the administrator.",
  },
  Callback: {
    title: "Callback Error",
    description:
      "Something went wrong during sign-in. Please try again.",
  },
  OAuthAccountNotLinked: {
    title: "Account Not Linked",
    description:
      "This account is already associated with another provider. Sign in with the original provider to continue.",
  },
  Default: {
    title: "Sign-in Error",
    description:
      "An unexpected error occurred. Please try again.",
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get("error") ?? "Default";
  const error = errors[errorType] ?? errors.Default;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{error.title}</h1>
          <p className="text-muted-foreground">{error.description}</p>
          <Button render={<Link href="/" />} className="gap-2">
            <ArrowLeft className="size-4" />
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-lg font-semibold tracking-tight">Hyreli</span>
          </Link>
        </div>
      </header>
      <Suspense>
        <AuthErrorContent />
      </Suspense>
      <Footer />
    </div>
  );
}
