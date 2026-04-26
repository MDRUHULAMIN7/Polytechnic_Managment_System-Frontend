import type { Metadata } from "next";
import { PublicAlumniPage } from "@/components/public/public-alumni-page";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicNavbarServer } from "@/components/public/public-navbar-server";

export const metadata: Metadata = {
  title: "Alumni",
  description:
    "Reconnect with the RPI Polytechnic alumni community through stories, mentorship, and private network access.",
};

export default function AlumniPage() {
  return (
    <>
      <a href="#main-content" className="skip-link focus-ring">
        Skip to main content
      </a>
      <PublicNavbarServer />
      <PublicAlumniPage />
      <PublicFooter />
    </>
  );
}
