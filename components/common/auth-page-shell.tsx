import type { ReactNode } from "react";

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <main
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg)] px-4 py-12"
      style={{ backgroundImage: "var(--login-base)" }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(45% 35% at 10% 15%, var(--login-blob-a) 0%, transparent 100%), radial-gradient(40% 38% at 88% 10%, var(--login-blob-b) 0%, transparent 100%), radial-gradient(50% 42% at 50% 100%, var(--login-blob-c) 0%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            opacity: "var(--login-grid-opacity)",
            backgroundImage:
              "linear-gradient(var(--login-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--login-grid-line) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </main>
  );
}
