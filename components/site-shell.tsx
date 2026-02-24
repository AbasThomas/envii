"use client";

import { usePathname } from "next/navigation";

import { NavShell } from "@/components/nav-shell";

type SiteShellProps = {
  children: React.ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/onboarding");

  if (isLanding) {
    return <main className="w-full">{children}</main>;
  }

  if (isAuthPage) {
    return <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">{children}</main>;
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-3 pb-8 pt-3 sm:px-4 lg:px-6">
      <NavShell mode="top" />
      <div className="flex gap-6">
        <NavShell mode="sidebar" />
        <main className="min-w-0 flex-1 pb-4 pt-1 md:pb-6 lg:pt-2">{children}</main>
      </div>
    </div>
  );
}
