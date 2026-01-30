"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BlogPostTable, BlogPost } from "@/components/service/blog-post-table";
import { SummaryCard } from "@/components/service/summary-card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  File01Icon,
  CheckmarkCircle01Icon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "@bprogress/next";
import { toast } from "sonner";

interface FeaturePostManagementProps {
  initialData?: BlogPost[];
}

export function FeaturePostManagement({
  initialData = [],
}: FeaturePostManagementProps) {
  const params = useParams();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>(initialData);

  // Stats
  const totalPosts = posts.length;
  const publishedPosts = posts.filter((p) => p.status === "published").length;
  const draftPostsList = posts.filter((p) => p.status === "draft");
  const unlistedPostsList = posts.filter((p) => p.status === "unlisted");
  const draftPosts = draftPostsList.length;
  const unlistedPosts = unlistedPostsList.length;

  const handleDeletePost = async (id: string) => {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "삭제에 실패했습니다.");
      }

      setPosts(posts.filter((post) => post.id !== id));
      toast.success("게시글이 삭제되었습니다.");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error instanceof Error ? error.message : "삭제에 실패했습니다.",
      );
    }
  };

  const handleEditLatest = (status: "draft" | "unlisted") => {
    const { name, slug } = params as { name: string; slug: string };
    const targetPosts = status === "draft" ? draftPostsList : unlistedPostsList;
    if (targetPosts.length > 0) {
      const latestPost = targetPosts[0]; // 이미 최신순 정렬됨
      router.push(
        `/services/${name}/${slug}/${encodeURIComponent(latestPost.title)}/edit`,
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          title="총 게시글"
          value={totalPosts}
          icon={File01Icon}
          description="작성된 모든 블로그 글"
        />
        <SummaryCard
          title="게시됨"
          value={publishedPosts}
          icon={CheckmarkCircle01Icon}
          description="현재 공개 중인 글"
        />
        <SummaryCard
          title="초안"
          value={draftPosts}
          icon={PencilEdit01Icon}
          description="작성 중인 글"
          onIconClick={
            draftPosts > 0 ? () => handleEditLatest("draft") : undefined
          }
        />
        <SummaryCard
          title="미게시"
          value={unlistedPosts}
          icon={PencilEdit01Icon}
          description="비공개로 저장된 글"
          onIconClick={
            unlistedPosts > 0 ? () => handleEditLatest("unlisted") : undefined
          }
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight">게시글 목록</h3>
            <p className="text-sm text-muted-foreground">
              블로그 컨텐츠를 작성하고 관리합니다.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              const { name, slug } = params as { name: string; slug: string };
              router.push(`/services/${name}/${slug}/write`);
            }}
            className="gap-2"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />새 게시글
          </Button>
        </div>
        <BlogPostTable
          posts={posts}
          onRowClick={(post) => {
            const { name, slug } = params as { name: string; slug: string };
            router.push(`/services/${name}/${slug}/${post.title}`);
          }}
          onEdit={(post) => {
            const { name, slug } = params as { name: string; slug: string };
            router.push(`/services/${name}/${slug}/${post.title}/edit`);
          }}
          onDelete={handleDeletePost}
        />
      </div>
    </div>
  );
}
