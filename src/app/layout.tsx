import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { isConfigured } from "@/lib/configured";
import NotConfiguredPage from "@/app/not-configured/page";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Hyreli  ",
    template: "%s | Hyreli",
  },
  description:
    "A beautiful, open-source careers platform. Self-hostable, Discord-powered, and developer-friendly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <script
          type="text/plain"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');var d=(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches));document.documentElement.classList.add(d?'dark':'light')}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>
        <ThemeProvider>
          {isConfigured() ? (
            <Providers>
              <TooltipProvider>
                <Toaster
                  position="bottom-right"
                  icons={{
                    success: <CheckCircle2 className="size-4 text-emerald-500" />,
                    error: <AlertCircle className="size-4 text-red-500" />,
                    warning: <AlertTriangle className="size-4 text-amber-500" />,
                    info: <Info className="size-4 text-blue-500" />,
                  }}
                  toastOptions={{
                    style: {
                      background: "#1c1c1c",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                    },
                  }}
                />
                {children}
              </TooltipProvider>
            </Providers>
          ) : (
            <NotConfiguredPage />
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
