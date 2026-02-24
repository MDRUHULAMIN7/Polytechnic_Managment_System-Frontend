import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Space_Grotesk, Source_Sans_3 } from "next/font/google";
import { isTheme, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";
import { QueryProvider } from "@/components/ui/query-provider";
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

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Polytechnic Management",
    template: "%s | RMS"
  },
  description:
    "Polytechnic Management digitizes academic and administrative operations with role-safe workflows for institutional management.",
  keywords: ["Polytechnic Management", "education management", "admin dashboard", "academic operations", "semester management"],
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
    const key = "${THEME_STORAGE_KEY}";
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

function readServerTheme(value: string | undefined): Theme {
  return isTheme(value) ? value : "light";
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const serverTheme = readServerTheme(cookieStore.get(THEME_STORAGE_KEY)?.value);

  return (
    <html lang="en" data-theme={serverTheme} style={{ colorScheme: serverTheme }} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning className={`${headingFont.variable} ${bodyFont.variable}`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
