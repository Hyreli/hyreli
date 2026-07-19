import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 inline-flex size-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="size-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Application Submitted</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for your interest! We&apos;ll review your application and get back to you soon.
            </p>
            <Link href="/careers">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="size-4" />
                Back to Careers
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
