"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const MOBILE_BREAKPOINT = 640;
const VIEWPORT_MARGIN = 16;
const VERTICAL_OFFSET = 12;

type UseAnchoredDropdownOptions = {
  open: boolean;
  maxWidth: number;
  desktopClassName: string;
  mobileClassName?: string;
};

export function useAnchoredDropdown({
  open,
  maxWidth,
  desktopClassName,
  mobileClassName = "fixed z-[70]",
}: UseAnchoredDropdownOptions) {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [mobileStyle, setMobileStyle] = useState<CSSProperties>();

  useEffect(() => {
    if (!open) {
      return;
    }

    function updatePosition() {
      if (typeof window === "undefined" || !anchorRef.current) {
        return;
      }

      if (window.innerWidth >= MOBILE_BREAKPOINT) {
        setMobileStyle(undefined);
        return;
      }

      const rect = anchorRef.current.getBoundingClientRect();
      const width = Math.min(
        maxWidth,
        Math.max(window.innerWidth - VIEWPORT_MARGIN * 2, 280),
      );
      const idealLeft = rect.left + rect.width / 2 - width / 2;
      const left = Math.min(
        Math.max(VIEWPORT_MARGIN, idealLeft),
        window.innerWidth - width - VIEWPORT_MARGIN,
      );

      setMobileStyle({
        top: rect.bottom + VERTICAL_OFFSET,
        left,
        width,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [maxWidth, open]);

  const shouldUseMobilePosition =
    open &&
    typeof window !== "undefined" &&
    window.innerWidth < MOBILE_BREAKPOINT &&
    Boolean(mobileStyle);

  return {
    anchorRef,
    dropdownClassName: shouldUseMobilePosition
      ? mobileClassName
      : desktopClassName,
    dropdownStyle: shouldUseMobilePosition ? mobileStyle : undefined,
  };
}
