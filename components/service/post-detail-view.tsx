"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowUp,
  Bookmark,
  Calendar,
  Clock,
  Pencil,
  Trash2,
} from "lucide-react";
import { useRouter } from "@bprogress/next";
import Link from "next/link";
import { Post } from "@/app/services/[name]/[slug]/[postSlug]/page";
import { parseMarkdownToLexicalNodes } from "@/lib/parseMarkdownServer";
import ServerLexicalRenderer from "@/components/editor/ui/ServerLexicalRenderer";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

interface PostDetailViewProps {
  post: Post;
  showBackButton?: boolean;
  children?: React.ReactNode;
}

export function PostDetailView({
  post,
  showBackButton = true,
  children,
}: PostDetailViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isDeleting, setIsDeleting] = useState(false);

  const editPath = useMemo(() => {
    if (!pathname) return "";
    return pathname.endsWith("/") ? `${pathname}edit` : `${pathname}/edit`;
  }, [pathname]);

  const listPath = useMemo(() => {
    if (!pathname) return "/services";
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 1) return "/";
    return `/${segments.slice(0, -1).join("/")}`;
  }, [pathname]);

  // 미리보기용: children이 없을 때 클라이언트에서 마크다운 파싱
  const parsedNodes = useMemo(() => {
    if (children || !post.content) return null;
    return parseMarkdownToLexicalNodes(post.content);
  }, [children, post.content]);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = () => {
    if (!editPath) return;
    router.push(editPath);
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    const shouldDelete = window.confirm("이 게시글을 삭제하시겠습니까?");
    if (!shouldDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "삭제에 실패했습니다.");
      }

      toast.success("게시글이 삭제되었습니다.");
      router.push(listPath);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error instanceof Error ? error.message : "삭제에 실패했습니다.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadHtml = async () => {
    // 1. Select target elements
    const contentElement = document.getElementById("post-content");
    const headerElement = document.getElementById("post-header");
    const footerElement = document.getElementById("post-footer");

    if (!contentElement || !headerElement || !footerElement) {
      alert("콘텐츠를 찾을 수 없습니다.");
      return;
    }

    // 2. Extract CSS rules
    let cssText = "";
    const styleSheets = Array.from(document.styleSheets);
    const hasTweet =
      contentElement.querySelector(".react-tweet-theme") !== null ||
      contentElement.querySelector("[data-lexical-tweet-id]") !== null;

    if (hasTweet) {
      // Full fetch for Tweets (Heavy but necessary for react-tweet styles)
      const cssPromises = styleSheets.map(async (sheet) => {
        try {
          if (
            sheet.href &&
            (sheet.href.startsWith(window.location.origin) ||
              sheet.href.startsWith("/"))
          ) {
            const response = await fetch(sheet.href);
            if (response.ok) return await response.text();
          } else if (!sheet.href) {
            let inlineCss = "";
            try {
              const rules = Array.from(sheet.cssRules);
              rules.forEach((rule) => {
                inlineCss += rule.cssText;
              });
            } catch (e) {
              /* Ignore cross-origin rules */
            }
            return inlineCss;
          }
        } catch (e) {
          return "";
        }
        return "";
      });
      const cssChunks = await Promise.all(cssPromises);
      cssText = cssChunks.join("\n");
    } else {
      // Lightweight extraction for standard posts (Rely on CDN + Inline)
      styleSheets.forEach((sheet) => {
        try {
          if (sheet.href) return; // Skip external sheets
          const rules = Array.from(sheet.cssRules);
          rules.forEach((rule) => {
            cssText += rule.cssText;
          });
        } catch (e) {}
      });
    }

    // 3. Assemble HTML
    const contentHtml = contentElement.innerHTML;
    // Sanitize and process content (YouTube fixes)
    const sanitizedContent = contentHtml.replace(
      /<iframe[^>]*src="https?:\/\/(?:www\.)?(?:youtube\.com|youtube-nocookie\.com)\/embed\/([\w-]+)(?:\?[^"]*)?"[^>]*><\/iframe>/g,
      (match, videoId) => {
        return `
          <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" style="display: block; width: 100%; aspect-ratio: 16 / 9; position: relative; text-decoration: none; border-radius: 8px; overflow: hidden; background: transparent;">
            <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.95; display: block;" alt="Play Video" />
             <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 68px; height: 48px; background-color: rgba(0, 0, 0, 0.8); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(0,0,0,0.5);">
                <div style="width: 0; height: 0; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-left: 16px solid white; margin-left: 4px;"></div>
             </div>
          </a>
        `;
      }
    );

    // Prepare Footer (Remove Save Button)
    const footerClone = footerElement.cloneNode(true) as HTMLElement;
    const saveButton = footerClone.querySelector("#btn-save");
    const divider = footerClone.querySelector("#btn-save + div"); // Try to target divider following save button
    if (saveButton) {
      saveButton.remove();
    }
    if (divider) {
      divider.remove();
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { 
            padding: 40px; 
            line-height: 1.6; 
            margin: 0;
            background-color: #f9fafb;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        article {
            width: 100%;
            max-width: 800px;
            background: white;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border-radius: 8px;
        }
        img { max-width: 100%; height: auto; border-radius: 8px; }
        iframe { width: 100%; aspect-ratio: 16 / 9; border: none; border-radius: 8px; display: none; } /* Hide original iframes if any slip through */
        ${cssText}
        
        /* Apply transparency but preserve backgrounds for code blocks, badges, quotes, etc. */

        
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
    </style>
</head>
<body>
    <article>
      ${headerElement.outerHTML}
      <div class="content">
        ${sanitizedContent}
      </div>
      ${footerClone.outerHTML}
    </article>
    <script>
      // Simple Scroll to Top script
      document.querySelector('button[id="btn-scroll-top"]')?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      // Re-bind listeners if needed for other buttons? Likely not for static archive.
    </script>
</body>
</html>
    `;

    // 4. Download file
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${post.title.replace(
      /\s+/g,
      "_"
    )}_${new Date().getTime()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex w-full animate-in fade-in zoom-in-95 justify-center px-4 pt-4 pb-10 duration-300 sm:px-6 md:pb-14">
      <article className="flex h-full w-full max-w-[800px] flex-col pt-2 pb-10">
        {/* Top Back Navigation */}
        {showBackButton && (
          <div className="mb-8 flex items-center justify-between gap-3">
            <button
              onClick={() => router.back()}
              className="group flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              목록으로 돌아가기
            </button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleEdit}>
                <Pencil className="h-3.5 w-3.5" />
                수정
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-red-600 hover:text-red-700"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isDeleting ? "삭제 중..." : "삭제"}
              </Button>
            </div>
          </div>
        )}

        {/* Article Header */}
        <header id="post-header" className="relative mb-5">
          {/* Decorative Blur Background for Title Emphasis */}
          <div className="animate-in fade-in absolute -top-10 -left-10 -z-10 h-32 w-32 rounded-full bg-teal-400/10 opacity-0 blur-3xl duration-1000 dark:opacity-20"></div>

          <h1 className="font-heading mb-4 text-xl leading-snug font-bold tracking-tight text-slate-900 sm:text-2xl md:text-3xl dark:text-white">
            {post.title}
          </h1>

          <p className="mb-8 max-w-[600px] font-sans text-base leading-relaxed font-normal break-keep text-slate-500 sm:text-lg dark:text-slate-400">
            {post.description}
          </p>

          <div className="mt-6 flex w-full flex-wrap items-center gap-6 border-t border-slate-100 pt-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <div className="flex items-center gap-2 py-4">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.date} className="font-sans font-medium">
                {post.date.replace(/-/g, ".")}
              </time>
            </div>

          <div className="flex items-center gap-2 py-4">
            <Clock className="h-4 w-4" />
            <span>{post.readTimeMinutes || 0}분</span>
          </div>

            <div className="flex items-center gap-3">
              <span className="h-3 w-px bg-slate-200 dark:bg-slate-700"></span>
              <div className="flex gap-2">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/posts?tag=${tag}`}>
                    <Badge
                      variant="secondary"
                      size="sm"
                      className="cursor-pointer hover:bg-teal-100 hover:text-teal-700 dark:hover:bg-teal-900/30 dark:hover:text-teal-300"
                    >
                      #{tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Content: Server-rendered children or parsed nodes for preview */}
        <div id="post-content">
          {children ? (
            children
          ) : parsedNodes && parsedNodes.length > 0 ? (
            <ServerLexicalRenderer nodes={parsedNodes} />
          ) : (
            <div className="py-20 text-center text-slate-500">
              <p>콘텐츠를 불러올 수 없습니다.</p>
            </div>
          )}
        </div>

        {/* Footer Actions & Navigation Combined */}
        <div
          id="post-footer"
          className="mt-16 border-t border-slate-200 pt-8 dark:border-slate-800"
        >
          <div className="mb-10 flex flex-row items-center justify-between gap-4">
            {/* Author Profile & Updated Date */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 ring-2 ring-slate-100 dark:bg-slate-800 dark:ring-slate-800">
                    <span className="font-bold text-slate-500 dark:text-slate-400">
                      {post.author.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {post.author.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">
                    {post.author.role}
                  </span>
                </div>
              </div>
              <div className="hidden h-8 w-px bg-slate-200 sm:block dark:bg-slate-800"></div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Last updated:</span>
                <time
                  dateTime={post.updatedDate || post.date}
                  className="font-medium"
                >
                  {(post.updatedDate || post.date).replace(/-/g, ".")}
                </time>
              </div>
            </div>

            {/* Actions: Save & Share - Right Aligned */}
            <div className="flex flex-col items-end gap-2 pr-4 sm:flex-row sm:items-center sm:gap-3 sm:pr-0">
              <Button
                id="btn-save"
                variant="ghost"
                size="sm"
                onClick={handleDownloadHtml}
                className="gap-2 rounded-full text-slate-500 transition-colors hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-900/20 dark:hover:text-teal-400"
              >
                <Bookmark className="h-4 w-4" />
                <span className="font-medium">저장하기</span>
              </Button>
              <div className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-700"></div>
              <Button
                id="btn-scroll-top"
                variant="ghost"
                size="sm"
                onClick={handleScrollToTop}
                className="gap-2 rounded-full text-slate-500 transition-colors hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-900/20 dark:hover:text-teal-400"
              >
                <ArrowUp className="h-4 w-4" />
                <span className="font-medium">맨 위로</span>
              </Button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
