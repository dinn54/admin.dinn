import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import parse, {
  domToReact,
  HTMLReactParserOptions,
  Element,
  DOMNode,
} from "html-react-parser";
import { TweetEmbed } from "@/components/editor/ui/TweetEmbed";
import { theme as editorTheme } from "@/components/editor/theme";

// Refractor for Server-Side Syntax Highlighting
import { refractor } from "refractor";
import javascript from "refractor/javascript";
import typescript from "refractor/typescript";
import css from "refractor/css";
import markup from "refractor/markup";
import json from "refractor/json";
import jsx from "refractor/jsx";
import tsx from "refractor/tsx";

refractor.register(markup);
refractor.register(javascript);
refractor.register(jsx);
refractor.register(typescript);
refractor.register(tsx);
refractor.register(css);
refractor.register(json);

interface RefractorNode {
  type: string;
  value?: string;
  properties?: { className?: string[] | string };
  children?: RefractorNode[];
}

function isElement(node: DOMNode): node is Element {
  return node.type === "tag";
}

function getAttr(el: Element, name: string): string | undefined {
  return el.attribs?.[name];
}

function parseCssLengthPx(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parseInlineStyle(styleText?: string): React.CSSProperties {
  if (!styleText) return {};
  const style: React.CSSProperties = {};
  const rules = styleText.split(";").map((rule) => rule.trim()).filter(Boolean);

  for (const rule of rules) {
    const [rawProp, rawValue] = rule.split(":");
    if (!rawProp || !rawValue) continue;
    const prop = rawProp.trim().toLowerCase();
    const value = rawValue.trim();

    if (prop === "background-color") {
      style.backgroundColor = value;
      continue;
    }
    if (prop === "vertical-align") {
      if (value === "top" || value === "middle" || value === "bottom") {
        style.verticalAlign = value;
      }
      continue;
    }
    if (prop === "width") {
      const width = parseCssLengthPx(value);
      if (width) style.width = `${width}px`;
      continue;
    }
    if (prop === "text-align") {
      if (value === "left" || value === "right" || value === "center" || value === "justify" || value === "start" || value === "end") {
        style.textAlign = value as React.CSSProperties["textAlign"];
      }
    }
  }
  return style;
}

function parseTextAlignStyle(styleText?: string): React.CSSProperties {
  const parsed = parseInlineStyle(styleText);
  return parsed.textAlign ? { textAlign: parsed.textAlign } : {};
}

function parseTableCellStyle(styleText?: string): React.CSSProperties {
  const style = parseInlineStyle(styleText);
  const widthMatch = (styleText || "").match(/(?:^|;)\s*width:\s*(\d+(?:\.\d+)?)px/i);
  const widthPx = widthMatch ? Number.parseFloat(widthMatch[1]) : undefined;

  // Lexical exportDOM writes 75px default when no explicit width is set.
  // Drop that default so preview layout matches editor auto-width behavior.
  if (widthPx !== undefined && widthPx <= 80) {
    delete style.width;
  }

  style.minWidth = "80px";
  return style;
}

const BLOCK_TAGS_IN_PARAGRAPH = new Set([
  "address",
  "article",
  "aside",
  "blockquote",
  "details",
  "div",
  "dl",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hr",
  "iframe",
  "li",
  "main",
  "nav",
  "ol",
  "p",
  "pre",
  "section",
  "table",
  "ul",
]);

function hasBlockChildren(children?: DOMNode[]): boolean {
  if (!children) return false;
  return children.some(
    (child) => isElement(child) && BLOCK_TAGS_IN_PARAGRAPH.has(child.name)
  );
}

function hasChildrenReplacingToBlock(children?: DOMNode[]): boolean {
  if (!children) return false;
  return children.some((child) => {
    if (!isElement(child)) return false;
    if (child.name === "img") return true;
    if (child.name === "iframe" && Boolean(getAttr(child, "data-lexical-youtube"))) {
      return true;
    }
    if (child.name === "div" && Boolean(getAttr(child, "data-lexical-tweet-id"))) {
      return true;
    }
    return false;
  });
}

function normalizeLanguage(language?: string): string {
  if (!language) return "javascript";
  const normalized = language.trim().toLowerCase();
  const langMap: Record<string, string> = {
    ts: "tsx",
    typescript: "tsx",
    js: "jsx",
    javascript: "jsx",
    html: "markup",
    xml: "markup",
    yml: "yaml",
    shell: "bash",
    sh: "bash",
  };
  return langMap[normalized] || normalized;
}

function getCodeLanguage(el: Element): string {
  const langAttr = getAttr(el, "data-highlight-language");
  const dataLanguage = getAttr(el, "data-language");
  const cls = getAttr(el, "class") || "";
  const langFromClass = cls.match(/language-([a-zA-Z0-9_-]+)/)?.[1];
  return normalizeLanguage(langAttr || dataLanguage || langFromClass || "javascript");
}

function extractTextFromNodes(nodes?: DOMNode[]): string {
  if (!nodes) return "";
  return nodes.map(extractText).join("");
}

function CodeHighlighter({ code, language }: { code: string; language: string }) {
  let ast: RefractorNode | null = null;
  try {
    const lang = normalizeLanguage(language);
    ast = refractor.highlight(code, lang);
  } catch {
    try {
      ast = refractor.highlight(code, "javascript");
    } catch {
      return <>{code}</>;
    }
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
  if (node.type === "text") return <>{node.value}</>;

  if (node.type === "element") {
    const classListRaw = node.properties?.className;
    const className =
      typeof classListRaw === "string"
        ? classListRaw.split(/\s+/).filter(Boolean)
        : classListRaw || [];
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

      if (mappedType && editorTheme.codeHighlight[mappedType as keyof typeof editorTheme.codeHighlight]) {
        tailwindClass = editorTheme.codeHighlight[mappedType as keyof typeof editorTheme.codeHighlight];
      }
    }
    const classNameCombined = [...className, tailwindClass].filter(Boolean).join(" ");
    return (
      <span className={classNameCombined || undefined}>
        {node.children?.map((child: RefractorNode, i: number) => (
          <ASTNodeRenderer key={i} node={child} />
        ))}
      </span>
    );
  }
  return null;
}

/** 코드 블록의 텍스트 콘텐츠 추출 */
function extractText(node: DOMNode | { type: string; data?: string; children?: unknown[] }): string {
  if (node.type === "text") return (node as { data?: string }).data || "";
  if (isElement(node as DOMNode)) {
    const element = node as Element;
    if (element.name === "br") return "\n";
    if (element.children) {
      return (element.children as DOMNode[]).map(extractText).join("");
    }
  }
  return "";
}

const options: HTMLReactParserOptions = {
  replace(domNode) {
    if (!isElement(domNode)) return;

    const tag = domNode.name;

    // --- Tweet embed: <blockquote class="twitter-tweet"> (ServerTweetNode exportDOM) ---
    if (tag === "blockquote" && getAttr(domNode, "class")?.includes("twitter-tweet")) {
      // ServerTweetNode doesn't put tweetID in attributes, but we need it.
      // Fall through — tweets are handled by <div data-lexical-tweet-id> from client nodes.
      // For server nodes, the tweetID is not in the exported HTML.
      // We'll keep the blockquote as-is for now.
      return;
    }

    // --- Tweet embed: <div data-lexical-tweet-id> (TweetNode exportDOM) ---
    if (tag === "div" && getAttr(domNode, "data-lexical-tweet-id")) {
      const tweetId = getAttr(domNode, "data-lexical-tweet-id")!;
      const style = domNode.attribs?.style;
      const tweetUrl = `https://x.com/i/status/${tweetId}`;
      let width = 450;
      if (style) {
        const m = style.match(/width:\s*(\d+)px/);
        if (m) width = parseInt(m[1], 10);
      }
      return (
        <div className="my-8">
          <Suspense
            fallback={
              <div
                className="animate-pulse bg-muted rounded-lg h-48 flex items-center justify-center"
                style={{ width, maxWidth: "100%" }}
              >
                <a
                  href={tweetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-teal-600 underline underline-offset-4 dark:text-teal-400"
                >
                  트윗 보기
                </a>
              </div>
            }
          >
            <TweetEmbed id={tweetId} width={width} />
          </Suspense>
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs text-slate-500 underline underline-offset-4 dark:text-slate-400"
          >
            원문 보기: {tweetUrl}
          </a>
        </div>
      );
    }

    // --- Image ---
    if (tag === "img") {
      const src = getAttr(domNode, "src") || "";
      const alt = getAttr(domNode, "alt") || "이미지";
      const widthAttr = getAttr(domNode, "width");
      const styleWidthMatch = (getAttr(domNode, "style") || "").match(/width:\s*(\d+)px/i);
      const parsedWidth = widthAttr ? Number.parseInt(widthAttr, 10) : NaN;
      const parsedStyleWidth = styleWidthMatch ? Number.parseInt(styleWidthMatch[1], 10) : NaN;
      const imgWidth = Number.isFinite(parsedWidth) && parsedWidth > 0
        ? parsedWidth
        : Number.isFinite(parsedStyleWidth) && parsedStyleWidth > 0
          ? parsedStyleWidth
          : 500;
      return (
        <figure className="my-8">
          <div
            className="relative inline-block"
            style={{ width: `${imgWidth}px`, maxWidth: "100%" }}
          >
            <Image
              src={src}
              alt={alt}
              width={imgWidth}
              height={0}
              className="w-full h-auto rounded-lg shadow-sm"
              style={{ height: "auto" }}
            />
          </div>
          {alt && alt !== "이미지" && (
            <figcaption className="text-muted-foreground mt-2 text-sm">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    }

    // --- YouTube iframe ---
    if (tag === "iframe" && getAttr(domNode, "data-lexical-youtube")) {
      const videoID = getAttr(domNode, "data-lexical-youtube")!;
      const src = `https://www.youtube.com/embed/${videoID}`;
      const widthAttr = parseCssLengthPx(getAttr(domNode, "width"));
      const styleWidthMatch = (getAttr(domNode, "style") || "").match(/width:\s*(\d+)px/i);
      const styleWidth = styleWidthMatch ? Number.parseInt(styleWidthMatch[1], 10) : NaN;
      const embedWidth =
        widthAttr && widthAttr > 0
          ? widthAttr
          : Number.isFinite(styleWidth) && styleWidth > 0
            ? styleWidth
            : 560;
      return (
        <div
          className="youtube-wrapper relative block rounded-lg bg-transparent my-4"
          style={{ width: `min(100%, ${embedWidth}px)` }}
        >
          <div className="relative rounded-lg overflow-hidden">
            <iframe
              src={src}
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

    // --- Headings ---
    if (/^h[1-6]$/.test(tag)) {
      const level = tag as keyof typeof editorTheme.heading;
      const cls = editorTheme.heading[level] || editorTheme.heading.h1;
      const textContent = domNode.children?.map(extractText).join("") || "";
      const Tag = tag as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      const alignStyle = parseTextAlignStyle(getAttr(domNode, "style"));
      return (
        <Tag id={textContent} className={cls} style={alignStyle}>
          {domToReact(domNode.children as DOMNode[], options)}
        </Tag>
      );
    }

    // --- Paragraph ---
    if (tag === "p") {
      // Empty paragraph → <br>
      if (!domNode.children || domNode.children.length === 0) return <br />;
      const children = domNode.children as DOMNode[];
      const alignStyle = parseTextAlignStyle(getAttr(domNode, "style"));
      if (hasBlockChildren(children) || hasChildrenReplacingToBlock(children)) {
        return (
          <div className={editorTheme.paragraph} style={alignStyle}>
            {domToReact(children, options)}
          </div>
        );
      }
      return (
        <p className={editorTheme.paragraph} style={alignStyle}>
          {domToReact(children, options)}
        </p>
      );
    }

    // --- Blockquote ---
    if (tag === "blockquote") {
      const alignStyle = parseTextAlignStyle(getAttr(domNode, "style"));
      return (
        <blockquote className={editorTheme.quote} style={alignStyle}>
          {domToReact(domNode.children as DOMNode[], options)}
        </blockquote>
      );
    }

    // --- Lists ---
    if (tag === "ul") {
      return (
        <ul className={editorTheme.list.ul}>
          {domToReact(domNode.children as DOMNode[], options)}
        </ul>
      );
    }
    if (tag === "ol") {
      return (
        <ol className={editorTheme.list.ol}>
          {domToReact(domNode.children as DOMNode[], options)}
        </ol>
      );
    }
    if (tag === "li") {
      const alignStyle = parseTextAlignStyle(getAttr(domNode, "style"));
      return (
        <li className={editorTheme.list.listitem} style={alignStyle}>
          {domToReact(domNode.children as DOMNode[], options)}
        </li>
      );
    }

    // --- Links ---
    if (tag === "a") {
      const href = getAttr(domNode, "href") || "#";
      const target = getAttr(domNode, "target") || "_blank";
      const rel = getAttr(domNode, "rel") || "noopener noreferrer";
      return (
        <Link href={href} target={target} rel={rel} className={editorTheme.link}>
          {domToReact(domNode.children as DOMNode[], options)}
        </Link>
      );
    }

    // --- Code block: <code> inside <pre> ---
    if (tag === "code" && domNode.parent && isElement(domNode.parent as DOMNode) && (domNode.parent as Element).name === "pre") {
      const codeText = domNode.children?.map(extractText).join("") || "";
      const language = getCodeLanguage(domNode);

      return (
        <code className="block font-mono text-sm leading-tight">
          <CodeHighlighter code={codeText} language={language} />
        </code>
      );
    }

    // --- Pre (code block wrapper) ---
    if (tag === "pre") {
      let language = getCodeLanguage(domNode);
      let codeText = "";
      let hasCodeChild = false;
      const children = (domNode.children || []) as DOMNode[];

      for (const child of children) {
        if (isElement(child) && child.name === "code") {
          hasCodeChild = true;
          language = getCodeLanguage(child) || language;
          codeText = extractTextFromNodes(child.children as DOMNode[]);
          break;
        }
      }

      if (!hasCodeChild) {
        codeText = extractTextFromNodes(children);
      }

      return (
        <div className={editorTheme.code}>
          <pre className="relative">
            {language && (
              <div className="text-muted-foreground absolute top-0 right-0 p-1 text-xs uppercase select-none">
                {language}
              </div>
            )}
            <code className="block font-mono text-sm leading-tight">
              <CodeHighlighter code={codeText} language={language} />
            </code>
          </pre>
        </div>
      );
    }

    // --- Table ---
    if (tag === "table") {
      const tableClass = getAttr(domNode, "class") || "";
      const tableStyle = parseInlineStyle(getAttr(domNode, "style"));
      if (tableClass.split(/\s+/).includes("mx-auto")) {
        tableStyle.marginLeft = "auto";
        tableStyle.marginRight = "auto";
      } else if (tableClass.split(/\s+/).includes("ml-auto")) {
        tableStyle.marginLeft = "auto";
        tableStyle.marginRight = "0";
      }
      return (
        <div className="my-6 overflow-x-auto rounded-lg">
          <table className={editorTheme.table} style={tableStyle}>
            {domToReact(domNode.children as DOMNode[], options)}
          </table>
        </div>
      );
    }

    if (tag === "tbody") {
      const tableEl = domNode.parent && isElement(domNode.parent as DOMNode)
        ? (domNode.parent as Element)
        : null;
      const hasRowStriping = tableEl
        ? getAttr(tableEl, "data-lexical-row-striping") === "true"
        : false;
      return (
        <tbody
          className={
            hasRowStriping
              ? "bg-card divide-muted divide-y [&_tr:nth-child(even)]:bg-slate-50/60 dark:[&_tr:nth-child(even)]:bg-slate-900/30"
              : "bg-card divide-muted divide-y"
          }
        >
          {domToReact(domNode.children as DOMNode[], options)}
        </tbody>
      );
    }

    // --- Table header cell ---
    if (tag === "th") {
      const style = parseTableCellStyle(getAttr(domNode, "style"));
      return (
        <th
          className={`${editorTheme.tableCell} ${editorTheme.tableCellHeader}`}
          colSpan={getAttr(domNode, "colspan") ? parseInt(getAttr(domNode, "colspan")!) : undefined}
          rowSpan={getAttr(domNode, "rowspan") ? parseInt(getAttr(domNode, "rowspan")!) : undefined}
          style={style}
        >
          <div className="[&>figure]:my-0 [&>div.my-8]:my-0 [&>div.my-6]:my-0 [&>div.my-4]:my-0 [&_.mb-6]:mb-0">
            {domToReact(domNode.children as DOMNode[], options)}
          </div>
        </th>
      );
    }

    // --- Table data cell ---
    if (tag === "td") {
      const style = parseTableCellStyle(getAttr(domNode, "style"));
      return (
        <td
          className={editorTheme.tableCell}
          colSpan={getAttr(domNode, "colspan") ? parseInt(getAttr(domNode, "colspan")!) : undefined}
          rowSpan={getAttr(domNode, "rowspan") ? parseInt(getAttr(domNode, "rowspan")!) : undefined}
          style={style}
        >
          <div className="[&>figure]:my-0 [&>div.my-8]:my-0 [&>div.my-6]:my-0 [&>div.my-4]:my-0 [&_.mb-6]:mb-0">
            {domToReact(domNode.children as DOMNode[], options)}
          </div>
        </td>
      );
    }

    // --- Horizontal rule ---
    if (tag === "hr") {
      return <hr className="border-muted my-10 border-t" />;
    }

    // --- Text formatting: bold ---
    if (tag === "strong" || tag === "b") {
      return (
        <strong className={editorTheme.text.bold}>
          {domToReact(domNode.children as DOMNode[], options)}
        </strong>
      );
    }

    // --- Text formatting: italic ---
    if (tag === "em" || tag === "i") {
      return (
        <em className={editorTheme.text.italic}>
          {domToReact(domNode.children as DOMNode[], options)}
        </em>
      );
    }

    // --- Inline code ---
    if (tag === "code") {
      return (
        <code className={editorTheme.text.code}>
          {domToReact(domNode.children as DOMNode[], options)}
        </code>
      );
    }

    // --- Strikethrough ---
    if (tag === "s" || tag === "del") {
      return (
        <span className={editorTheme.text.strikethrough}>
          {domToReact(domNode.children as DOMNode[], options)}
        </span>
      );
    }

    // --- Underline ---
    if (tag === "u") {
      return (
        <span className={editorTheme.text.underline}>
          {domToReact(domNode.children as DOMNode[], options)}
        </span>
      );
    }

    // Everything else passes through automatically
  },
};

export function HtmlContentRenderer({ html }: { html: string }) {
  if (!html) return null;

  return (
    <div className="lexical-theme text-foreground max-w-none">
      {parse(html, options)}
    </div>
  );
}
