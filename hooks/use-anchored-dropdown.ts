"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const MOBILE_BREAKPOINT = 640;
const VIEWPORT_MARGIN = 16;
const VERTICAL_OFFSET = 12;
const MIN_DROPDOWN_WIDTH = 280;
const MIN_DROPDOWN_HEIGHT = 220;

type UseAnchoredDropdownOptions = {
  open: boolean;
  maxWidth: number;
  desktopClassName: string;
  mobileClassName?: string;
  mobileAlign?: "start" | "center" | "end";
};

export function useAnchoredDropdown({
  open,
  maxWidth,
  desktopClassName,
  mobileClassName = "fixed z-[70]",
  mobileAlign = "center",
}: UseAnchoredDropdownOptions) {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
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
        Math.max(window.innerWidth - VIEWPORT_MARGIN * 2, MIN_DROPDOWN_WIDTH),
      );
      const idealLeft =
        mobileAlign === "start"
          ? rect.left
          : mobileAlign === "end"
            ? rect.right - width
            : rect.left + rect.width / 2 - width / 2;
      const left = Math.min(
        Math.max(VIEWPORT_MARGIN, idealLeft),
        window.innerWidth - width - VIEWPORT_MARGIN,
      );
      const measuredHeight =
        dropdownRef.current?.getBoundingClientRect().height ?? MIN_DROPDOWN_HEIGHT;
      const cappedHeight = Math.min(
        measuredHeight,
        window.innerHeight - VIEWPORT_MARGIN * 2,
      );
      const availableBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN;
      const availableAbove = rect.top - VIEWPORT_MARGIN;
      const shouldOpenAbove =
        availableBelow < cappedHeight && availableAbove > availableBelow;

      if (shouldOpenAbove) {
        const maxHeight = Math.min(
          cappedHeight,
          Math.max(160, availableAbove - VERTICAL_OFFSET),
        );
        const top = Math.max(
          VIEWPORT_MARGIN,
          rect.top - VERTICAL_OFFSET - maxHeight,
        );

        setMobileStyle({
          top,
          left,
          width,
          maxHeight,
          overflowY: "auto",
        });
        return;
      }

      const top = Math.max(
        VIEWPORT_MARGIN,
        Math.min(
          rect.bottom + VERTICAL_OFFSET,
          window.innerHeight - VIEWPORT_MARGIN - cappedHeight,
        ),
      );
      const maxHeight = Math.max(
        160,
        window.innerHeight - top - VIEWPORT_MARGIN,
      );

      setMobileStyle({
        top,
        left,
        width,
        maxHeight,
        overflowY: "auto",
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [maxWidth, mobileAlign, open]);

  const shouldUseMobilePosition =
    open &&
    typeof window !== "undefined" &&
    window.innerWidth < MOBILE_BREAKPOINT &&
    Boolean(mobileStyle);

  return {
    anchorRef,
    dropdownRef,
    dropdownClassName: shouldUseMobilePosition
      ? mobileClassName
      : desktopClassName,
    dropdownStyle: shouldUseMobilePosition ? mobileStyle : undefined,
  };
}
