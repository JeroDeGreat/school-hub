const previews = [
  {
    title: "Live chat",
    description: "Department conversation, replies, reactions, and attachments.",
    href: "/demo?view=chat",
  },
  {
    title: "Assignments",
    description: "Publishing work, due dates, and submission cards.",
    href: "/demo?view=assignments",
  },
  {
    title: "Help board",
    description: "Volunteer matching, collaboration points, and support requests.",
    href: "/demo?view=help",
  },
];

function DevicePreview({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <article className="flex min-w-[330px] flex-col gap-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.24em] text-muted uppercase">
          Mobile preview
        </p>
        <h2 className="mt-2 text-2xl">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      </div>
      <div className="glass-panel-strong relative rounded-[3rem] border border-white/60 p-3 shadow-[0_30px_90px_rgba(43,29,72,0.18)] dark:border-white/10">
        <div className="mx-auto mb-3 h-6 w-28 rounded-full bg-black/70 dark:bg-white/75" />
        <iframe
          src={href}
          title={title}
          className="mx-auto block h-[780px] w-full rounded-[2.3rem] border-0 bg-background md:w-[390px]"
        />
      </div>
    </article>
  );
}

export default function PreviewPage() {
  return (
    <main className="px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="glass-panel mb-8 rounded-[2.25rem] border border-white/55 px-6 py-6 dark:border-white/10">
          <p className="text-xs font-semibold tracking-[0.24em] text-muted uppercase">
            School Hub preview
          </p>
          <h1 className="mt-3 max-w-3xl text-5xl leading-[0.95] sm:text-6xl">
            Phone-sized product previews you can inspect right inside the browser.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Start the dev server, open this page, and you will get a mobile-style
            view of the real interface without needing a migrated Supabase schema
            first.
          </p>
        </header>

        <section className="grid gap-6 xl:grid-cols-3">
          {previews.map((preview) => (
            <DevicePreview key={preview.title} {...preview} />
          ))}
        </section>
      </div>
    </main>
  );
}
