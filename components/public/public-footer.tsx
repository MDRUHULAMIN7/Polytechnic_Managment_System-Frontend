import Link from "next/link";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Notices", href: "/notices" },
  { label: "Admissions", href: "/admissions" },
  { label: "Departments", href: "/departments" },
  { label: "Contact", href: "/contact" },
];

const resources = [
  { label: "Student Portal", href: "/login" },
  { label: "Faculty Portal", href: "/login" },
  { label: "Academic Calendar", href: "/academic-calendar" },
  { label: "Downloads", href: "/downloads" },
];

export function PublicFooter() {
  return (
    <footer className="home-footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-semibold text-(--text)">RPI Polytechnic</p>
            <p className="mt-3 text-sm text-(--text-dim)">
              Modern academic management for polytechnic institutions with clear,
              reliable workflows.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-(--text)">Quick Links</p>
            <ul className="mt-3 space-y-2 text-sm text-(--text-dim)">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-(--accent)">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-(--text)">Resources</p>
            <ul className="mt-3 space-y-2 text-sm text-(--text-dim)">
              {resources.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-(--accent)">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-(--text)">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-(--text-dim)">
              <li>RPI Polytechnic Institute</li>
              <li>Dhaka, Bangladesh</li>
              <li>Email: info@rpi.edu.bd</li>
              <li>Phone: +880 1234 567890</li>
              <li>Office Hours: Sun-Thu, 9:00 AM - 5:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="home-footer-bottom">
          <span>© 2026 RPI Polytechnic Institute. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="hover:text-(--accent)">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-(--accent)">
              Terms of Service
            </Link>
            <button
              type="button"
              className="focus-ring inline-flex items-center rounded-full border border-(--line) bg-(--surface) px-3 py-1 text-xs font-semibold text-(--text)"
              aria-label="Toggle language"
            >
              EN / বাং
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
