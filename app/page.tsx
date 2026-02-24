"use client";

import type { LucideIcon } from "lucide-react";
import {
  ActivityIcon,
  ArrowRightIcon,
  CheckIcon,
  CloudUploadIcon,
  GitForkIcon,
  LockIcon,
  PlayIcon,
  SparklesIcon,
  TerminalIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type FeatureCard = {
  title: string;
  body: string;
  metric: string;
  icon: LucideIcon;
};

type PlaybookKey = "collab" | "templates" | "safety";
type BillingCycle = "monthly" | "annual";
type PlanKey = "starter" | "pro" | "team";

type CommandSample = {
  id: string;
  command: string;
  label: string;
  output: string[];
};

const features: FeatureCard[] = [
  {
    title: "Intelligent Backup Engine",
    body: "Continuously captures env snapshots with version history and optional client-side encryption.",
    metric: "99.99% backup integrity",
    icon: LockIcon,
  },
  {
    title: "CLI + Dashboard Workflow",
    body: "Push updates from your terminal and immediately inspect diffs, activity, and rollbacks in the web UI.",
    metric: "1.8s average sync",
    icon: CloudUploadIcon,
  },
  {
    title: "Team Operations Center",
    body: "Collaborate on fixes with comments, approvals, audit logs, and shared remediation playbooks.",
    metric: "Live collaboration",
    icon: UsersIcon,
  },
];

const playbookTabs: Record<
  PlaybookKey,
  { title: string; tagline: string; body: string; details: string; code: string }
> = {
  collab: {
    title: "Real-time collaboration",
    tagline: "Edit scripts together with live cursors and versioned saves.",
    body: "During incidents, everyone on call sees edits instantly and can review changes before deployment.",
    details:
      "Inline comments and saved versions make rollback and handoff safer when incidents overlap shifts.",
    code: `// shared live script
const s = Envii.Script.open("recover-workers");

s.apply("restartWorkers()", { user: "sys_admin" });
s.comment(2, "Checking memory thresholds");
s.save("v1.2.1", "Added safety verification");`,
  },
  templates: {
    title: "Parameterized templates",
    tagline: "Reusable playbooks with typed inputs and sensible defaults.",
    body: "Publish runbooks once and reuse them across projects without rewriting scripts per environment.",
    details:
      "Typed params validate values before execution and lock every run to immutable audit metadata.",
    code: `type Params = { service: "api" | "worker"; region: string };

const template = Envii.Template.use<Params>("scale-service");
template.run({ service: "worker", region: "us-east-1" });`,
  },
  safety: {
    title: "Safety and approvals",
    tagline: "Dry runs, blast-radius checks, and multi-step approvals.",
    body: "Protect production actions with policy checks and approval gates before any high-risk command runs.",
    details: "Every decision is logged for compliance and post-incident review.",
    code: `const runbook = Envii.Playbook("db-failover");
runbook.requireApproval({ teams: ["SRE"], min: 2 });
runbook.dryRun().assert("replicasHealthy > 2");
runbook.execute();`,
  },
};

const pricing: Record<
  PlanKey,
  {
    name: string;
    tagline: string;
    monthly: number;
    annual: number;
    cta: string;
    features: string[];
  }
> = {
  starter: {
    name: "Starter",
    tagline: "Best for solo builders and small apps.",
    monthly: 0,
    annual: 0,
    cta: "Start Free",
    features: [
      "1 private repo + public repos",
      "30-day snapshot history",
      "Basic backup + restore commands",
      "Community support",
    ],
  },
  pro: {
    name: "Pro",
    tagline: "For teams shipping production workloads.",
    monthly: 2400,
    annual: 24000,
    cta: "Choose Pro",
    features: [
      "Unlimited repos and environments",
      "Advanced automation playbooks",
      "Approval workflows + audit exports",
      "Priority support",
    ],
  },
  team: {
    name: "Team",
    tagline: "For larger orgs with strict governance.",
    monthly: 4000,
    annual: 40000,
    cta: "Talk to Sales",
    features: [
      "Role-based access controls",
      "Org-wide policy enforcement",
      "SOC2-ready audit trails",
      "Dedicated onboarding support",
    ],
  },
};

const cliSamples: CommandSample[] = [
  {
    id: "login",
    command: "envii login",
    label: "Authenticate and persist local CLI config",
    output: [
      "Logged in as sre@company.dev",
      "Config stored at C:\\Users\\USER\\.envii\\config.json",
    ],
  },
  {
    id: "init",
    command: "envii init --repo payments-api --environment production",
    label: "Bootstrap project metadata and defaults",
    output: [
      "Created .env.example",
      'Initialized envii for repo "payments-api" (production)',
    ],
  },
  {
    id: "commit",
    command: 'envii commit -m "Rotate JWT secret"',
    label: "Stage commit message for next push",
    output: ["Commit message staged for next push."],
  },
  {
    id: "push",
    command: "envii push",
    label: "Sync latest env snapshot to envii",
    output: ["Backed up payments-api (production) at version 42."],
  },
  {
    id: "pull",
    command: "envii pull",
    label: "Restore latest remote snapshot locally",
    output: ["Pulled latest env for payments-api into .env"],
  },
];

const typedPhrases = [
  "Optimizing query performance...",
  "Validating rollback safety...",
  "Syncing env snapshots...",
];

function formatPlanPrice(value: number) {
  if (value === 0) return "Free";
  return `NGN ${value.toLocaleString("en-US")}`;
}

export default function HomePage() {
  const [activePlaybook, setActivePlaybook] = useState<PlaybookKey>("collab");
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [activePlan, setActivePlan] = useState<PlanKey>("starter");
  const [activeCommandId, setActiveCommandId] = useState<string>(cliSamples[0]?.id ?? "login");
  const [typedMessage, setTypedMessage] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);

  useEffect(() => {
    const current = typedPhrases[typingIndex] ?? typedPhrases[0];
    const isDone = typedMessage.length >= current.length;
    const delay = isDone ? 1600 : 55;

    const timer = window.setTimeout(() => {
      if (isDone) {
        setTypedMessage("");
        setTypingIndex((prev) => (prev + 1) % typedPhrases.length);
        return;
      }
      setTypedMessage(current.slice(0, typedMessage.length + 1));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [typedMessage, typingIndex]);

  const playbook = playbookTabs[activePlaybook];
  const currentPlan = pricing[activePlan];
  const currentPrice = billing === "monthly" ? currentPlan.monthly : currentPlan.annual;
  const currentPriceLabel = billing === "monthly" ? "/month" : "/year";

  const activeCommand = useMemo(
    () => cliSamples.find((sample) => sample.id === activeCommandId) ?? cliSamples[0],
    [activeCommandId],
  );

  return (
    <div className="space-y-8 pb-8">
      <section className="relative overflow-hidden rounded-3xl border border-[#D4A574]/20 bg-[#02120e] p-6 sm:p-8 md:p-10">
        <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-[#1B4D3E]/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-[#D4A574]/20 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge className="border-[#D4A574]/30 bg-[#D4A574]/15 text-[#f3d2a6]">envii automation</Badge>
              <Badge variant="muted" className="border-[#D4A574]/20 bg-[#1B4D3E]/40 text-[#d9c5a7]">
                CLI + dashboard synced
              </Badge>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[#f9f8f4] sm:text-5xl md:text-6xl">
                <span className="block">Solve faster.</span>
                <span className="block bg-gradient-to-r from-[#D4A574] to-[#C85A3A] bg-clip-text text-transparent">
                  Ship smarter.
                </span>
              </h1>
              <p className="max-w-2xl text-base text-[#b2b9b4] md:text-lg">
                Envii turns env operations into predictable workflows with versioned backups, safe
                rollbacks, and team approvals for production changes.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-gradient-to-r from-[#D4A574] to-[#C85A3A] text-[#02120e] hover:brightness-110">
                <Link href="/dashboard">
                  Open Dashboard <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-[#D4A574]/30 bg-[#1B4D3E]/20 text-[#e8ddcd] hover:bg-[#1B4D3E]/35"
              >
                <Link href="/explore">
                  See It In Action <PlayIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-[#d6b68f] hover:bg-[#1B4D3E]/20 hover:text-[#f6e5cc]">
                <Link href="/billing">View Pricing</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 text-xs text-[#d6c4ab]">
              <span className="float-chip-1 rounded-full border border-[#D4A574]/25 bg-[#1B4D3E]/30 px-3 py-1">
                Automated backups
              </span>
              <span className="float-chip-2 rounded-full border border-[#D4A574]/25 bg-[#1B4D3E]/30 px-3 py-1">
                Approval gates
              </span>
              <span className="float-chip-3 rounded-full border border-[#D4A574]/25 bg-[#1B4D3E]/30 px-3 py-1">
                Zero-downtime restores
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#D4A574]/20 bg-[#010b09]/90 p-4 shadow-[0_20px_70px_-35px_rgba(0,0,0,0.8)]">
            <div className="mb-3 flex items-center justify-between border-b border-[#D4A574]/10 pb-3 text-xs text-[#809188]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#C85A3A]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#D4A574]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#1B4D3E]" />
              </div>
              <span>recover-workers.playbook</span>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-[#D4A574]/10 bg-[#02120e] p-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <p className="text-[#D4A574]">Automation status</p>
                  <span className="inline-flex items-center gap-1 text-[#a8b3af]">
                    <ActivityIcon className="h-3.5 w-3.5 text-[#D4A574]" />
                    healthy
                  </span>
                </div>
                <p className="font-mono text-xs text-[#e6e2d8]">{typedMessage}</p>
              </div>

              <pre className="overflow-x-auto rounded-xl border border-[#D4A574]/10 bg-black/35 p-4 font-mono text-xs text-[#e7e7e4]">
                <code>{`const backup = Envii.Script.open("recover-workers");

backup.apply("restartWorkers()", { user: "sys_admin" });
backup.save("v1.2.1", "Added safety verification");`}</code>
              </pre>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg border border-[#D4A574]/10 bg-[#1B4D3E]/20 p-2">
                  <p className="text-[#6e7d78]">Success</p>
                  <p className="mt-1 text-[#f4e0c2]">99.9%</p>
                </div>
                <div className="rounded-lg border border-[#D4A574]/10 bg-[#1B4D3E]/20 p-2">
                  <p className="text-[#6e7d78]">Latency</p>
                  <p className="mt-1 text-[#f4e0c2]">1.8s</p>
                </div>
                <div className="rounded-lg border border-[#D4A574]/10 bg-[#1B4D3E]/20 p-2">
                  <p className="text-[#6e7d78]">Editors</p>
                  <p className="mt-1 text-[#f4e0c2]">3 live</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <article
              key={feature.title}
              className="relative overflow-hidden rounded-2xl border border-[#D4A574]/15 bg-[#041712] p-5"
            >
              <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-full bg-[#D4A574]/10 blur-2xl" />
              <div className="relative">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4A574]/15 text-[#f2cd97]">
                  <Icon className="h-4 w-4" />
                </div>
                <h2 className="text-xl font-semibold text-[#f8f6f2]">{feature.title}</h2>
                <p className="mt-2 text-sm text-[#a8b3af]">{feature.body}</p>
                <p className="mt-4 inline-flex rounded-full border border-[#D4A574]/25 bg-[#1B4D3E]/30 px-3 py-1 text-xs text-[#dfc59f]">
                  {feature.metric}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      <section
        id="cli"
        className="relative overflow-hidden rounded-3xl border border-[#D4A574]/20 bg-[#02120e] p-6 sm:p-8 md:p-10"
      >
        <div className="pointer-events-none absolute -right-16 top-6 h-56 w-56 rounded-full bg-[#1B4D3E]/35 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <p className="inline-flex items-center rounded-full border border-[#D4A574]/25 bg-[#1B4D3E]/30 px-3 py-1 text-xs text-[#e5cda8]">
              CLI command center
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#f7f3eb] sm:text-4xl">
              Run commands, inspect outputs, ship safely.
            </h2>
            <p className="text-sm text-[#a8b3af] md:text-base">
              This section is wired to actual envii command behavior. Click any command to preview the
              output your team sees in terminal workflows.
            </p>
            <div className="space-y-2">
              {cliSamples.map((sample) => {
                const isActive = sample.id === activeCommand.id;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => setActiveCommandId(sample.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-[#D4A574]/35 bg-[#1B4D3E]/35"
                        : "border-[#D4A574]/10 bg-[#02120e]/55 hover:border-[#D4A574]/25 hover:bg-[#1B4D3E]/20"
                    }`}
                  >
                    <p className="font-mono text-xs text-[#f1d8b3]">$ {sample.command}</p>
                    <p className="mt-1 text-xs text-[#93a39d]">{sample.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#D4A574]/20 bg-[#010b09] shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between border-b border-[#D4A574]/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#C85A3A]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#D4A574]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#1B4D3E]" />
              </div>
              <span className="inline-flex items-center gap-2 text-xs text-[#83938d]">
                <TerminalIcon className="h-3.5 w-3.5 text-[#D4A574]" />
                envii-cli
              </span>
            </div>
            <div className="space-y-4 p-4 font-mono text-xs text-[#e7e5e1]">
              <p className="text-[#f2d9b2]">$ {activeCommand.command}</p>
              <div className="space-y-2">
                {activeCommand.output.map((line) => (
                  <p key={`${activeCommand.id}-${line}`} className="rounded-md bg-[#02120e]/70 px-3 py-2 text-[#d5e2dc]">
                    {line}
                  </p>
                ))}
              </div>
              <div className="rounded-lg border border-[#1B4D3E] bg-[#1B4D3E]/25 px-3 py-2 text-[11px] text-[#9db1aa]">
                Tip: use <span className="text-[#f0cca0]">envii watch</span> to track file changes and trigger
                guided backup prompts automatically.
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-[#D4A574]/10 px-4 py-3">
              <Badge className="border-[#1B4D3E] bg-[#1B4D3E]/35 text-[#d7efe5]">
                <ZapIcon className="mr-1 h-3.5 w-3.5" />
                Realtime sync
              </Badge>
              <Badge className="border-[#D4A574]/30 bg-[#D4A574]/10 text-[#f0d4ad]">
                <CheckIcon className="mr-1 h-3.5 w-3.5" />
                Output verified
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#D4A574]/20 bg-[#02120e]">
        <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-2 md:p-10">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight text-[#f7f4ee] sm:text-4xl">
              Automation playbooks
            </h2>
            <p className="text-sm text-[#a8b3af] md:text-base">
              Build, test, and run safe automations that convert incident alerts into structured recovery.
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(playbookTabs) as PlaybookKey[]).map((key) => {
                const isActive = key === activePlaybook;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActivePlaybook(key)}
                    className={`rounded-xl border px-3 py-2 text-sm transition ${
                      isActive
                        ? "border-[#D4A574]/30 bg-[#1B4D3E]/35 text-[#eac89a]"
                        : "border-[#D4A574]/10 bg-[#02120e]/70 text-[#a8b3af] hover:border-[#D4A574]/20 hover:text-[#eac89a]"
                    }`}
                  >
                    {playbookTabs[key].title}
                  </button>
                );
              })}
            </div>
            <div className="space-y-3 rounded-xl border border-[#D4A574]/10 bg-[#041a14] p-4">
              <p className="text-xs uppercase tracking-wide text-[#D4A574]">{playbook.tagline}</p>
              <p className="text-sm text-[#c8d1cc]">{playbook.body}</p>
              <p className="text-sm text-[#9eb0a8]">{playbook.details}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-[#D4A574]/15 bg-[#010b09] p-4">
            <div className="mb-3 flex items-center justify-between text-xs text-[#8d9f99]">
              <span className="inline-flex items-center gap-1 text-[#D4A574]">
                <SparklesIcon className="h-3.5 w-3.5" />
                {playbook.title}
              </span>
              <span>TypeScript</span>
            </div>
            <pre className="overflow-x-auto rounded-xl border border-[#D4A574]/10 bg-black/35 p-4 font-mono text-xs text-[#e6e5e1]">
              <code>{playbook.code}</code>
            </pre>
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="relative overflow-hidden rounded-3xl border border-[#D4A574]/20 bg-[#02120e] p-6 sm:p-8 md:p-10"
      >
        <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-[#1B4D3E]/30 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-[#f8f5ee] sm:text-4xl">
                Transparent pricing for every stage.
              </h2>
              <p className="text-sm text-[#a8b3af] md:text-base">
                Start free, upgrade as your team scales, and keep predictable billing across CLI and web.
              </p>
            </div>

            <div className="inline-flex items-center gap-1 rounded-lg border border-[#D4A574]/15 bg-[#1B4D3E]/20 p-1 text-xs">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`rounded px-3 py-1.5 font-semibold transition ${
                  billing === "monthly" ? "bg-[#D4A574] text-[#02120e]" : "text-[#b5c0bb] hover:text-[#e9d0ac]"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBilling("annual")}
                className={`rounded px-3 py-1.5 font-semibold transition ${
                  billing === "annual" ? "bg-[#D4A574] text-[#02120e]" : "text-[#b5c0bb] hover:text-[#e9d0ac]"
                }`}
              >
                Annual
              </button>
            </div>

            <div className="space-y-2">
              {(Object.keys(pricing) as PlanKey[]).map((planKey) => {
                const plan = pricing[planKey];
                const selected = planKey === activePlan;
                return (
                  <button
                    key={planKey}
                    type="button"
                    onClick={() => setActivePlan(planKey)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                      selected
                        ? "border-[#D4A574]/35 bg-[#1B4D3E]/30"
                        : "border-[#D4A574]/10 bg-[#02120e]/40 hover:border-[#D4A574]/20 hover:bg-[#1B4D3E]/20"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-[#f6f3eb]">{plan.name}</p>
                      <p className="text-xs text-[#92a39d]">{plan.tagline}</p>
                    </div>
                    <ArrowRightIcon className={`h-4 w-4 ${selected ? "text-[#D4A574]" : "text-[#6f827a]"}`} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#D4A574]/15 bg-gradient-to-br from-[#1B4D3E]/15 to-transparent p-6">
            <p className="text-sm uppercase tracking-wide text-[#D4A574]">{currentPlan.name}</p>
            <div className="mt-4 flex items-end gap-2">
              <p className="text-5xl font-semibold text-[#f5d3a6]">{formatPlanPrice(currentPrice)}</p>
              <p className="pb-1 text-sm text-[#9eaea8]">{currentPrice === 0 ? "" : currentPriceLabel}</p>
            </div>
            <p className="mt-2 text-sm text-[#a8b3af]">{currentPlan.tagline}</p>

            <ul className="mt-6 space-y-3">
              {currentPlan.features.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-[#dde2de]">
                  <CheckIcon className="mt-0.5 h-4 w-4 text-[#D4A574]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="bg-[#D4A574] text-[#02120e] hover:bg-[#C85A3A]">
                <Link href="/billing">
                  {currentPlan.cta} <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-[#D4A574]/25 bg-transparent text-[#e6d8c1] hover:bg-[#1B4D3E]/25"
              >
                <Link href="/dashboard">Open billing dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#D4A574]/15 bg-[#02120e] p-6 text-center sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#D4A574]">Ready to automate your env workflow?</p>
        <h2 className="mt-3 text-3xl font-semibold text-[#f6f4f0] sm:text-4xl">
          Back up. Review. Restore. Repeat with confidence.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-[#a8b3af] md:text-base">
          envii gives your team a single system for env history, approvals, and operational safety across
          CLI and dashboard workflows.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild className="bg-[#D4A574] text-[#02120e] hover:bg-[#C85A3A]">
            <Link href="/login">
              Get Started <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="text-[#d3bc96] hover:bg-[#1B4D3E]/20 hover:text-[#f4dbb5]">
            <Link href="/explore">
              Explore public repos <GitForkIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
