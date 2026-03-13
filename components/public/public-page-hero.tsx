import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type HeroLink = {
  href: string;
  label: string;
};

type HeroStat = {
  value: string;
  label: string;
};

type HeroNote = {
  title: string;
  description: string;
};

type PublicPageHeroProps = {
  badge: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  tags?: string[];
  stats?: HeroStat[];
  note?: HeroNote;
  primaryCta?: HeroLink;
  secondaryCta?: HeroLink;
};

export function PublicPageHero({
  badge,
  title,
  description,
  imageUrl,
  imageAlt,
  tags,
  stats,
  note,
  primaryCta,
  secondaryCta,
}: PublicPageHeroProps) {
  return (
    <section className="public-hero">
      <div className="public-shell">
        <div className="public-hero-grid">
        <div className="public-hero-content">
          <span className="public-kicker">{badge}</span>
          <h1 className="public-hero-title">{title}</h1>
          <p className="public-hero-description">{description}</p>

          {tags?.length ? (
            <div className="public-hero-tags">
              {tags.map((tag) => (
                <span key={tag} className="public-hero-tag">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {stats?.length ? (
            <div className="public-hero-stats">
              {stats.map((stat) => (
                <div key={stat.label} className="public-hero-stat">
                  <span className="public-hero-stat-value">{stat.value}</span>
                  <span className="public-hero-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          ) : null}

          {(primaryCta || secondaryCta) && (
            <div className="public-hero-actions">
              {primaryCta ? (
                <Link
                  href={primaryCta.href}
                  className="focus-ring inline-flex h-11 items-center justify-center rounded-full bg-(--accent) px-5 text-sm font-semibold text-(--accent-ink) shadow-[0_12px_28px_rgba(75,125,233,0.28)] transition hover:brightness-110"
                >
                  {primaryCta.label}
                </Link>
              ) : null}
              {secondaryCta ? (
                <Link
                  href={secondaryCta.href}
                  className="focus-ring inline-flex h-11 items-center justify-center rounded-full border border-(--line) bg-(--surface) px-5 text-sm font-semibold text-(--text)"
                >
                  {secondaryCta.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              ) : null}
            </div>
          )}
        </div>

        <div className="public-hero-media">
          <Image
            src={imageUrl}
            alt={imageAlt}
            width={1400}
            height={900}
            priority
            className="public-hero-image"
          />
          <div className="public-hero-glow" aria-hidden="true" />
          {note ? (
            <div className="public-hero-note">
              <p className="public-hero-note-title">{note.title}</p>
              <p className="public-hero-note-text">{note.description}</p>
            </div>
          ) : null}
        </div>
        </div>
      </div>
    </section>
  );
}
