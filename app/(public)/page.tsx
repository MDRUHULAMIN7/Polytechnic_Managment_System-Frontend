import type { Metadata } from "next";
import { HeroSection } from "@/components/common/landing-hero";
import { PublicNavbar } from "@/components/public/public-navbar";
import { PublicHomeQuickLinks } from "@/components/public/public-home-quick-links";
import { PublicHomeFeatures } from "@/components/public/public-home-features";
import { PublicHomeStats } from "@/components/public/public-home-stats";
import { PublicHomeNotices } from "@/components/public/public-home-notices";
import { PublicHomeEvents } from "@/components/public/public-home-events";
import { PublicHomeAlumni } from "@/components/public/public-home-alumni";
import { PublicHomeCta } from "@/components/public/public-home-cta";
import { PublicFooter } from "@/components/public/public-footer";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Modern academic management for polytechnic institutions with clear, reliable workflows."
};

export default function HomePage() {
  return (
    <>
      <a href="#main-content" className="skip-link focus-ring">
        Skip to main content
      </a>
      <PublicNavbar />
      <main
        id="main-content"
        className="min-h-screen bg-(--bg) text-(--text)"
      >
        <HeroSection />
        <PublicHomeQuickLinks />
        <PublicHomeFeatures />
        <PublicHomeEvents />
        <PublicHomeAlumni />
        <PublicHomeStats />
        <PublicHomeNotices />
        <PublicHomeCta />
      </main>
      <PublicFooter />
    </>
  );
}
