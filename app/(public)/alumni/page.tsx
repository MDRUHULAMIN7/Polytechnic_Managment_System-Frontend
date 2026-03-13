import type { Metadata } from "next";
import Link from "next/link";
import { Award, Handshake, Users } from "lucide-react";
import { PublicPageHero } from "@/components/public/public-page-hero";
import { PublicPageMotion } from "@/components/public/public-page-motion";

export const metadata: Metadata = {
  title: "Alumni",
  description: "Alumni engagement, mentorship, and community highlights.",
};

const alumniPrograms = [
  {
    title: "Mentorship Network",
    description: "Match alumni mentors with students and department initiatives.",
    icon: Handshake,
  },
  {
    title: "Career Support",
    description: "Share openings, internships, and alumni referral opportunities.",
    icon: Award,
  },
  {
    title: "Community Stories",
    description: "Celebrate alumni achievements and campus contributions year-round.",
    icon: Users,
  },
];

const communityChecklist = [
  "Verified profiles with graduation years and current roles.",
  "Mentorship, referrals, and giving tracked in one system.",
  "Reunions and stories stay visible alongside campus events.",
];

const engagementSteps = [
  {
    title: "Collect and verify profiles",
    description:
      "Keep graduation years, roles, and locations current for accurate outreach.",
  },
  {
    title: "Activate engagement programs",
    description:
      "Launch mentoring, hiring, and giving initiatives with clear participation steps.",
  },
  {
    title: "Maintain year-round visibility",
    description:
      "Share reunions, success stories, and milestones without relying on email alone.",
  },
];

const impactMetrics = [
  { value: "Active", label: "Mentorship pipeline" },
  { value: "Verified", label: "Alumni profiles" },
  { value: "Ongoing", label: "Community updates" },
];

export default function AlumniPage() {
  return (
    <PublicPageMotion>
      <main className="min-h-screen bg-(--bg) text-(--text)">
        <PublicPageHero
          badge="Alumni"
          title="Keep alumni connected for life."
          description="Celebrate alumni success, run reunions, and build mentorship pathways that keep your community active and supportive."
          imageUrl="https://images.unsplash.com/photo-1765005343987-6bf51ae692c4?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=1600"
          imageAlt="Graduate smiling at a university ceremony"
          tags={["Alumni network", "Mentorship", "Career support"]}
          stats={[
            { value: "3", label: "Engagement tracks" },
            { value: "Always", label: "Community access" },
            { value: "Trusted", label: "Verified profiles" },
          ]}
          note={{
            title: "Alumni hub",
            description: "Reunions, mentoring, and giving stay in one place.",
          }}
          primaryCta={{ href: "/login", label: "Alumni portal access" }}
          secondaryCta={{ href: "/events", label: "Campus events" }}
        />

        <section
          className="public-section landing-band-soft"
          data-animate-section
        >
          <div className="public-shell">
            <div className="public-split">
              <div>
                <div className="public-section-head" data-animate="heading">
                  <div>
                    <span className="public-kicker">Programs</span>
                    <h2 className="public-section-title">
                      Alumni engagement that feels personal.
                    </h2>
                    <p className="public-section-subtitle">
                      Provide clear pathways for alumni to mentor, hire, and give back.
                    </p>
                  </div>
                  <Link
                    href="/academic-instructors"
                    className="text-sm font-semibold text-(--accent)"
                  >
                    Faculty directory
                  </Link>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {alumniPrograms.map((program) => (
                    <article
                      key={program.title}
                      className="public-card"
                      data-animate-item
                    >
                      <span className="landing-icon">
                        <program.icon className="h-5 w-5" />
                      </span>
                      <h3 className="mt-4 text-lg font-semibold text-(--text)">
                        {program.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-(--text-dim)">
                        {program.description}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              <aside className="public-panel" data-animate-item>
                <p className="public-panel-title">Community pulse</p>
                <p className="public-panel-text">
                  Engagement stays strong when every program has a single home.
                </p>
                <ul className="public-panel-list">
                  {communityChecklist.map((item) => (
                    <li key={item} className="public-panel-item">
                      <span className="public-panel-dot" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="public-metrics">
                  {impactMetrics.map((metric) => (
                    <div key={metric.label} className="public-metric">
                      <span className="public-metric-value">{metric.value}</span>
                      <span className="public-metric-label">{metric.label}</span>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="public-section" data-animate-section>
          <div className="public-shell">
            <div className="public-section-head" data-animate="heading">
              <div>
                <span className="public-kicker">Engagement flow</span>
                <h2 className="public-section-title">
                  Structured, consistent alumni outreach.
                </h2>
                <p className="public-section-subtitle">
                  A repeatable framework for keeping alumni involved year-round.
                </p>
              </div>
              <Link href="/notices" className="text-sm font-semibold text-(--accent)">
                Public noticeboard
              </Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {engagementSteps.map((step, index) => (
                <article key={step.title} className="public-card public-step" data-animate-item>
                  <span className="public-step-index">{`0${index + 1}`}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-(--text)">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-(--text-dim)">
                      {step.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 public-cta" data-animate-item>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-(--text)">
                    Launch alumni onboarding
                  </p>
                  <p className="mt-2 text-sm text-(--text-dim)">
                    Gather profiles, verify graduation years, and unlock mentoring access.
                  </p>
                </div>
                <Link href="/login" className="text-sm font-semibold text-(--accent)">
                  Access alumni portal
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicPageMotion>
  );
}
