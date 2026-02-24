"use client";

import { motion } from "framer-motion";
import { BellIcon, BoltIcon, CompassIcon, HomeIcon, SettingsIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/explore", label: "Explore", icon: CompassIcon },
  { href: "/editor", label: "Editor", icon: BoltIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function NavShell() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-900/30 bg-[#02120e]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="grid h-8 w-8 place-items-center rounded-lg text-white text-base"
            style={{ background: "linear-gradient(135deg, #c8854a, #a03020)" }}
          >
            🌿
          </span>
          <div>
            <p className="font-semibold text-zinc-100">envii</p>
            <p className="text-xs text-zinc-400">GitHub for env files</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:text-zinc-100",
                  active ? "text-zinc-100" : "",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="active-nav-pill"
                    className="absolute inset-0 -z-10 rounded-lg bg-emerald-900/50"
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  />
                ) : null}
                <Icon className={cn("h-4 w-4", active ? "text-amber-400" : "")} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/billing">
            <Badge variant="warning">₦800 Starter</Badge>
          </Link>
          <button className="rounded-full border border-emerald-900/40 p-2 text-zinc-300 hover:bg-emerald-900/30 hover:text-zinc-100">
            <BellIcon className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
