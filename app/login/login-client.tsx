"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, GithubIcon, MailIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginClient({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setLoading(true);
    try {
      if (mode === "register") {
        const registerResponse = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const registerData = await registerResponse.json();
        if (!registerResponse.ok) {
          throw new Error(registerData.error ?? "Could not create account");
        }
      }

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (!result || result.error) {
        throw new Error(result?.error ?? "Could not sign in");
      }

      toast.success(mode === "register" ? "Account created" : "Signed in");
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4 md:grid-cols-[1.1fr_0.9fr]">
      <Card className="glass border-emerald-800/40">
        <CardHeader>
          <CardTitle className="text-3xl">envii account</CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Welcome back. Continue syncing your env repos."
              : "Create your account and start backing up .env files."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-3" onSubmit={onSubmit}>
            {mode === "register" ? (
              <Input placeholder="Your name" {...form.register("name")} />
            ) : null}
            <Input placeholder="you@example.com" {...form.register("email")} />
            <Input type="password" placeholder="••••••••" {...form.register("password")} />
            <Button className="w-full" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in with email"
                  : "Create account"}
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </form>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="outline" onClick={() => signIn("google", { callbackUrl: nextPath })}>
              <MailIcon className="mr-2 h-4 w-4" />
              Google OAuth
            </Button>
            <Button variant="ghost" onClick={() => setMode(mode === "login" ? "register" : "login")}>
              <GithubIcon className="mr-2 h-4 w-4" />
              {mode === "login" ? "Need an account?" : "Already have an account?"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="grid-bg border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-xl">Keyboard shortcuts</CardTitle>
          <CardDescription>Power features from day one</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-300">
          <p>
            <kbd className="rounded bg-emerald-900/60 px-2 py-1 text-xs text-amber-200">Ctrl/Cmd + K</kbd> command palette
          </p>
          <p>
            <kbd className="rounded bg-emerald-900/60 px-2 py-1 text-xs text-amber-200">Ctrl/Cmd + S</kbd> save env snapshot
          </p>
          <p>
            <kbd className="rounded bg-emerald-900/60 px-2 py-1 text-xs text-amber-200">Esc</kbd> close overlays
          </p>
          <p className="pt-3 text-zinc-400">
            Free tier: 1 public repo • Basic: 5 private repos • Pro/Team: unlimited + social features.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
