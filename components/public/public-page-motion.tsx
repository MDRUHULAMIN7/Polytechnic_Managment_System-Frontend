"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type PublicPageMotionProps = {
  children: React.ReactNode;
  className?: string;
};

export function PublicPageMotion({ children, className }: PublicPageMotionProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const root = rootRef.current;
    const sections = Array.from(
      root.querySelectorAll<HTMLElement>("[data-animate-section]")
    );

    const ctx = gsap.context(() => {
      sections.forEach((section) => {
        const heading = section.querySelectorAll("[data-animate='heading']");
        const items = section.querySelectorAll("[data-animate-item]");

        if (heading.length) {
          gsap.from(heading, {
            opacity: 0,
            y: 24,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 78%",
            },
          });
        }

        if (items.length) {
          gsap.from(items, {
            opacity: 0,
            y: 22,
            scale: 0.98,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: section,
              start: "top 72%",
            },
          });
        }
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
