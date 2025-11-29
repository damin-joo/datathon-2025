import Link from "next/link";

export type FillerSection = {
  title: string;
  body: string;
  bullets?: string[];
};

export type FillerAction = {
  label: string;
  href: string;
};

export type FillerContent = {
  eyebrow: string;
  title: string;
  description: string;
  sections: FillerSection[];
  actions?: FillerAction[];
};

export default function FillerPage({ eyebrow, title, description, sections, actions }: FillerContent) {
  return (
    <div className="bg-neutral-50 py-16 px-4 min-h-[70vh]">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <p className="uppercase tracking-[0.4em] text-xs text-emerald-500">{eyebrow}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900">{title}</h1>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">{description}</p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-3">
              <h2 className="text-xl font-semibold text-neutral-900">{section.title}</h2>
              <p className="text-sm text-neutral-600">{section.body}</p>
              {section.bullets && section.bullets.length > 0 && (
                <ul className="list-disc list-inside text-sm text-neutral-700 space-y-1">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>

        {actions && actions.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-full border border-emerald-600 px-5 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                {action.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
