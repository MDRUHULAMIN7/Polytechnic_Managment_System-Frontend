import Link from "next/link";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Notices", href: "/notices" },
  { label: "Events", href: "/events" },
  { label: "Alumni", href: "/alumni" },
  { label: "Academic Calendar", href: "/academic-calendar" },
];

const resources = [
  { label: "Student Portal", href: "/login" },
  { label: "Instructor Directory", href: "/academic-instructors" },
  { label: "Academic Calendar", href: "/academic-calendar" },
  { label: "Notice Board", href: "/notices" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-(--line) bg-[color:color-mix(in_srgb,var(--surface)_92%,transparent)]">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-2xl font-bold tracking-[-0.03em] text-(--text)">
              RPI Polytechnic
            </p>
            <p className="mt-4 text-sm leading-7 text-(--text-dim)">
              A modern digital front door for notices, academic calendars,
              instructors, events, and institutional communication.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-(--text)">
              Quick Links
            </p>
            <ul className="mt-3 space-y-2 text-sm text-(--text-dim)">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition hover:text-(--accent)">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-(--text)">
              Resources
            </p>
            <ul className="mt-3 space-y-2 text-sm text-(--text-dim)">
              {resources.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition hover:text-(--accent)">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-(--text)">
              Contact
            </p>
            <ul className="mt-3 space-y-2 text-sm text-(--text-dim)">
              <li>RPI Polytechnic Institute</li>
              <li>Dhaka, Bangladesh</li>
              <li>Email: info@rpi.edu.bd</li>
              <li>Phone: +880 1234 567890</li>
              <li>Office Hours: Sun-Thu, 9:00 AM - 5:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-(--line) py-8 text-sm text-(--text-dim) md:flex-row md:items-center md:justify-between">
          <span>(c) 2026 RPI Polytechnic Institute. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="transition hover:text-(--accent)">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition hover:text-(--accent)">
              Terms of Service
            </Link>
            <button
              type="button"
              className="focus-ring inline-flex items-center rounded-full border border-(--line) bg-(--surface) px-3 py-1 text-xs font-semibold text-(--text)"
              aria-label="Toggle language"
            >
              EN / BN
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
