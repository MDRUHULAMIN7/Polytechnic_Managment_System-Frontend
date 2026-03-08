import Link from "next/link";
import { RootNoticeDropdown } from "./root-notice-dropdown";
import { ThemeToggle } from "./theme-toggle";

export function RootNavbar() {
  return (
    <header className="border-b border-(--line) bg-(--surface)/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          PMS
        </Link>
        <div className="flex items-center gap-3">
          <RootNoticeDropdown />
          <ThemeToggle />
          <Link
            href="/login"
            className="focus-ring inline-flex h-10 items-center rounded-lg bg-(--accent) px-4 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90"
          >
            Login
          </Link>
        </div>
      </nav>
    </header>
  );
}
