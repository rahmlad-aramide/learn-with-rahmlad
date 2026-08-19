import { redirect } from "next/navigation";
import { createServerClientInstance } from "@/lib/supabase/server";
import GoldenGenerationClient, {
  GGLeaderboardEntry,
} from "./GoldenGenerationClient";

export default async function GoldenGenerationPage() {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_golden_generation, first_name")
    .eq("id", user.id)
    .single();

  if (!profile?.is_golden_generation) redirect("/my-learning");

  const [{ data: curriculum }, { data: progress }, { data: leaderboard }] =
    await Promise.all([
      supabase
        .from("gg_curriculum")
        .select("*")
        .order("order_index", { ascending: true }),
      supabase
        .from("gg_progress")
        .select("curriculum_id, completed, completed_at")
        .eq("user_id", user.id),
      supabase.rpc("get_gg_leaderboard"),
    ]);

  return (
    <GoldenGenerationClient
      userId={user.id}
      firstName={profile.first_name}
      curriculum={curriculum ?? []}
      initialProgress={progress ?? []}
      leaderboard={(leaderboard as GGLeaderboardEntry[]) ?? []}
    />
  );
}
