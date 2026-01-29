
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

export type InsertType =
  | "youtube"
  | "image"
  | "tweet"
  | "poll"
  | "equation"
  | "layout"
  | null;

interface InsertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: InsertType;
  onConfirm: (data: any) => void;
}

export function InsertDialog({
  open,
  onOpenChange,
  type,
  onConfirm,
}: InsertDialogProps) {
  const [data, setData] = useState<any>({});

  useEffect(() => {
    if (open) {
      // Reset data on open based on type
      switch (type) {
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
              {data.options?.map((option: any, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option.text}
                    onChange={(e) => {
                      const newOptions = [...data.options];
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
                        const newOptions = data.options.filter((_: any, i: number) => i !== index);
                        setData({ ...data, options: newOptions });
                    }}
                    disabled={data.options.length <= 2}
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
                   const newOptions = [...data.options, { text: "", uid: Date.now().toString(), votes: 0 }];
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
                  setData({ ...data, templateColumns: value })
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
            <Button type="submit">Insert</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
