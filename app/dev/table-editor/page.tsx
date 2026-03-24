import { Editor } from "@/components/editor/editor";
import { lexicalComparisonFixtures } from "@/lib/dev/lexicalComparisonFixtures";

export default function TableEditorDevPage() {
  const fixture = lexicalComparisonFixtures["table-editor"];

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Editable Table Fixture
          </p>
          <h1 className="text-3xl font-semibold">{fixture.title}</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Shared editor mounted with the table fixture so editable DOM sizing can be measured
            directly.
          </p>
        </header>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-sm font-medium text-slate-900">Editor</div>
          <div className="h-[720px] rounded-2xl border border-slate-200 bg-white">
            <Editor initialEditorState={fixture.content} outputFormat="json" />
          </div>
        </section>
      </div>
    </main>
  );
}
