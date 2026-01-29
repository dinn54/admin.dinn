"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { BlogPost } from "./blog-post-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Editor } from "@/components/editor/editor";

import { Command as CommandPrimitive } from "cmdk";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface BlogPostFormProps {
  initialData?: BlogPost | null;
  onSubmit: (data: Partial<BlogPost> & { summary?: string }) => void;
  onCancel: () => void;
  availableTags?: string[];
  fallbackTags?: string[];
}

export function BlogPostForm({
  initialData,
  onSubmit,
  onCancel,
  availableTags = [],
  fallbackTags = [],
}: BlogPostFormProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [readTime, setReadTime] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [likes, setLikes] = useState(0);

  const [showPreview, setShowPreview] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);

  const [openTagSuggestions, setOpenTagSuggestions] = useState(false);
  const [rawTagInput, setRawTagInput] = useState("");
  const isSelectingRef = useRef(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setSubtitle(initialData.subtitle || "");
      setTags(initialData.tags || []);
      setReadTime(initialData.readTime ? initialData.readTime.toString() : "");
      setContent(initialData.content || "");
      setIsPublished(initialData.status === "published");
      setLikes(initialData.likes || 0);
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setTags([]);
    setReadTime("");
    setContent("");
    setIsPublished(false);
    setLikes(0);
    setRawTagInput("");
  };

  const handlePreview = () => {
    if (!title) return;

    const data: Partial<BlogPost> = {
      title,
      subtitle,
      tags,
      readTime: parseInt(readTime) || 0,
      content,
      status: isPublished ? "published" : "draft",
      likes,
    };
    setPendingData(data);
    setShowPreview(true);
  };

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!initialData) {
      setHasChanges(true);
      return;
    }

    const currentTagsStr = [...tags].sort().join(",");
    const initialTagsStr = [...(initialData.tags || [])].sort().join(",");

    const isDirty =
      title !== initialData.title ||
      subtitle !== (initialData.subtitle || "") ||
      currentTagsStr !== initialTagsStr ||
      readTime !==
        (initialData.readTime ? initialData.readTime.toString() : "") ||
      content !== (initialData.content || "") ||
      isPublished !== (initialData.status === "published") ||
      likes !== (initialData.likes || 0);

    setHasChanges(isDirty);
  }, [
    title,
    subtitle,
    tags,
    readTime,
    content,
    isPublished,
    initialData,
    likes,
  ]);

  const handleConfirmSubmit = () => {
    if (pendingData) {
      onSubmit(pendingData);
      setShowPreview(false);
      setPendingData(null);
      if (!initialData) resetForm();
    }
  };

  const getFilteredTags = () => {
    if (!rawTagInput) return [];
    if (rawTagInput.startsWith(" ")) {
      const shuffled = [...availableTags].sort(() => 0.5 - Math.random());
      return shuffled.filter((t) => !tags.includes(t)).slice(0, 5);
    }
    const currentInput = rawTagInput.trim();
    if (!currentInput) return fallbackTags;
    return availableTags.filter(
      (tag) =>
        tag.toLowerCase().includes(currentInput.toLowerCase()) &&
        !tags.includes(tag)
    );
  };

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) setTags([...tags, tag]);
    setRawTagInput("");
    setOpenTagSuggestions(false);
  };

  const removeTag = (tagToRemove: string) =>
    setTags(tags.filter((t) => t !== tagToRemove));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") {
      if (e.defaultPrevented) return;
      setTimeout(() => {
        if (!isSelectingRef.current) {
          const val = rawTagInput.trim();
          if (val) addTag(val);
        }
        isSelectingRef.current = false;
      }, 50);
    } else if (e.key === ",") {
      e.preventDefault();
      const val = rawTagInput.trim().replace(/,/g, "");
      if (val) addTag(val);
    } else if (e.key === "Backspace" && !rawTagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const filteredTags = getFilteredTags();

  return (
    <>
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="space-y-3 p-0">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label
                htmlFor="title"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                제목
              </Label>
              <Input
                id="title"
                placeholder="게시글 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 text-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label
                  htmlFor="readTime"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  읽는 시간 (분)
                </Label>
                <Input
                  id="readTime"
                  type="number"
                  placeholder="5"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="likes"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  좋아요 수
                </Label>
                <Input
                  id="likes"
                  type="number"
                  placeholder="0"
                  value={likes}
                  onChange={(e) => setLikes(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="subtitle"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              부제목
            </Label>
            <Input
              id="subtitle"
              placeholder="게시글의 핵심 내용을 한 줄로 설명하세요"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          <div className="space-y-1 relative">
            <Label
              htmlFor="tags"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              태그
            </Label>
            <div className="relative">
              <CommandPrimitive
                className="flex flex-wrap gap-2 items-center p-2 rounded-md border bg-background overflow-visible focus-within:ring-1 focus-within:ring-primary/30 transition-all"
                shouldFilter={false}
              >
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="pl-2 pr-1 py-1 flex items-center gap-1 animate-in zoom-in-95"
                  >
                    {tag}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => removeTag(tag)}
                      className="cursor-pointer hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                  </Badge>
                ))}

                <CommandPrimitive.Input
                  placeholder={
                    tags.length === 0
                      ? "태그 입력 (엔터, 쉼표로 추가, 스페이스로 제안)"
                      : ""
                  }
                  value={rawTagInput}
                  onValueChange={(val) => {
                    setRawTagInput(val);
                    setOpenTagSuggestions(true);
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setOpenTagSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setOpenTagSuggestions(false), 200)
                  }
                  className="flex-1 min-w-[150px] bg-transparent border-0 outline-none focus:ring-0 text-sm h-8 placeholder:text-muted-foreground font-sans"
                />

                {openTagSuggestions &&
                  (rawTagInput || filteredTags.length > 0) && (
                    <div className="absolute top-full left-0 z-50 w-full min-w-[200px] mt-1">
                      <CommandList className="bg-popover text-popover-foreground rounded-md border shadow-lg outline-none animate-in fade-in-0 zoom-in-95 max-h-[200px] overflow-y-auto w-full">
                        <CommandGroup heading="제안 태그">
                          {filteredTags.length > 0 ? (
                            filteredTags.map((tag) => (
                              <CommandItem
                                key={tag}
                                value={tag}
                                onSelect={() => {
                                  isSelectingRef.current = true;
                                  addTag(tag);
                                }}
                                className="cursor-pointer"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                {tag}
                              </CommandItem>
                            ))
                          ) : (
                            <CommandEmpty className="py-2 px-4 text-sm text-muted-foreground">
                              새로운 태그: "{rawTagInput.trim()}"
                            </CommandEmpty>
                          )}
                        </CommandGroup>
                      </CommandList>
                    </div>
                  )}
              </CommandPrimitive>
            </div>
          </div>

          <div className="space-y-1 flex flex-col">
            <Label
              htmlFor="content"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              내용
            </Label>
            <div className="border rounded-md overflow-hidden bg-background focus-within:ring-1 focus-within:ring-primary/30 transition-all h-[400px]">
              <Editor
                key={initialData?.id || "new"}
                markdown={initialData?.content || ""}
                onChange={(markdown) => setContent(markdown)}
                className="h-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-dashed">
            <div className="space-y-0.5">
              <Label htmlFor="published" className="text-sm font-medium">
                게시 상태
              </Label>
              <p className="text-xs text-muted-foreground">
                이 게시글을 모든 방문자에게 공개합니다.
              </p>
            </div>
            <Switch
              id="published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 pt-8 border-t mt-8">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            취소
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            {initialData
              ? hasChanges
                ? "수정사항 미리보기"
                : "미리보기"
              : "미리보기"}
          </Button>
          <Button
            onClick={() => {
              const data: Partial<BlogPost> = {
                title,
                subtitle,
                tags,
                readTime: parseInt(readTime) || 0,
                content,
                status: isPublished ? "published" : "draft",
                likes,
              };
              onSubmit(data);
            }}
          >
            {initialData ? "저장하기" : "게시하기"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[900px] w-[90vw] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden rounded-xl shadow-2xl">
          <DialogHeader className="px-6 py-4 border-b shrink-0 bg-muted/20">
            <DialogTitle>게시글 미리보기</DialogTitle>
            <DialogDescription>
              게시 또는 수정하기 전에 내용을 확인하세요.
            </DialogDescription>
          </DialogHeader>

          {pendingData && (
            <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 bg-background">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        pendingData.status === "published"
                          ? "default"
                          : "outline"
                      }
                    >
                      {pendingData.status === "published" ? "게시됨" : "초안"}
                    </Badge>
                    <span className="text-muted-foreground text-sm font-medium">
                      {pendingData.readTime} min read
                    </span>
                  </div>
                  <h1 className="text-4xl font-extrabold tracking-tight">
                    {pendingData.title}
                  </h1>
                  {pendingData.subtitle && (
                    <p className="text-xl text-muted-foreground font-medium">
                      {pendingData.subtitle}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {pendingData.tags?.map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="prose prose-stone dark:prose-invert max-w-none pt-8 border-t">
                  <Editor
                    markdown={pendingData.content || ""}
                    readOnly={true}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="px-6 py-4 border-t shrink-0 bg-muted/20">
            <Button variant="ghost" onClick={() => setShowPreview(false)}>
              계속 수정하기
            </Button>
            <Button onClick={handleConfirmSubmit}>
              {initialData ? "수정사항 저장" : "지금 게시하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
