import type { ReactNode } from "react";

type SectionKickerProps = {
  children: ReactNode;
  dark?: boolean;
};

export function SectionKicker({ children, dark = false }: SectionKickerProps) {
  return (
    <span
      className={`${dark ? "home-editorial-kicker-dark" : "home-editorial-kicker"} inline-flex items-center rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em]`}
    >
      {children}
    </span>
  );
}
