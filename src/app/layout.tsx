import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

const bootstrapScript = `(() => {
  try {
    var m = document.cookie.match(/(?:^|; )pulseboard-theme=([^;]+)/);
    var cookie = m ? decodeURIComponent(m[1]) : null;
    var stored = window.localStorage.getItem('pulseboard-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme =
      cookie === 'dark' || cookie === 'light' ? cookie
      : stored === 'dark' || stored === 'light' ? stored
      : prefersDark ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.cookie = 'pulseboard-theme=' + theme + '; path=/; max-age=31536000; samesite=lax';
    window.localStorage.setItem('pulseboard-theme', theme);
  } catch (_) {}
})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const stored = (await cookies()).get("pulseboard-theme")?.value;
  const htmlClass = stored === "dark" ? "antialiased dark" : "antialiased";

  return (
    <html lang="en" className={htmlClass} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootstrapScript }} />
      </head>
      <body>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
