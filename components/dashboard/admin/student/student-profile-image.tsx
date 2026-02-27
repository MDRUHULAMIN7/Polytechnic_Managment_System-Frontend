"use client";

import { useEffect, useMemo, useState } from "react";

type StudentProfileImageProps = {
  src?: string | null;
  alt?: string;
  className?: string;
};

function buildFallbackSvg() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e2e8f0"/>
          <stop offset="100%" stop-color="#cbd5f5"/>
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="64" fill="url(#bg)"/>
      <circle cx="64" cy="52" r="26" fill="#94a3b8"/>
      <path d="M24 108c6-20 26-32 40-32s34 12 40 32" fill="#94a3b8"/>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

const FALLBACK_AVATAR = buildFallbackSvg();

export function StudentProfileImage({ src, alt, className }: StudentProfileImageProps) {
  const initialSrc = useMemo(() => (src?.trim() ? src : FALLBACK_AVATAR), [src]);
  const [currentSrc, setCurrentSrc] = useState(initialSrc);

  useEffect(() => {
    setCurrentSrc(initialSrc);
  }, [initialSrc]);

  return (
    <img
      src={currentSrc}
      alt={alt ?? "Student profile"}
      className={className}
      onError={() => {
        if (currentSrc !== FALLBACK_AVATAR) {
          setCurrentSrc(FALLBACK_AVATAR);
        }
      }}
    />
  );
}
