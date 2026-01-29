"use client";

import { Badge } from "@/components/ui/badge";
import { BlogPost } from "./blog-post-table";
import { Editor } from "@/components/editor/editor";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit01Icon } from "@hugeicons/core-free-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BlogPostViewProps {
  post: BlogPost;
  onEdit?: () => void;
}

export function BlogPostView({ post, onEdit }: BlogPostViewProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                post.status === "published"
                  ? "default"
                  : post.status === "unlisted"
                    ? "secondary"
                    : "outline"
              }
            >
              {post.status === "published"
                ? "게시됨"
                : post.status === "unlisted"
                  ? "미게시"
                  : "초안"}
            </Badge>
            <span className="text-muted-foreground text-sm font-medium">
              {post.readTime} min read
            </span>
          </div>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="gap-2"
            >
              <HugeiconsIcon icon={PencilEdit01Icon} size={16} />
              수정하기
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="text-xl text-muted-foreground font-medium leading-relaxed">
              {post.subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 border-y py-4">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {post.author.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">
              {post.author.name}{" "}
              <span className="text-muted-foreground font-normal ml-1">
                · {post.author.role}
              </span>
            </span>
            <span className="text-xs text-muted-foreground">
              {post.updatedAt} · 좋아요 {post.likes}
            </span>
          </div>
        </div>
      </div>

      <div className="prose prose-stone dark:prose-invert max-w-none">
        <Editor initialEditorState={post.content} readOnly={true} />
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-8 border-t">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="px-3 py-1">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
