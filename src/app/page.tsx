import { LandingShell } from "@/components/landing/landing-shell";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { getHomePageData } from "@/lib/data/workspace";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getHomePageData();

  if (data.kind === "workspace") {
    return <WorkspaceShell initialData={data} />;
  }

  return <LandingShell mode={data.kind} />;
}
