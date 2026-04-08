export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const databaseUrl = process.env.DATABASE_URL;

export function hasPublicSupabaseEnv() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function assertPublicSupabaseEnv() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  };
}

export function assertServerSupabaseEnv() {
  const { supabaseUrl: url, supabaseAnonKey: anonKey } = assertPublicSupabaseEnv();

  if (!supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  return {
    supabaseUrl: url,
    supabaseAnonKey: anonKey,
    supabaseServiceRoleKey,
  };
}
