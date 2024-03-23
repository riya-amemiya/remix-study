import type { createServerClient } from "@supabase/auth-helpers-remix";

import type { Database } from "./supabase";

export type RootContext = {
  supabase: ReturnType<typeof createServerClient<Database>>;
};
