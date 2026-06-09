import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAuthenticatedUserEmail(
  supabase: SupabaseClient
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.email ?? null;
}
