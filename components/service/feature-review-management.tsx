"use client";

import { ReviewTable } from "@/components/service/review-table";
import { SummaryCard } from "@/components/service/summary-card";
import {
  Comment01Icon,
  ViewIcon, // Assuming ViewIcon exists or used Visible icon
  StarIcon,
} from "@hugeicons/core-free-icons";
import { Database } from "@/lib/database.types";

type ReviewRow = Database["public"]["Tables"]["dinn_reviews"]["Row"];

interface FeatureReviewManagementProps {
  initialData?: ReviewRow[];
}

const formatDate = (value?: string | null) => {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
};

export function FeatureReviewManagement({
  initialData = [],
}: FeatureReviewManagementProps) {
  const reviews = initialData.map((item) => ({
    id: item.id,
    user: item.nickname || "익명",
    email: item.email || "-",
    comment: item.contents || "",
    status: item.deleted_at ? ("Hidden" as const) : ("Visible" as const),
    createdAt: formatDate(item.created_at),
  }));

  const totalReviews = reviews.length;
  const visibleReviews = reviews.filter((r) => r.status === "Visible").length;
  const hiddenReviews = reviews.filter((r) => r.status === "Hidden").length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="grid grid-cols-2 gap-3 min-[500px]:grid-cols-[repeat(auto-fit,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] md:gap-4 lg:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] xl:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] xl:gap-5">
        <SummaryCard
          title="총 리뷰"
          value={totalReviews}
          icon={Comment01Icon}
          description="모든 사용자 피드백"
        />
        <SummaryCard
          title="게시된 리뷰"
          value={visibleReviews}
          icon={ViewIcon}
          description="현재 공개 중인 리뷰"
        />
        <SummaryCard
          title="숨김 리뷰"
          value={hiddenReviews}
          icon={StarIcon}
          description="비공개 처리된 리뷰"
        />
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight">리뷰 목록</h3>
          <p className="text-sm text-muted-foreground">
            사용자 피드백을 관리하고 공개 상태를 변경합니다.
          </p>
        </div>
        <ReviewTable reviews={reviews} />
      </div>
    </div>
  );
}
