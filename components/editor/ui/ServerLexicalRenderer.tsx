import Image from "next/image";
import Link from "next/link";
import React, { Fragment, Suspense } from "react";
import { TweetEmbed } from "./TweetEmbed";

// Refractor for Server-Side Syntax Highlighting
import { refractor } from "refractor";
import javascript from "refractor/javascript";
import typescript from "refractor/typescript";
import css from "refractor/css";
import markup from "refractor/markup";
import json from "refractor/json";
import jsx from "refractor/jsx";
import tsx from "refractor/tsx";

// Register languages
refractor.register(markup);
refractor.register(javascript);
refractor.register(jsx);
refractor.register(typescript);
refractor.register(tsx);
refractor.register(css);
refractor.register(json);

// Lexical Text Styles Bitmask
const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_STRIKETHROUGH = 4;
const IS_UNDERLINE = 8;
const IS_CODE = 16;
const IS_SUBSCRIPT = 32;
const IS_SUPERSCRIPT = 64;

export interface LexicalNode {
  type: string;
  children?: LexicalNode[];
  text?: string;
  format?: number;
  direction?: "ltr" | "rtl" | null;
  indent?: number;
  tag?: string;
  url?: string;
  target?: string;
  rel?: string;
  src?: string;
  altText?: string;
  height?: number;
  width?: number | "inherit";
  maxWidth?: number;
  videoID?: string;
  tweetID?: string;
  language?: string;
  rows?: LexicalNode[];
  checked?: boolean;
}

// Theme Definition - Synced with theme.ts
export const editorTheme = {
  ltr: "ltr",
  rtl: "rtl",
  placeholder: "editor-placeholder",
  paragraph: "mb-6 text-[15px] leading-[1.8] text-slate-700 dark:text-slate-300 tracking-normal",
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
    ul: "list-disc list-outside ml-5 mb-6 text-slate-700 dark:text-slate-300 space-y-0.5",
    ol: "list-decimal list-outside ml-5 mb-6 text-slate-700 dark:text-slate-300 space-y-0.5",
    listitem: "pl-1 leading-relaxed text-[15px]",
  },
  link: "font-medium text-teal-600 dark:text-teal-400 hover:underline decoration-2 underline-offset-4 cursor-pointer transition-colors",
  text: {
    bold: "font-bold text-slate-900 dark:text-slate-100",
    italic: "italic",
    underline: "underline underline-offset-4",
    strikethrough: "line-through opacity-70",
    underlineStrikethrough: "underline line-through",
    code: "relative rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[15px] font-medium text-slate-900 dark:text-slate-100 ring-1 ring-inset ring-slate-200 dark:ring-slate-700/30",
  },
  code: "block w-full whitespace-pre relative rounded-lg bg-zinc-900 dark:bg-zinc-950 px-4 py-3 font-mono text-[14px] leading-[1.5] tracking-normal text-gray-50 my-4 overflow-x-auto shadow-sm border border-slate-200/10 dark:border-slate-800",
  codeHighlight: {
    atrule: "code-token-atrule",
    attr: "code-token-attr",
    boolean: "code-token-boolean",
    builtin: "code-token-builtin",
    cdata: "code-token-cdata",
    char: "code-token-char",
    class: "code-token-class",
    "class-name": "code-token-class-name",
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
    regex: "code-token-regex",
    selector: "code-token-selector",
    string: "code-token-string",
    symbol: "code-token-symbol",
    tag: "code-token-tag",
    url: "code-token-url",
    variable: "code-token-variable",
  },
};

interface RefractorNode {
  type: string;
  value?: string;
  properties?: { className?: string[] };
  children?: RefractorNode[];
}

export default function ServerLexicalRenderer({ nodes }: { nodes: LexicalNode[] }) {
  if (!nodes || nodes.length === 0) return null;

  return (
    <div className="lexical-theme text-foreground max-w-none">
      {nodes.map((node, index) => (
        <NodeRenderer key={index} node={node} />
      ))}
    </div>
  );
}

function NodeRenderer({ node }: { node: LexicalNode }) {
  switch (node.type) {
    case "root":
      return <>{renderChildren(node)}</>;

    case "heading": {
      const tag = (node.tag || "h1") as keyof typeof editorTheme.heading;
      const HeadingTag = tag;
      const headingClass = editorTheme.heading[tag] || editorTheme.heading.h1;
      const headingText = node.children?.[0]?.text || "";

      return (
        <HeadingTag id={headingText} className={headingClass}>
          {renderChildren(node)}
        </HeadingTag>
      );
    }

    case "paragraph": {
      if (node.children?.length === 0) return <br />;
      const hasBlockChild = node.children?.some((child) =>
        ["image", "youtube", "tweet"].includes(child.type)
      );
      if (hasBlockChild) {
        return <div className={editorTheme.paragraph}>{renderChildren(node)}</div>;
      }
      return <p className={editorTheme.paragraph}>{renderChildren(node)}</p>;
    }

    case "quote":
      return (
        <blockquote className={editorTheme.quote}>
          {renderChildren(node)}
        </blockquote>
      );

    case "list": {
      const isOrdered = node.tag === "ol";
      const ListTag = isOrdered ? "ol" : "ul";
      const listClass = isOrdered ? editorTheme.list.ol : editorTheme.list.ul;
      return <ListTag className={listClass}>{renderChildren(node)}</ListTag>;
    }

    case "listitem":
      return (
        <li
          className={`${editorTheme.list.listitem} ${node.checked !== undefined ? "flex items-center gap-2" : ""}`}
        >
          {node.checked !== undefined && (
            <input
              type="checkbox"
              checked={node.checked}
              readOnly
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
          )}
          <span className={node.checked ? "text-muted-foreground line-through" : ""}>
            {renderChildren(node)}
          </span>
        </li>
      );

    case "link":
    case "autolink":
      return (
        <Link
          href={node.url || "#"}
          target={node.target || "_self"}
          rel={node.rel}
          className={editorTheme.link}
        >
          {renderChildren(node)}
        </Link>
      );

    case "code":
    case "code-highlight": {
      const language = node.language || "javascript";
      const codeContent = node.children?.[0]?.text || "";

      return (
        <div className={editorTheme.code}>
          <pre className="relative">
            {node.language && (
              <div className="text-muted-foreground absolute top-0 right-0 p-1 text-xs uppercase select-none">
                {node.language}
              </div>
            )}
            <code className="block font-mono text-sm leading-tight">
              <CodeHighlighter code={codeContent} language={language} />
            </code>
          </pre>
        </div>
      );
    }

    case "image": {
      const imgWidth = typeof node.width === "number" ? node.width : 500;
      return (
        <figure className="my-8">
          <div
            className="relative inline-block"
            style={{ width: `${imgWidth}px`, maxWidth: "100%" }}
          >
            <Image
              src={node.src || ""}
              alt={node.altText || "이미지"}
              width={imgWidth}
              height={node.height || 0}
              className="w-full h-auto rounded-lg shadow-sm"
              priority={false}
              style={{ height: "auto" }}
            />
          </div>
          {node.altText && (
            <figcaption className="text-muted-foreground mt-2 text-sm">
              {node.altText}
            </figcaption>
          )}
        </figure>
      );
    }

    case "youtube": {
      const videoWidth = typeof node.width === "number" ? node.width : 560;
      return (
        <div
          className="youtube-wrapper relative my-4 inline-block rounded-lg bg-transparent"
          style={{ width: `${videoWidth}px`, maxWidth: "100%" }}
        >
          <div className="relative rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${node.videoID}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube video player"
              className="w-full aspect-video"
            />
          </div>
        </div>
      );
    }

    case "tweet": {
      const tweetWidth = typeof node.width === "number" ? node.width : 450;
      return (
        <div className="my-8">
          <Suspense
            fallback={
              <div
                className="animate-pulse bg-muted rounded-lg h-48 flex items-center justify-center"
                style={{ width: tweetWidth, maxWidth: "100%" }}
              >
                <span className="text-muted-foreground">트윗 로딩 중...</span>
              </div>
            }
          >
            <TweetEmbed id={node.tweetID || ""} width={tweetWidth} />
          </Suspense>
        </div>
      );
    }

    case "horizontalrule":
      return <hr className="border-muted my-10 border-t" />;

    case "table":
      return (
        <div className="border-muted my-6 overflow-x-auto rounded-lg border">
          <table className="divide-muted min-w-full divide-y">
            <tbody className="divide-muted bg-card divide-y">
              {renderChildren(node)}
            </tbody>
          </table>
        </div>
      );

    case "tablerow":
      return <tr>{renderChildren(node)}</tr>;

    case "tablecell":
      return (
        <td className="text-foreground px-6 py-4 text-sm whitespace-nowrap">
          {renderChildren(node)}
        </td>
      );

    case "text":
      return <TextRenderer node={node} />;

    case "linebreak":
      return <br />;

    default:
      return <>{renderChildren(node)}</>;
  }
}

function TextRenderer({ node }: { node: LexicalNode }) {
  let content: React.ReactNode = node.text || "";
  const format = node.format || 0;

  if (format & IS_BOLD)
    content = <strong className={editorTheme.text.bold}>{content}</strong>;
  if (format & IS_ITALIC)
    content = <em className={editorTheme.text.italic}>{content}</em>;
  if (format & IS_STRIKETHROUGH)
    content = <span className={editorTheme.text.strikethrough}>{content}</span>;
  if (format & IS_UNDERLINE)
    content = <span className={editorTheme.text.underline}>{content}</span>;
  if (format & IS_CODE)
    content = <code className={editorTheme.text.code}>{content}</code>;
  if (format & IS_SUBSCRIPT) content = <sub>{content}</sub>;
  if (format & IS_SUPERSCRIPT) content = <sup>{content}</sup>;

  return <Fragment>{content}</Fragment>;
}

function renderChildren(node: LexicalNode) {
  return node.children?.map((child, i) => (
    <NodeRenderer key={i} node={child} />
  ));
}

function CodeHighlighter({ code, language }: { code: string; language: string }) {
  let ast: RefractorNode | null = null;

  try {
    const langMap: Record<string, string> = {
      ts: "tsx",
      typescript: "tsx",
      js: "jsx",
      javascript: "jsx",
      html: "markup",
      xml: "markup",
    };
    const lang = langMap[language] || language;
    ast = refractor.highlight(code, lang);
  } catch {
    return <>{code}</>;
  }

  return (
    <>
      {ast.children?.map((node, i) => (
        <ASTNodeRenderer key={i} node={node} />
      ))}
    </>
  );
}

function ASTNodeRenderer({ node }: { node: RefractorNode }) {
  if (node.type === "text") {
    return <>{node.value}</>;
  }

  if (node.type === "element") {
    const className = node.properties?.className || [];
    let tailwindClass = "";

    if (className.includes("token")) {
      const type = className.find((c: string) => c !== "token" && c !== "plain");

      let mappedType = type;
      if (type === "attr-name") mappedType = "attr";
      if (type === "attr-value") mappedType = "string";
      if (type === "script") mappedType = "variable";
      if (type === "maybe-class-name") mappedType = "class-name";
      if (type === "known-class-name") mappedType = "class-name";
      if (type === "template-string") mappedType = "string";
      if (type === "template-punctuation") mappedType = "string";
      if (type === "parameter") mappedType = "variable";

      if (
        mappedType &&
        editorTheme.codeHighlight[mappedType as keyof typeof editorTheme.codeHighlight]
      ) {
        tailwindClass =
          editorTheme.codeHighlight[mappedType as keyof typeof editorTheme.codeHighlight];
      }
    }

    return (
      <span className={tailwindClass}>
        {node.children?.map((child: RefractorNode, i: number) => (
          <ASTNodeRenderer key={i} node={child} />
        ))}
      </span>
    );
  }

  return null;
}
