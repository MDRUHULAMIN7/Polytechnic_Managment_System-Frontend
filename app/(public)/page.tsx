import type { Metadata } from "next";
import { PublicChatbot } from "@/components/common/public-chatbot";
import { HeroSection } from "@/components/common/landing-hero";

export const metadata: Metadata = {
  title: "Landing",
  description:
    "Understand which institutional problems PMS solves digitally and the operational goal of the software."
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(75,125,233,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.16),transparent_34%),var(--bg)] text-(--text)">
      <HeroSection />
      <PublicChatbot />
    </main>
  );
}
