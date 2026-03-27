import Link from "next/link";
import { ReadOnlyLexicalRenderer } from "@/components/editor/ReadOnlyLexicalRenderer";
import { lexicalComparisonFixtures } from "@/lib/dev/lexicalComparisonFixtures";
import { DetailLexicalViewer } from "dinn-lexical/server";

const fixtureIds = ["detail-showcase", "user-lexical", "user-markdown", "table-editor"] as const;

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
                Compare the two public-facing viewer strategies side by side. The left panel keeps
                the server-generated HTML as the source of truth and only enhances rich embeds on
                the client, while the right panel mounts a Lexical read-only tree in the browser.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-xs font-medium text-slate-600">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  Left: SSR HTML + lightweight CSR enhancement
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  Right: CSR Lexical read-only viewer
                </span>
              </div>
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
                  <div className="mb-4 space-y-2">
                    <div className="text-sm font-medium text-slate-900">DetailLexicalViewer</div>
                    <p className="text-sm leading-6 text-slate-600">
                      Uses the server-rendered article markup first, then hydrates only the parts
                      that need richer client behavior such as tweet cards. This is the detail page
                      strategy for public reading surfaces.
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
                        SSR first
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
                        Non-Lexical hydration
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
                        Public detail viewer
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <DetailLexicalViewer content={content} width="100%" />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 space-y-2">
                    <div className="text-sm font-medium text-slate-900">
                      ReadOnlyLexicalRenderer
                    </div>
                    <p className="text-sm leading-6 text-slate-600">
                      Mounts a full Lexical read-only editor tree on the client. This is useful
                      when the app needs editor-parity rendering or preview behavior inside admin
                      surfaces, but it carries the Lexical runtime cost.
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
                        CSR only
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
                        Lexical runtime
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
                        Admin preview
                      </span>
                    </div>
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
