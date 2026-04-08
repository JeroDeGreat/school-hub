import Link from "next/link";

const views = [
  { id: "chat", label: "Chat" },
  { id: "assignments", label: "Assignments" },
  { id: "help", label: "Help" },
  { id: "notifications", label: "Alerts" },
] as const;

const roles = [
  { id: "admin", label: "Admin" },
  { id: "teacher", label: "Teacher" },
  { id: "student", label: "Student" },
] as const;

export const dynamic = "force-dynamic";

export default async function PhonePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; view?: string }>;
}) {
  const params = await searchParams;
  const role = roles.find((item) => item.id === params.role)?.id ?? "admin";
  const view = views.find((item) => item.id === params.view)?.id ?? "chat";
  const iframeUrl = `/demo?role=${role}&view=${view}`;

  return (
    <main className="px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <section className="glass-panel-strong rounded-[2.5rem] border border-white/55 p-6 dark:border-white/10">
          <p className="text-xs font-semibold tracking-[0.24em] text-muted uppercase">
            Phone preview
          </p>
          <h1 className="mt-3 text-4xl leading-[0.95] text-foreground">
            A clean one-screen mobile preview for School Hub.
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted">
            This is the fastest way to inspect the app in a phone-sized frame.
            If you are using a separate VS Code Phone View extension, paste the
            demo URL below into that extension instead of this page.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-[0.22em] text-muted uppercase">
                Role
              </p>
              <div className="flex flex-wrap gap-2">
                {roles.map((item) => (
                  <Link
                    key={item.id}
                    href={`/phone?role=${item.id}&view=${view}`}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      role === item.id
                        ? "bg-accent text-white dark:bg-white dark:text-black"
                        : "bg-white/70 text-foreground dark:bg-white/8"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold tracking-[0.22em] text-muted uppercase">
                View
              </p>
              <div className="flex flex-wrap gap-2">
                {views.map((item) => (
                  <Link
                    key={item.id}
                    href={`/phone?role=${role}&view=${item.id}`}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      view === item.id
                        ? "bg-accent text-white dark:bg-white dark:text-black"
                        : "bg-white/70 text-foreground dark:bg-white/8"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] bg-black/4 p-4 dark:bg-white/6">
              <p className="text-sm font-semibold text-foreground">Paste into VS Code Phone View</p>
              <code className="mt-2 block break-all text-xs text-muted">
                http://127.0.0.1:3000{iframeUrl}
              </code>
            </div>
          </div>
        </section>

        <section className="flex justify-center">
          <div className="glass-panel-strong relative w-full max-w-[430px] rounded-[3.2rem] border border-white/60 p-3 shadow-[0_30px_90px_rgba(43,29,72,0.18)] dark:border-white/10">
            <div className="mx-auto mb-3 h-6 w-28 rounded-full bg-black/70 dark:bg-white/75" />
            <iframe
              src={iframeUrl}
              title="School Hub phone preview"
              className="mx-auto block h-[780px] w-full rounded-[2.5rem] border-0 bg-background"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
