import type { Metadata } from "next";
import { PublicChatbot } from "@/components/common/public-chatbot";
import { PublicHomePage } from "@/components/public/public-home-page";
import { PublicNavbarServer } from "@/components/public/public-navbar-server";
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
      <PublicNavbarServer />
      <PublicHomePage />
      <PublicChatbot />
      <PublicFooter />
    </>
  );
}
