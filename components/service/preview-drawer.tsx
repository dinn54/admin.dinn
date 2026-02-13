"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PostDetailView } from "./post-detail-view";
import { Post } from "@/app/services/[name]/[slug]/[postSlug]/page";
import { ArrowLeft, Loader2, Rocket } from "lucide-react";

interface PreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
  onSaveAsUnlisted: () => void;
  post: Post;
  isPublished?: boolean;
  isHidden?: boolean;
  onHiddenChange?: (hidden: boolean) => void;
  isSaving?: boolean;
}

export function PreviewDrawer({
  isOpen,
  onClose,
  onPublish,
  onSaveAsUnlisted,
  post,
  isPublished = false,
  isHidden = false,
  onHiddenChange,
  isSaving = false,
}: PreviewDrawerProps) {
  const handlePublishClick = () => {
    if (isHidden) {
      onSaveAsUnlisted();
    } else {
      onPublish();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full min-[800px]:w-[920px] min-[800px]:max-w-[920px] p-0 overflow-hidden flex flex-col"
      >
        <SheetHeader className="px-6 py-4 border-b flex flex-row items-center justify-between shrink-0 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="gap-2" onClick={onClose}>
              <ArrowLeft className="w-4 h-4" />
              돌아가서 수정하기
            </Button>
            <SheetTitle className="hidden">게시글 미리보기</SheetTitle>
            <SheetDescription className="hidden">
              게시글을 출간하기 전 미리보기 화면입니다.
            </SheetDescription>
          </div>

          <div className="flex items-center gap-4">
            {onHiddenChange && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hide-post"
                  checked={isHidden}
                  onCheckedChange={(checked) => onHiddenChange(checked === true)}
                />
                <Label
                  htmlFor="hide-post"
                  className="text-sm font-medium cursor-pointer"
                >
                  게시글 숨기기
                </Label>
              </div>
            )}
            <Button
              onClick={handlePublishClick}
              size="lg"
              className="min-w-[120px] bg-teal-600 hover:bg-teal-700"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Rocket className="w-4 h-4 mr-2" />
              )}
              {isSaving
                ? "저장 중..."
                : isHidden
                  ? "미게시로 저장"
                  : isPublished
                    ? "수정사항 게시"
                    : "출간 완료"}
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
          <div className="min-h-full flex justify-center pb-20">
            <PostDetailView
              post={post}
              showBackButton={false}
              articleMaxWidthClass="max-w-[860px]"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
