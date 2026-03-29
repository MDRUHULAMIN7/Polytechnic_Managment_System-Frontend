import { PublicPageMotion } from "./public-page-motion";
import { PublicEventsFeatured } from "./public-events-featured";
import { PublicEventsGrid } from "./public-events-grid";
import { PublicEventsHeader } from "./public-events-header";
import { PublicEventsNewsletter } from "./public-events-newsletter";

export function PublicEventsPage() {
  return (
    <PublicPageMotion>
      <main className="min-h-screen bg-(--bg) text-(--text)">
        <PublicEventsHeader />
        <PublicEventsFeatured />
        <PublicEventsGrid />
        <PublicEventsNewsletter />
      </main>
    </PublicPageMotion>
  );
}
