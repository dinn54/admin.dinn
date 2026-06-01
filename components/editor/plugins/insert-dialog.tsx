
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Delete02Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { uploadPostImage } from "@/lib/post-image-upload-client";

export type InsertType =
  | "youtube"
  | "image"
  | "tweet"
  | "table"
  | "poll"
  | "equation"
  | "layout"
  | null;

interface InsertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: InsertType;
  onConfirm: (data: InsertDialogData) => void;
  imageUploadDraftId?: string;
  imageUploadPostId?: string | null;
}

export type InsertDialogData = {
  src?: string;
  altText?: string;
  width?: number | null;
  height?: number | null;
  url?: string;
  rows?: string;
  columns?: string;
  includeHeaders?: boolean;
  question?: string;
  options?: Array<{ text: string; uid: string; votes: number }>;
  equation?: string;
  inline?: boolean;
  templateColumns?: string;
};

export function InsertDialog({
  open,
  onOpenChange,
  type,
  onConfirm,
  imageUploadDraftId,
  imageUploadPostId,
}: InsertDialogProps) {
  const [data, setData] = useState<InsertDialogData>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset data on open based on type
      switch (type) {
        case "table":
          setData({ rows: "3", columns: "3", includeHeaders: true });
          break;
        case "poll":
          setData({
            question: "",
            options: [
                { text: "", uid: "1", votes: 0 }, 
                { text: "", uid: "2", votes: 0 }
            ],
          });
          break;
        case "equation":
          setData({ equation: "e = mc^2", inline: false });
          break;
        case "layout":
          setData({ templateColumns: "1fr 1fr" });
          break;
        default:
          setData({});
          break;
      }
    }
  }, [open, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(data);
    onOpenChange(false);
  };

  const handleImageFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !imageUploadDraftId) return;

    setIsUploadingImage(true);
    const toastId = toast.loading("이미지를 업로드하는 중입니다.");
    try {
      const uploaded = await uploadPostImage({
        file,
        draftId: imageUploadDraftId,
        postId: imageUploadPostId,
      });
      setData((prev) => ({
        ...prev,
        src: uploaded.url,
        altText: prev.altText || file.name,
        width: uploaded.width ?? undefined,
        height: uploaded.height ?? undefined,
      }));
      toast.success("이미지를 업로드했습니다.", { id: toastId });
    } catch (error) {
      console.error("Image file upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.",
        { id: toastId },
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const renderContent = () => {
    switch (type) {
      case "youtube":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube URL or Video ID</Label>
              <Input
                id="youtube-url"
                value={data.url || ""}
                onChange={(e) => setData({ ...data, url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          </div>
        );
      case "image":
        return (
          <div className="space-y-4">
            {imageUploadDraftId ? (
              <div className="space-y-2">
                <Label htmlFor="image-file">Image File</Label>
                <Input
                  id="image-file"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={isUploadingImage}
                  onChange={handleImageFileChange}
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="image-src">Image URL</Label>
              <Input
                id="image-src"
                value={data.src || ""}
                onChange={(e) => setData({ ...data, src: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input
                id="image-alt"
                value={data.altText || ""}
                onChange={(e) => setData({ ...data, altText: e.target.value })}
                placeholder="Description of the image"
              />
            </div>
          </div>
        );
      case "tweet":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tweet-url">Tweet URL</Label>
              <Input
                id="tweet-url"
                value={data.url || ""}
                onChange={(e) => setData({ ...data, url: e.target.value })}
                placeholder="https://x.com/username/status/..."
              />
            </div>
          </div>
        );
      case "table":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="table-rows">행 수</Label>
                <Input
                  id="table-rows"
                  type="number"
                  min="1"
                  max="20"
                  value={data.rows || "3"}
                  onChange={(e) => setData({ ...data, rows: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="table-columns">열 수</Label>
                <Input
                  id="table-columns"
                  type="number"
                  min="1"
                  max="10"
                  value={data.columns || "3"}
                  onChange={(e) => setData({ ...data, columns: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="include-headers"
                checked={data.includeHeaders ?? true}
                onCheckedChange={(checked) =>
                  setData({ ...data, includeHeaders: checked })
                }
              />
              <Label htmlFor="include-headers">헤더 행 포함</Label>
            </div>
          </div>
        );
      case "poll":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="poll-question">Question</Label>
              <Input
                id="poll-question"
                value={data.question || ""}
                onChange={(e) =>
                  setData({ ...data, question: e.target.value })
                }
                placeholder="Ask a question..."
              />
            </div>
            <div className="space-y-2">
              <Label>Options</Label>
              {data.options?.map((option, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option.text}
                    onChange={(e) => {
                      const newOptions = [...(data.options ?? [])];
                      newOptions[index].text = e.target.value;
                      setData({ ...data, options: newOptions });
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        const newOptions = data.options?.filter((_, i: number) => i !== index) ?? [];
                        setData({ ...data, options: newOptions });
                    }}
                    disabled={(data.options?.length ?? 0) <= 2}
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                   const newOptions = [...(data.options ?? []), { text: "", uid: Date.now().toString(), votes: 0 }];
                   setData({ ...data, options: newOptions });
                }}
                className="w-full"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        );
      case "equation":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="equation">Equation (LaTeX)</Label>
              <Input
                id="equation"
                value={data.equation || ""}
                onChange={(e) =>
                  setData({ ...data, equation: e.target.value })
                }
                placeholder="e = mc^2"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="inline-mode"
                checked={data.inline || false}
                onCheckedChange={(checked) =>
                  setData({ ...data, inline: checked })
                }
              />
              <Label htmlFor="inline-mode">Inline Equation</Label>
            </div>
          </div>
        );
      case "layout":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="layout-select">Column Layout</Label>
              <Select
                value={data.templateColumns || "1fr 1fr"}
                onValueChange={(value) =>
                  setData({ ...data, templateColumns: value ?? undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1fr 1fr">2 Columns (Equal)</SelectItem>
                    <SelectItem value="1fr 1fr 1fr">3 Columns (Equal)</SelectItem>
                    <SelectItem value="2fr 1fr">2 Columns (2:1)</SelectItem>
                    <SelectItem value="1fr 2fr">2 Columns (1:2)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "youtube": return "Insert YouTube Video";
      case "image": return "Insert Image";
      case "tweet": return "Insert Tweet";
      case "poll": return "Insert Poll";
      case "equation": return "Insert Equation";
      case "layout": return "Insert Layout";
      case "table": return "표 삽입";
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            Enter the details to insert into the editor.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">{renderContent()}</div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploadingImage}>
              {isUploadingImage ? "Uploading..." : "Insert"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
