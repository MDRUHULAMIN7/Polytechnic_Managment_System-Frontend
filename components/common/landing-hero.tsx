"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle,
  MessageSquare,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { PageShell } from "./page-shell";

const metrics = [
  { value: "3", label: "Role-based dashboards" },
  { value: "100%", label: "Real-time synchronization" },
  { value: "24/7", label: "System availability" },
];

const features = [
  {
    icon: Calendar,
    title: "Unified Semester Management",
    description: "Handle registration, enrollment, and scheduling from a single interface.",
  },
  {
    icon: Bell,
    title: "Smart Notice Distribution",
    description: "Role-aware notices reach the right people, instantly and reliably.",
  },
  {
    icon: MessageSquare,
    title: "Intelligent Assistance",
    description: "Public queries answered with live PMS data, not guesswork.",
  },
];

const trustBadges = [
  { icon: Users, label: "1000+ Active Users" },
  { icon: Shield, label: "SOC 2 Compliant" },
  { icon: CheckCircle, label: "99.9% Uptime" },
];

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <section ref={sectionRef} className="hero-section overflow-hidden pt-6 pb-20">
      {/* Background gradient */}
      <div className="hero-gradient-bg" />

      <PageShell className="relative">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start">
          {/* Left Column - Main Content */}
          <div className="lg:pr-4">
            {/* Badge */}
            <div
              className={`inline-flex ${mounted ? "animate-hero-fade-up delay-0" : "opacity-0"}`}
            >
              <span className="hero-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-wide">
                <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                <span style={{ color: "var(--accent)" }}>
                  Polytechnic Management, Simplified
                </span>
              </span>
            </div>

            {/* Main Heading */}
            <h1
              className={`mt-8 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl ${
                mounted ? "animate-hero-fade-up delay-100" : "opacity-0"
              }`}
              style={{ color: "var(--text)" }}
            >
              The complete system for{" "}
              <span style={{ color: "var(--accent)" }}>modern campus operations</span>
            </h1>

            {/* Description */}
            <p
              className={`mt-6 text-base leading-7 sm:text-lg sm:leading-8 ${
                mounted ? "animate-hero-fade-up delay-200" : "opacity-0"
              }`}
              style={{ color: "var(--text-dim)" }}
            >
              PMS brings together notices, semester management, class scheduling, and
              intelligent assistance into a unified platform. Designed for admins,
              instructors, and students to work efficiently—without chaos.
            </p>

            {/* CTA Buttons */}
            <div
              className={`mt-8 flex flex-col gap-3 sm:flex-row ${
                mounted ? "animate-hero-fade-up delay-300" : "opacity-0"
              }`}
            >
              <Link
                href="/login"
                className="hero-cta-primary focus-ring group inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/notices"
                className="hero-cta-secondary focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold"
              >
                View Notices
              </Link>
            </div>

            {/* Trust Indicators */}
            <div
              className={`mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-8 ${
                mounted ? "animate-hero-fade-up delay-400" : "opacity-0"
              }`}
              style={{ borderColor: "var(--line)" }}
            >
              {trustBadges.map((badge, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <badge.icon
                    className="h-4 w-4"
                    style={{ color: "var(--accent)" }}
                  />
                  <span style={{ color: "var(--text-dim)" }}>{badge.label}</span>
                </div>
              ))}
            </div>

            {/* Metrics */}
            <div
              className={`mt-10 grid grid-cols-3 gap-4 ${
                mounted ? "animate-hero-fade-up delay-500" : "opacity-0"
              }`}
            >
              {metrics.map((metric, index) => (
                <div key={index} className="hero-metric-card rounded-2xl p-4">
                  <div
                    className="text-2xl font-bold tracking-tight sm:text-3xl"
                    style={{ color: "var(--text)" }}
                  >
                    {metric.value}
                  </div>
                  <div
                    className="mt-2 text-xs leading-5 sm:text-sm"
                    style={{ color: "var(--text-dim)" }}
                  >
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Feature Cards */}
          <div className="lg:pl-4">
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`hero-card group rounded-2xl p-6 ${
                    mounted ? `animate-hero-scale-in delay-${(index + 3) * 100}` : "opacity-0"
                  }`}
                >
                  <div className="flex gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: "var(--hero-badge-bg)",
                        border: "1px solid var(--hero-badge-border)",
                      }}
                    >
                      <feature.icon
                        className="h-6 w-6"
                        style={{ color: "var(--accent)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-base font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className="mt-2 text-sm leading-6"
                        style={{ color: "var(--text-dim)" }}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Info Card */}
            <div
              className={`hero-card mt-6 min-h-[168px] rounded-2xl p-7 sm:p-8 ${
                mounted ? "animate-hero-scale-in delay-600" : "opacity-0"
              }`}
              style={{
                background: "var(--hero-metric-gradient)",
                borderColor: "var(--accent)",
              }}
            >
              <div className="flex items-start gap-3">
                <CheckCircle
                  className="h-5 w-5 shrink-0"
                  style={{ color: "var(--accent)" }}
                />
                <div>
                  <h4
                    className="text-sm font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    Production-ready architecture
                  </h4>
                  <p
                    className="mt-2 text-sm leading-6"
                    style={{ color: "var(--text-dim)" }}
                  >
                    Built with scalability, security, and real-time performance in
                    mind. Every component tested for reliability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    </section>
  );
}
