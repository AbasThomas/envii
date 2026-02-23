"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { PlusIcon, RefreshCcwIcon } from "lucide-react";
import toast from "react-hot-toast";

import { RepoList } from "@/components/repo-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetcher } from "@/lib/fetcher";

type RepoResponse = {
  repos: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    tags: string[];
    isPublic: boolean;
    _count: { stars: number; envs: number; forks: number };
  }>;
};

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const reposQuery = useQuery({
    queryKey: ["repos"],
    queryFn: () => fetcher<RepoResponse>("/api/repos"),
  });

  const createRepoMutation = useMutation({
    mutationFn: async (payload: { name: string }) => {
      return fetcher("/api/repos", {
        method: "POST",
        body: JSON.stringify({
          name: payload.name,
          tags: [],
          isPublic: false,
        }),
      });
    },
    onSuccess: () => {
      toast.success("Repository created");
      queryClient.invalidateQueries({ queryKey: ["repos"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Create failed");
    },
  });

  const repos = reposQuery.data?.repos ?? [];

  return (
    <div className="space-y-5">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-3 md:grid-cols-[1fr_auto]"
      >
        <Card className="glass">
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>Manage backups, commits, team access, and integrations.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            <Badge>Auto backup ready</Badge>
            <Badge variant="muted">CLI synced</Badge>
            <Badge variant="success">Realtime enabled</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Create</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input
              placeholder="repo-name"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  const target = event.target as HTMLInputElement;
                  if (!target.value.trim()) return;
                  createRepoMutation.mutate({ name: target.value.trim() });
                  target.value = "";
                }
              }}
            />
            <Button
              onClick={(event) => {
                const input = (event.currentTarget.previousElementSibling as HTMLInputElement) ?? null;
                if (!input?.value.trim()) return;
                createRepoMutation.mutate({ name: input.value.trim() });
                input.value = "";
              }}
              disabled={createRepoMutation.isPending}
            >
              <PlusIcon className="mr-1 h-4 w-4" />
              New
            </Button>
          </CardContent>
        </Card>
      </motion.section>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Repositories</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => reposQuery.refetch()}
          disabled={reposQuery.isFetching}
        >
          <RefreshCcwIcon className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {reposQuery.isLoading ? (
        <Card>
          <CardContent className="py-8 text-sm text-zinc-400">Loading repositories...</CardContent>
        </Card>
      ) : repos.length ? (
        <RepoList repos={repos} />
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-sm text-zinc-400">
            No repositories yet. Create one, then run `envii backup` from your project.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
