import type { Metadata } from "next";
import { Space_Grotesk, Source_Sans_3 } from "next/font/google";
import { ToastRegion } from "@/components/common/toast-region";

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

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        suppressHydrationWarning
        className={`${headingFont.variable} ${bodyFont.variable} antialiased`}
      >
        {children}
        <ToastRegion />
      </body>
    </html>
  );
}
