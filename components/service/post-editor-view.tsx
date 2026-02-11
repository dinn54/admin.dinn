"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, FileText, Loader2 } from "lucide-react";
import { Editor } from "@/components/editor/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TagInput } from "./tag-input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PreviewDrawer } from "./preview-drawer";
import { toast } from "sonner";
import { preprocessMarkdown } from "@/lib/preprocessMarkdown";

export interface PostData {
  id?: string;
  title: string;
  subtitle?: string;
  tags?: string[];
  readTime?: number;
  content?: string;
  status?: "draft" | "unlisted" | "published";
  author?: {
    name: string;
    role: string;
    avatar: string;
  };
  createdAt?: string;
  updatedAt?: string;
  likes?: number;
}

interface PostEditorViewProps {
  serviceId: string;
  featureId: string;
  initialData?: PostData | null;
  mode?: "create" | "edit";
  returnUrl?: string;
}

type PostStatus = "draft" | "unlisted" | "published";

const STATUS_CONFIG = {
  draft: {
    label: "초안",
    className: "bg-slate-100 text-slate-600",
  },
  unlisted: {
    label: "미게시",
    className: "bg-amber-100 text-amber-700",
  },
  published: {
    label: "게시됨",
    className: "bg-green-100 text-green-700",
  },
};

export default function PostEditorView({
  serviceId,
  featureId,
  initialData,
  mode = "create",
  returnUrl,
}: PostEditorViewProps) {
  const router = useRouter();
  const isEditMode = mode === "edit";

  /* State */
  const [markdown, setMarkdown] = useState<string>("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<PostStatus>("draft");
  const [readTime, setReadTime] = useState(0);
  const [author, setAuthor] = useState("dinn");
  const [postId, setPostId] = useState<string | undefined>(undefined);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isHiddenOnPublish, setIsHiddenOnPublish] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [markdownInput, setMarkdownInput] = useState("");
  const [isMarkdownDialogOpen, setIsMarkdownDialogOpen] = useState(false);

  /* Initialize from initialData */
  useEffect(() => {
    if (initialData) {
      setPostId(initialData.id);
      setTitle(initialData.title || "");
      setSubtitle(initialData.subtitle || "");
      setTags(initialData.tags || []);
      setReadTime(initialData.readTime || 0);
      setMarkdown(initialData.content || "");
      setStatus((initialData.status as PostStatus) || "draft");
      setIsHiddenOnPublish(initialData.status === "unlisted");
      if (initialData.author?.name) {
        setAuthor(initialData.author.name);
      }
    }
  }, [initialData]);

  /* Effects */
  // Auto-generate slug from title if slug is empty
  useEffect(() => {
    if (!title) return;
    const autoSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    if (!slug) {
      setSlug(autoSlug);
    }
  }, [title]);

  /* Handlers */
  const getCurrentPostData = () => {
      return {
        id: postId || "preview-id",
        title: title || "제목 없음",
        description: subtitle,
        date: initialData?.createdAt || new Date().toISOString().split("T")[0],
        updatedDate: new Date().toISOString().split("T")[0],
        tags: tags,
        imageUrl: "",
        readTimeMinutes: readTime,
        author: {
          name: author,
          role: "Administrator",
          avatar: "",
        },
      content: markdown,
    };
  };

  const handleGoBack = () => {
    if (returnUrl) {
      router.push(returnUrl);
    } else {
      router.back();
    }
  };

  const handleSave = async (targetStatus: PostStatus) => {
    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    setIsSaving(true);

    const postData = {
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
      subtitle,
      content: markdown,
      tags,
      read_time: readTime,
      author_name: author,
      author_role: "Administrator",
      author_avatar: "",
      status: targetStatus,
    };

    try {
      let response: Response;

      if (postId) {
        // Update existing post
        response = await fetch(`/api/posts/${postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        });
      } else {
        // Create new post
        response = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "저장에 실패했습니다.");
      }

      // Update local state with returned data
      if (result.data?.id) {
        setPostId(result.data.id);
      }
      setStatus(result.status || targetStatus);

      // Show success message
      const statusLabels = {
        draft: "초안으로 저장되었습니다.",
        unlisted: "미게시 상태로 저장되었습니다.",
        published: "게시되었습니다.",
      };
      toast.success(statusLabels[targetStatus]);

      // Close preview drawer if open
      setIsPreviewOpen(false);

      // Navigate back to list if published
      if (targetStatus === "published") {
        handleGoBack();
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error instanceof Error ? error.message : "저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const statusConfig = STATUS_CONFIG[status];

  return (
    <div className="flex flex-col h-full">
      {/* Header Actions */}
      <div className="flex items-center justify-between py-4 border-b shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">
              {isEditMode ? "게시글 수정" : "새 게시글 작성"}
            </h1>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig.className}`}
              >
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {initialData?.status === "draft" || !initialData ? (
            <Button
              variant="outline"
              onClick={() => handleSave("draft")}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              임시 저장
            </Button>
          ) : null}
          <Button
            onClick={() => setIsPreviewOpen(true)}
            className="bg-slate-800 hover:bg-slate-900"
            disabled={isSaving}
          >
            <Eye className="w-4 h-4 mr-2" />
            미리보기
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col bg-background min-h-0 overflow-hidden">
          <div className="shrink-0 bg-background z-10">
            <div className="max-w-3xl mx-auto w-full px-6 py-3 space-y-1">
              <Label className="text-muted-foreground font-medium">제목</Label>
              <Input
                placeholder="제목을 입력하세요"
                className="text-3xl font-bold border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50 h-auto rounded-none bg-transparent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="flex-1 relative bg-slate-50/30 dark:bg-slate-900/10 min-h-0">
            <div className="absolute inset-0">
              <div className="max-w-3xl mx-auto w-full py-3 px-6 h-full">
                <Editor
                  key={initialData?.id ? `${initialData.id}-${editorKey}` : `new-${editorKey}`}
                  markdown={markdown}
                  onChange={setMarkdown}
                  readOnly={false}
                  className="h-full bg-background"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Separator for Desktop */}
        <Separator
          orientation="vertical"
          className="hidden lg:block w-px min-h-full"
        />

        {/* Sidebar Metadata */}
        <div className="w-full lg:w-[350px] shrink-0 bg-slate-50/50 dark:bg-slate-900/20 p-6 space-y-6 border-b lg:border-b-0 lg:overflow-y-auto">
          {/* Tags */}
          <TagInput tags={tags} setTags={setTags} />

          <Separator />

          {/* Subtitle */}
          <div className="space-y-3">
            <Label>부제목</Label>
            <Textarea
              placeholder="부제목을 입력하세요..."
              className="resize-none h-20 text-sm leading-relaxed"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          {/* Read Time */}
          <div className="space-y-3">
            <Label>읽는 시간 (분)</Label>
            <Input
              type="number"
              min={0}
              placeholder="예: 5"
              value={readTime}
              onChange={(e) => setReadTime(parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Author */}
          <div className="space-y-3">
            <Label>작성자</Label>
            <Input
              value={author}
              disabled
              className="bg-muted text-muted-foreground"
            />
          </div>

          <Separator />

          {/* Markdown Import */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setMarkdownInput(markdown);
              setIsMarkdownDialogOpen(true);
            }}
          >
            <FileText className="w-4 h-4 mr-2" />
            마크다운 가져오기
          </Button>
        </div>
      </div>

      <Dialog open={isMarkdownDialogOpen} onOpenChange={setIsMarkdownDialogOpen}>
        <DialogContent className="sm:max-w-2xl h-[80vh] max-h-[700px] flex flex-col">
          <DialogHeader>
            <DialogTitle>마크다운 가져오기</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1">
            <Textarea
              placeholder="마크다운 텍스트를 붙여넣으세요..."
              className="h-full min-h-0 font-mono text-sm resize-none overflow-y-auto [field-sizing:fixed]"
              value={markdownInput}
              onChange={(e) => setMarkdownInput(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMarkdownDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              onClick={() => {
                setMarkdown(preprocessMarkdown(markdownInput));
                setEditorKey((k) => k + 1);
                setIsMarkdownDialogOpen(false);
              }}
              disabled={!markdownInput.trim()}
            >
              적용
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PreviewDrawer
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setIsHiddenOnPublish(false);
        }}
        onPublish={() => handleSave("published")}
        onSaveAsUnlisted={() => handleSave("unlisted")}
        post={getCurrentPostData()}
        isPublished={status === "published"}
        isHidden={isHiddenOnPublish}
        onHiddenChange={setIsHiddenOnPublish}
      />
    </div>
  );
}
