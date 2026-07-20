import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
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
          <Providers>
            <TooltipProvider>
              <Toaster
                position="bottom-right"
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
        </ThemeProvider>
      </body>
    </html>
  );
}
