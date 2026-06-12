import { Editor } from "@/components/editor/editor";
import { lexicalComparisonFixtures } from "@/lib/dev/lexicalComparisonFixtures";

export default function LexicalEditableMediaDevPage() {
  const fixture = lexicalComparisonFixtures["user-lexical"];

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Editable Media Fixture
          </p>
          <h1 className="text-3xl font-semibold">{fixture.title}</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Shared editor mounted in editable mode with media nodes including
            image, YouTube, and tweet. This page verifies DecoratorNode rendering
            inside the editor, not the read-only SSR viewer.
          </p>
        </header>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="text-sm font-medium text-slate-900">Editable Editor</div>
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              readOnly=false
            </div>
          </div>
          <div className="h-[760px] rounded-2xl border border-slate-200 bg-white">
            <Editor
              initialEditorState={fixture.content}
              outputFormat="json"
              readOnly={false}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
