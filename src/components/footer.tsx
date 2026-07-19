import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Hyreli</span>
          <span className="text-border">·</span>
          <span>Open-source careers platform</span>
        </div>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <a
            href="https://github.com/Hyreli/hyreli"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <Link href="/careers" className="hover:text-foreground transition-colors">
            Careers
          </Link>
          <a
            href="https://github.com/Hyreli/hyreli/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            License
          </a>
        </nav>
      </div>
    </footer>
  );
}
