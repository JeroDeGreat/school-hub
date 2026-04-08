import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import type { WorkspaceView } from "@/components/workspace/workspace-types";
import { getDemoWorkspaceData } from "@/lib/data/demo-workspace";

const allowedViews: WorkspaceView[] = ["chat", "assignments", "help", "notifications"];

export const dynamic = "force-dynamic";

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const requestedView = allowedViews.find((view) => view === params.view) ?? "chat";

  return (
    <WorkspaceShell
      initialData={getDemoWorkspaceData()}
      mode="demo"
      initialView={requestedView}
    />
  );
}
