import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Space_Grotesk, Source_Sans_3 } from "next/font/google";
import { ToastRegion } from "@/components/common/toast-region";
import { QueryProvider } from "@/components/providers/query-provider";

import "./globals.css";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap"
});

const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const metadataBase = (() => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL;
  if (!envUrl) {
    return new URL("http://localhost:3000");
  }
  const normalized = envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
  return new URL(normalized);
})();

function parseTheme(value: string | undefined) {
  if (value === "light" || value === "dark") {
    return value;
  }

  return undefined;
}

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Polytechnic Management",
    template: "%s | PMS"
  },
  description:
    "Polytechnic Management digitizes academic and administrative operations with role-safe workflows for institutional management.",
  keywords: [
    "Polytechnic Management",
    "education management",
    "admin dashboard",
    "academic operations",
    "semester management"
  ],
  openGraph: {
    title: "Polytechnic Management",
    description:
      "Role-driven platform for academic and administrative workflows with secure operational visibility.",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

const themeInitScript = `
(() => {
  try {
    const key = "pms_theme";
    const stored = localStorage.getItem(key);
    const fromCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(key + "="))
      ?.split("=")[1];
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const cookieTheme = fromCookie === "dark" || fromCookie === "light" ? fromCookie : null;
    const theme = stored === "dark" || stored === "light" ? stored : cookieTheme ?? system;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.cookie = key + "=" + theme + "; path=/; max-age=31536000; SameSite=Lax";
  } catch {}
})();
`;

export default async function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const theme = parseTheme(cookieStore.get("pms_theme")?.value);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme={theme}
      style={theme ? { colorScheme: theme } : undefined}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        suppressHydrationWarning
        className={`${headingFont.variable} ${bodyFont.variable} antialiased`}
      >
        <QueryProvider>
          
          {children}
          <ToastRegion />
        </QueryProvider>
      </body>
    </html>
  );
}
