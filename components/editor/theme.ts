export const theme = {
  ltr: "ltr",
  rtl: "rtl",
  placeholder: "editor-placeholder",
  // Modern: Ultra-compact text size (15px), relaxed leading
  paragraph:
    "mb-6 text-[15px] leading-[1.8] text-slate-700 dark:text-slate-300 tracking-normal",
  quote: "not-prose blockquote-fancy",
  heading: {
    h1: "font-heading scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl mb-4 mt-10 md:mt-12 text-slate-900 dark:text-white first:mt-0",
    h2: "font-heading scroll-m-20 text-xl font-bold tracking-tight mb-3 mt-10 md:mt-12 text-slate-900 dark:text-white",
    h3: "font-heading scroll-m-20 text-lg font-bold tracking-tight mb-2 mt-8 text-slate-900 dark:text-white",
    h4: "font-heading scroll-m-20 text-base font-bold tracking-tight mb-2 mt-6 text-slate-900 dark:text-white",
    h5: "font-heading scroll-m-20 text-sm font-bold tracking-tight mb-2 mt-6 text-slate-900 dark:text-white",
    h6: "font-heading scroll-m-20 text-xs font-bold tracking-tight mb-2 mt-6 text-slate-900 dark:text-white",
  },
  list: {
    nested: {
      listitem: "list-none",
    },
    // Modern: Ultra-compact list spacing
    ol: "list-decimal list-outside ml-5 mb-6 text-slate-700 dark:text-slate-300 space-y-0.5",
    ul: "list-disc list-outside ml-5 mb-6 text-slate-700 dark:text-slate-300 space-y-0.5",
    listitem: "pl-1 leading-relaxed text-[15px]",
  },
  image:
    "editor-image block w-full max-w-[400px] max-w-full max-h-[600px] flex my-8",
  // Modern: Subtle link style, color accent
  link: "font-medium text-teal-600 dark:text-teal-400 hover:underline decoration-2 underline-offset-4 cursor-pointer transition-colors",
  // Modern: Table styles
  table:
    "w-full text-left border-collapse border border-slate-200 dark:border-slate-800 my-4 text-[15px]",
  tableCell:
    "border-b border-r border-slate-200 dark:border-slate-800 px-3 py-2 last:border-r-0",
  tableCellHeader:
    "bg-slate-50 dark:bg-slate-900/50 font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800",
  text: {
    bold: "font-bold text-slate-900 dark:text-slate-100",
    italic: "italic",
    overflowed: "editor-text-overflowed",
    hashtag: "editor-text-hashtag",
    underline: "underline underline-offset-4",
    strikethrough: "line-through opacity-70",
    underlineStrikethrough: "underline line-through",
    code: "relative rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[15px] font-medium text-slate-900 dark:text-slate-100 ring-1 ring-inset ring-slate-200 dark:ring-slate-700/30",
  },
  // Modern: Mac-window style dark code block - Compact
  code: "block w-full whitespace-pre relative rounded-lg bg-zinc-900 dark:bg-zinc-950 px-4 py-3 font-mono text-[14px] leading-[1.5] tracking-normal text-gray-50 my-4 overflow-x-auto shadow-sm border border-slate-200/10 dark:border-slate-800",
  codeHighlight: {
    atrule: "code-token-atrule",
    attr: "code-token-attr",
    "attr-name": "code-token-attr",
    "attr-value": "code-token-string",
    boolean: "code-token-boolean",
    builtin: "code-token-builtin",
    cdata: "code-token-cdata",
    char: "code-token-char",
    class: "code-token-class",
    "class-name": "code-token-class-name",
    "known-class-name": "code-token-class-name",
    "maybe-class-name": "code-token-class-name",
    comment: "code-token-comment",
    constant: "code-token-constant",
    deleted: "code-token-deleted",
    doctype: "code-token-doctype",
    entity: "code-token-entity",
    function: "code-token-function",
    important: "code-token-important",
    inserted: "code-token-inserted",
    keyword: "code-token-keyword",
    namespace: "code-token-namespace",
    number: "code-token-number",
    operator: "code-token-operator",
    prolog: "code-token-prolog",
    property: "code-token-property",
    punctuation: "code-token-punctuation",
    "template-punctuation": "code-token-string",
    "template-string": "code-token-string",
    parameter: "code-token-variable",
    regex: "code-token-regex",
    selector: "code-token-selector",
    string: "code-token-string",
    symbol: "code-token-symbol",
    tag: "code-token-tag",
    url: "code-token-url",
    variable: "code-token-variable",
  },
};

export default theme;
