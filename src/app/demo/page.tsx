import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import type { WorkspaceView } from "@/components/workspace/workspace-types";
import { getDemoWorkspaceData } from "@/lib/data/demo-workspace";

const allowedViews: WorkspaceView[] = ["chat", "assignments", "help", "notifications"];
const allowedRoles = ["student", "teacher", "admin"] as const;

export const dynamic = "force-dynamic";

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; view?: string }>;
}) {
  const params = await searchParams;
  const requestedView = allowedViews.find((view) => view === params.view) ?? "chat";
  const requestedRole =
    allowedRoles.find((role) => role === params.role) ?? "teacher";

  return (
    <WorkspaceShell
      initialData={getDemoWorkspaceData(requestedRole)}
      mode="demo"
      initialView={requestedView}
    />
  );
}
