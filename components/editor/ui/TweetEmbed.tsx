"use client";

import { Tweet } from "react-tweet";

interface TweetEmbedProps {
  id: string;
  width?: number;
}

export function TweetEmbed({ id, width = 450 }: TweetEmbedProps) {
  return (
    <div style={{ width, maxWidth: "100%" }}>
      <Tweet
        id={id}
        fallback={
          <div className="animate-pulse rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-3 h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-2 h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        }
        onError={() => null}
      />
    </div>
  );
}

function TweetNotFoundFallback({ id }: { id: string }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <svg
          className="h-5 w-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span className="text-sm font-medium">트윗을 불러올 수 없습니다</span>
      </div>
      <a
        href={`https://twitter.com/x/status/${id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block text-xs text-teal-600 dark:text-teal-400 hover:underline"
      >
        Twitter에서 보기
      </a>
    </div>
  );
}
