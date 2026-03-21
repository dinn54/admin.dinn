import { ServerGeneratedLexicalHtml } from "@/components/editor/ui/ServerGeneratedLexicalHtml";
import {
  getLexicalComparisonFixture,
  lexicalComparisonFixtures,
} from "@/lib/dev/lexicalComparisonFixtures";
import { HydrationMarker } from "./HydrationMarker";

export default async function LexicalSsrComparePage({
  searchParams,
}: {
  searchParams: Promise<{ fixture?: string }>;
}) {
  const { fixture: fixtureId } = await searchParams;
  const fixture = getLexicalComparisonFixture(fixtureId);
  const content = fixture.content || fixture.markdown || "";

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Lexical SSR Comparison
          </p>
          <h1 className="text-3xl font-semibold">{fixture.title}</h1>
          <p className="max-w-2xl text-sm text-slate-600">
            This page renders a fixed server-side document and is intended for DOM and
            screenshot comparison between SSR-only and hydrated browser output.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <div className="text-sm font-medium text-slate-900">Lexical SSR Output</div>
              <div className="text-xs text-slate-500">source: {fixture.kind}</div>
            </div>
            <article
              data-testid="comparison-root"
              data-fixture={fixture.id}
              className="lexical-render-root"
            >
              <ServerGeneratedLexicalHtml content={content} />
            </article>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <div className="text-sm font-medium text-slate-900">Hydration Status</div>
              <HydrationMarker />
            </div>
            <p className="text-sm text-slate-600">
              This fixture uses the same read-only Lexical renderer for server-side rendering and
              hydration. Compare the DOM with JavaScript disabled versus enabled.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4">
          <div className="mb-3 text-sm text-slate-600">
            Fixture:{" "}
            <span data-testid="fixture-id" className="font-medium text-slate-900">
              {fixture.id}
            </span>
          </div>
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Available fixtures</h2>
          <ul className="flex flex-wrap gap-2 text-sm text-slate-600">
            {Object.keys(lexicalComparisonFixtures).map((id) => (
              <li key={id} className="rounded-full bg-slate-100 px-3 py-1">
                {id}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
