import { PublicPageMotion } from "./public-page-motion";
import { PublicAlumniCta } from "./public-alumni-cta";
import { PublicAlumniHero } from "./public-alumni-hero";
import { PublicAlumniMentorship } from "./public-alumni-mentorship";
import { PublicAlumniNetwork } from "./public-alumni-network";
import { PublicAlumniStories } from "./public-alumni-stories";

export function PublicAlumniPage() {
  return (
    <PublicPageMotion>
      <main id="main-content" className="min-h-screen bg-(--bg) text-(--text)">
        <PublicAlumniHero />
        <PublicAlumniStories />
        <PublicAlumniMentorship />
        <PublicAlumniNetwork />
        <PublicAlumniCta />
      </main>
    </PublicPageMotion>
  );
}
