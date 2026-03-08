import React from "react";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

afterEach(() => {
  cleanup();
});

const MockNextLink = function Link({
    children,
    href,
    ...props
  }: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string | { pathname?: string };
  }) {
    const resolvedHref = typeof href === "string" ? href : href.pathname ?? "#";
    return React.createElement("a", { href: resolvedHref, ...props }, children);
  };

MockNextLink.displayName = "MockNextLink";

vi.mock("next/link", () => ({
  default: MockNextLink,
}));

vi.mock("framer-motion", () => {
  const createMotionComponent = (tag: string) => {
    const MockMotionComponent = React.forwardRef<
      HTMLElement,
      React.HTMLAttributes<HTMLElement>
    >(function MockMotion({ children, ...props }, ref) {
      return React.createElement(tag, { ...props, ref }, children);
    });

    MockMotionComponent.displayName = `MockMotion(${tag})`;
    return MockMotionComponent;
  };

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    motion: new Proxy(
      {},
      {
        get: (_, tag: string) => createMotionComponent(tag),
      },
    ),
  };
});

if (!("matchMedia" in window)) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
