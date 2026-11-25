import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/components/q/AccountProvider";

export type ArtistPlan = "free" | "pro";

/** An artist's plan. Plans can only be changed by quadreria (no owner writes), so this is safe to trust for UI. */
export const planQuery = (artistId: string) =>
  queryOptions({
    queryKey: ["artist-plan", artistId],
    enabled: !!artistId,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<ArtistPlan> => {
      const { data, error } = await supabase.rpc("artist_plan", { artist_id: artistId });
      if (error) throw error;
      return data === "pro" ? "pro" : "free";
    },
  });

/** The signed-in artist's plan; "free" while loading or on error. */
export function usePlan(): ArtistPlan {
  const { user } = useAccount();
  return useQuery(planQuery(user?.id ?? "")).data ?? "free";
}
