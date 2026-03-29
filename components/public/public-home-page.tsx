import { PublicHomeAlumni } from "./public-home-alumni";
import { PublicHomeAssistant } from "./public-home-assistant";
import { PublicHomeCta } from "./public-home-cta";
import { PublicHomeEvents } from "./public-home-events";
import { PublicHomeFeatures } from "./public-home-features";
import { PublicHomeHero } from "./public-home-hero";
import { PublicHomeNotices } from "./public-home-notices";
import { PublicHomeQuickLinks } from "./public-home-quick-links";
import { PublicHomeStats } from "./public-home-stats";

export function PublicHomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-(--bg) text-(--text)">
      <PublicHomeHero />
      <PublicHomeQuickLinks />
      <PublicHomeFeatures />
      <PublicHomeNotices />
      <PublicHomeEvents />
      <PublicHomeAlumni />
      <PublicHomeStats />
      <PublicHomeAssistant />
      <PublicHomeCta />
    </main>
  );
}
