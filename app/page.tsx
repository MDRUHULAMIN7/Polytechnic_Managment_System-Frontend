import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Landing",
  description:
    "Understand which institutional problems RMS solves digitally and the operational goal of the software."
};

export default function HomePage() {
  return <LandingPage />;
}
