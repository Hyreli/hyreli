import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import { TooltipProvider } from "@/components/ui/tooltip";
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
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');var d=(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches));document.documentElement.classList.add(d?'dark':'light')}catch(e){}`,
          }}
        />
        <ThemeProvider>
          <Providers>
            <TooltipProvider>{children}</TooltipProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
