"use client";

import {
  BellIcon,
  BoltIcon,
  CreditCardIcon,
  CompassIcon,
  FolderGit2Icon,
  HomeIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/repos", label: "Repos", icon: FolderGit2Icon },
  { href: "/explore", label: "Explore", icon: CompassIcon },
  { href: "/editor", label: "Editor", icon: BoltIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
  { href: "/billing", label: "Billing", icon: CreditCardIcon },
];

type NavShellProps = {
  mode?: "sidebar" | "top";
};

function isActivePath(pathname: string, href: string) {
  if (href === "/repos") {
    return pathname === "/repos" || pathname.startsWith("/repos/") || pathname.startsWith("/repo/");
  }

  if (href === "/billing") {
    return pathname === "/billing" || pathname.startsWith("/settings/billing");
  }

  if (href === "/settings") {
    return (
      pathname === "/settings" ||
      (pathname.startsWith("/settings/") && !pathname.startsWith("/settings/billing"))
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavShell({ mode = "sidebar" }: NavShellProps) {
  const pathname = usePathname();

  if (mode === "top") {
    return (
      <header className="sticky top-3 z-40 lg:hidden">
        <div className="rounded-2xl border border-[#D4A574]/20 bg-[#02120e]/80 p-3 shadow-[0_8px_36px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#D4A574] to-[#C85A3A] text-xs font-bold text-[#02120e]">
                EN
              </span>
              <div>
                <p className="font-semibold text-[#f5f5f0]">envii</p>
                <p className="text-xs text-[#a8b3af]">private env control</p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <button className="rounded-full border border-[#D4A574]/20 p-2 text-[#a8b3af] transition hover:bg-[#1B4D3E]/35 hover:text-[#f5f5f0]">
                <BellIcon className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </button>
              <ThemeToggle />
            </div>
          </div>

          <nav className="no-scrollbar mt-3 flex gap-1 overflow-x-auto pb-1">
            {links.map((link) => {
              const active = isActivePath(pathname, link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition",
                    active
                      ? "border-[#D4A574]/45 bg-[#1B4D3E]/50 text-[#f5f5f0]"
                      : "border-transparent bg-[#02120e]/40 text-[#a8b3af] hover:border-[#D4A574]/20 hover:text-[#f5f5f0]",
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-[#D4A574]" : "text-[#8d9a95]")} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    );
  }

  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] flex-col rounded-3xl border border-[#D4A574]/20 bg-[#02120e]/75 p-4 shadow-[0_16px_48px_rgba(0,0,0,0.5)] backdrop-blur lg:flex">
      <Link href="/" className="flex items-center gap-3 rounded-xl border border-[#D4A574]/15 bg-[#1B4D3E]/25 px-3 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#D4A574] to-[#C85A3A] text-xs font-bold text-[#02120e]">
          EN
        </span>
        <div>
          <p className="font-semibold text-[#f5f5f0]">envii</p>
          <p className="text-xs text-[#a8b3af]">private env control</p>
        </div>
      </Link>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-[#D4A574]/10 bg-[#02120e]/60 px-3 py-2">
        <Badge variant="muted">Private Mode</Badge>
        <button className="rounded-full border border-[#D4A574]/20 p-2 text-[#a8b3af] transition hover:bg-[#1B4D3E]/35 hover:text-[#f5f5f0]">
          <BellIcon className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </button>
      </div>

      <nav className="mt-4 space-y-1">
        {links.map((link) => {
          const active = isActivePath(pathname, link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "border-[#D4A574]/45 bg-[#1B4D3E]/45 text-[#f5f5f0]"
                  : "border-transparent bg-transparent text-[#a8b3af] hover:border-[#D4A574]/15 hover:bg-[#1B4D3E]/20 hover:text-[#f5f5f0]",
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-[#D4A574]" : "text-[#8d9a95]")} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2">
        <div className="rounded-xl border border-[#D4A574]/15 bg-[#1B4D3E]/20 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#D4A574]">
            Secure Flow
          </p>
          <p className="mt-1 text-xs text-[#a8b3af]">
            Select repo, enter 6-digit PIN, then manage env versions safely.
          </p>
          <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#02120e]/70 px-2 py-1 text-[11px] text-[#8d9a95]">
            <ShieldCheckIcon className="h-3.5 w-3.5 text-[#D4A574]" />
            PIN protected repos
          </div>
        </div>
        <div className="flex items-center justify-end">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
