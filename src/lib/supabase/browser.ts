"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/database";
import { assertPublicSupabaseEnv } from "@/lib/supabase/config";

export function createBrowserSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = assertPublicSupabaseEnv();

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
