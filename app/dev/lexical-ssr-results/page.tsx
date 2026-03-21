import Link from "next/link";
import { ReadOnlyLexicalRenderer } from "@/components/editor/ReadOnlyLexicalRenderer";
import { ServerGeneratedLexicalHtml } from "@/components/editor/ui/ServerGeneratedLexicalHtml";
import { lexicalComparisonFixtures } from "@/lib/dev/lexicalComparisonFixtures";

const fixtureIds = ["user-lexical", "user-markdown", "table-editor"] as const;

export default function LexicalSsrResultsPage() {
  const fixtures = fixtureIds.map((id) => lexicalComparisonFixtures[id]);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Lexical Render Results
          </p>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold">Server vs Client Render View</h1>
              <p className="max-w-3xl text-sm text-slate-600">
                Two fixture cases are rendered side by side so you can visually compare the
                server-generated Lexical HTML and the hydrated read-only Lexical editor output.
              </p>
            </div>
            <Link
              href="/dev/lexical-ssr-compare?fixture=user-lexical"
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
            >
              Open DOM Test Route
            </Link>
          </div>
        </header>

        {fixtures.map((fixture) => {
          const content = fixture.content || fixture.markdown || "";

          return (
            <section
              key={fixture.id}
              className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-5 flex flex-col gap-2 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">{fixture.title}</h2>
                  <p className="text-sm text-slate-600">
                    Fixture id: <span className="font-medium text-slate-900">{fixture.id}</span>
                  </p>
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Source: {fixture.kind}
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 text-sm font-medium text-slate-900">
                    ServerGeneratedLexicalHtml
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <ServerGeneratedLexicalHtml content={content} />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 text-sm font-medium text-slate-900">
                    ReadOnlyLexicalRenderer
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <ReadOnlyLexicalRenderer content={content} />
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
