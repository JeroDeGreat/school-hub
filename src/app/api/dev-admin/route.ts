import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { assertServerSupabaseEnv } from "@/lib/supabase/config";
import type { Database } from "@/lib/types/database";

const testAdmin = {
  email: "admin@classloop.local",
  password: "ClassLoopAdmin123!",
  handle: "classloopadmin",
  fullName: "ClassLoop Admin",
  headline: "Local testing account",
};

const starterDepartments: Database["public"]["Tables"]["departments"]["Insert"][] =
  [
    {
      slug: "general-lobby",
      name: "General Lobby",
      description: "School-wide updates, huddles, and announcements.",
      color: "#d9caee",
      is_lobby: true,
    },
    {
      slug: "creative-studio",
      name: "Creative Studio",
      description: "Creative briefs, critique, and shared resources.",
      color: "#efbfd3",
      is_lobby: false,
    },
    {
      slug: "science-lab",
      name: "Science Lab",
      description: "Research updates, lab support, and tutoring threads.",
      color: "#bfe0e4",
      is_lobby: false,
    },
  ];

function isLocalRequest(request: Request) {
  const host = request.headers.get("host") ?? "";
  const hostname = host.split(":")[0];

  return hostname === "localhost" || hostname === "127.0.0.1";
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production" || !isLocalRequest(request)) {
    return NextResponse.json(
      { error: "Local admin bootstrap is only available on localhost." },
      { status: 403 },
    );
  }

  try {
    const { supabaseUrl, supabaseServiceRoleKey } = assertServerSupabaseEnv();
    const admin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const existingProfile = await admin
      .from("users")
      .select("id")
      .eq("email", testAdmin.email)
      .maybeSingle();

    if (existingProfile.error) {
      throw existingProfile.error;
    }

    let userId = existingProfile.data?.id ?? null;

    if (userId) {
      const updateResult = await admin.auth.admin.updateUserById(userId, {
        email: testAdmin.email,
        password: testAdmin.password,
        email_confirm: true,
        user_metadata: {
          full_name: testAdmin.fullName,
        },
      });

      if (updateResult.error) {
        throw updateResult.error;
      }
    } else {
      const createResult = await admin.auth.admin.createUser({
        email: testAdmin.email,
        password: testAdmin.password,
        email_confirm: true,
        user_metadata: {
          full_name: testAdmin.fullName,
        },
      });

      if (createResult.error || !createResult.data.user) {
        throw createResult.error ?? new Error("Could not create the admin test user.");
      }

      userId = createResult.data.user.id;
    }

    if (!userId) {
      throw new Error("Could not resolve the admin test user ID.");
    }

    const departmentResult = await admin
      .from("departments")
      .upsert(starterDepartments, { onConflict: "slug" })
      .select("id");

    if (departmentResult.error) {
      throw departmentResult.error;
    }

    const profileResult = await admin.from("users").upsert(
      {
        id: userId,
        email: testAdmin.email,
        handle: testAdmin.handle,
        full_name: testAdmin.fullName,
        role: "admin",
        headline: testAdmin.headline,
        points: 500,
      },
      { onConflict: "id" },
    );

    if (profileResult.error) {
      throw profileResult.error;
    }

    const memberships = (departmentResult.data ?? []).map((department) => ({
      department_id: department.id,
      user_id: userId,
      role: "admin" as const,
    }));

    if (memberships.length > 0) {
      const membershipResult = await admin
        .from("memberships")
        .upsert(memberships, { onConflict: "department_id,user_id" });

      if (membershipResult.error) {
        throw membershipResult.error;
      }
    }

    return NextResponse.json({
      email: testAdmin.email,
      password: testAdmin.password,
      role: "admin",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create the admin test account.",
      },
      { status: 500 },
    );
  }
}
