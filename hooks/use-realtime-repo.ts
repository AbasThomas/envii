"use client";

import { useEffect } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type UseRealtimeRepoOptions = {
  repoId: string;
  onMessage: (payload: { type: string; message: string; userId?: string }) => void;
};

export function useRealtimeRepo({ repoId, onMessage }: UseRealtimeRepoOptions) {
  useEffect(() => {
    if (!repoId) return;
    let active = true;

    const client = getSupabaseBrowserClient();
    if (!client) return;
    const channel = client.channel(`repo-${repoId}`);

    channel
      .on("broadcast", { event: "env-update" }, ({ payload }) => {
        if (!active) return;
        onMessage(payload as { type: string; message: string; userId?: string });
      })
      .subscribe();

    return () => {
      active = false;
      client.removeChannel(channel);
    };
  }, [repoId, onMessage]);
}

export async function sendRealtimeRepoEvent(
  repoId: string,
  payload: { type: string; message: string; userId?: string },
) {
  const client = getSupabaseBrowserClient();
  if (!client) return;
  const channel = client.channel(`repo-${repoId}`);
  await channel.subscribe();
  await channel.send({
    type: "broadcast",
    event: "env-update",
    payload,
  });
  await client.removeChannel(channel);
}
