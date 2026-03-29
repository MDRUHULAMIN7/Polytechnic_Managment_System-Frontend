import type { Metadata } from "next";
import { PublicEventsPage } from "@/components/public/public-events-page";

export const metadata: Metadata = {
  title: "Events",
  description: "Academic seminars, student-led gatherings, workshops, and flagship RPI Polytechnic programs.",
};

export default function EventsPage() {
  return <PublicEventsPage />;
}
