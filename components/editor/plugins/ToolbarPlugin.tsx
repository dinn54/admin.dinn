import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $getNodeByKey,
} from "lexical";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $isListNode,
  ListNode,
  REMOVE_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  $isCodeNode,
  $createCodeNode,
  CODE_LANGUAGE_MAP,
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
} from "@lexical/code";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  FileCode,
  Link,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image,
  Youtube,
  Twitter,
  Plus,
} from "lucide-react";
import { Toggle } from "../../ui/toggle";
import { Button } from "../../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { InsertDialog, InsertType } from "./insert-dialog";
import { INSERT_IMAGE_COMMAND } from "../nodes/ImageNode";
import { INSERT_TWEET_COMMAND } from "../nodes/TweetNode";
import { INSERT_YOUTUBE_COMMAND } from "./insert-plugin";

const LowPriority = 1;

// Helper function to extract YouTube video ID from URL
function extractYouTubeVideoId(url: string): string | null {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Helper function to extract Tweet ID from URL
function extractTweetId(url: string): string | null {
  // Handle twitter.com and x.com URLs
  const pattern = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/;
  const match = url.match(pattern);
  if (match) return match[1];

  // Check if it's just a number (direct ID)
  if (/^\d+$/.test(url)) return url;

  return null;
}

const blockTypeToBlockName: Record<string, string> = {
  bullet: "글머리 기호 목록",
  check: "체크 리스트",
  code: "코드 블록",
  h1: "제목 1",
  h2: "제목 2",
  h3: "제목 3",
  h4: "제목 4",
  h5: "제목 5",
  h6: "제목 6",
  ol: "번호 매기기 목록",
  ul: "글머리 기호 목록",
  paragraph: "본문",
  quote: "인용구",
};

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] = useState("paragraph");
  const [selectedElementKey, setSelectedElementKey] = useState<string | null>(
    null
  );
  const [showBlockOptionsDropDown, setShowBlockOptionsDropDown] =
    useState(false);
  const [codeLanguage, setCodeLanguage] = useState("");
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);

  // Insert dialog state
  const [insertDialogOpen, setInsertDialogOpen] = useState(false);
  const [insertType, setInsertType] = useState<InsertType>(null);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = element.getParent();
          const type = $isListNode(parentList)
            ? parentList.getTag()
            : element.getTag();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
          if ($isCodeNode(element)) {
            setCodeLanguage(element.getLanguage() || "");
          }
        }
      }
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));
      setIsLink(false);

      // Check if node is a link
      const node = selection.anchor.getNode();
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      }
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar();
        return false;
      },
      LowPriority
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  useEffect(() => {
    return editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload);
        return false;
      },
      LowPriority
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload);
        return false;
      },
      LowPriority
    );
  }, [editor]);

  const formatParagraph = () => {
    if (blockType !== "paragraph") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      });
    }
  };

  const formatHeading = (headingSize: "h1" | "h2" | "h3") => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== "ul") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== "ol") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatCode = () => {
    if (blockType !== "code") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createCodeNode());
        }
      });
    } else {
      formatParagraph();
    }
  };

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const handleOpenInsertDialog = (type: InsertType) => {
    setInsertType(type);
    setInsertDialogOpen(true);
  };

  const handleInsertConfirm = (data: any) => {
    switch (insertType) {
      case "image":
        if (data.src) {
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            src: data.src,
            altText: data.altText || "",
          });
        }
        break;
      case "youtube":
        if (data.url) {
          // Extract video ID from URL
          const videoId = extractYouTubeVideoId(data.url);
          if (videoId) {
            editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, videoId);
          }
        }
        break;
      case "tweet":
        if (data.url) {
          // Extract tweet ID from URL
          const tweetId = extractTweetId(data.url);
          if (tweetId) {
            editor.dispatchCommand(INSERT_TWEET_COMMAND, tweetId);
          }
        }
        break;
    }
  };

  return (
    <div
      className="flex flex-wrap items-center gap-1 border-b p-2 bg-background shrink-0 z-10"
      ref={toolbarRef}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        disabled={!canUndo}
        className="h-8 w-8"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        disabled={!canRedo}
        className="h-8 w-8"
      >
        <Redo className="h-4 w-4" />
      </Button>
      <div className="w-[1px] h-6 bg-border mx-1" />

      <Select
        value={blockType}
        onValueChange={(value) => {
          if (value === "paragraph") formatParagraph();
          else if (value === "h1") formatHeading("h1");
          else if (value === "h2") formatHeading("h2");
          else if (value === "h3") formatHeading("h3");
          else if (value === "quote") formatQuote();
          else if (value === "ul") formatBulletList();
          else if (value === "ol") formatNumberedList();
          else if (value === "code") formatCode();
        }}
      >
        <SelectTrigger className="w-[140px] h-8">
          <SelectValue>{blockTypeToBlockName[blockType]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">본문</SelectItem>
          <SelectItem value="h1">제목 1</SelectItem>
          <SelectItem value="h2">제목 2</SelectItem>
          <SelectItem value="h3">제목 3</SelectItem>
          <SelectItem value="quote">인용구</SelectItem>
          <SelectItem value="ul">글머리 기호 목록</SelectItem>
          <SelectItem value="ol">번호 매기기 목록</SelectItem>
          <SelectItem value="code">코드 블록</SelectItem>
        </SelectContent>
      </Select>

      <div className="w-[1px] h-6 bg-border mx-1" />

      <Toggle
        pressed={isBold}
        onPressedChange={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
        }
        aria-label="Toggle bold"
        className="h-8 w-8 p-0"
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={isItalic}
        onPressedChange={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
        }
        aria-label="Toggle italic"
        className="h-8 w-8 p-0"
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={isUnderline}
        onPressedChange={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
        }
        aria-label="Toggle underline"
        className="h-8 w-8 p-0"
      >
        <Underline className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={isStrikethrough}
        onPressedChange={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }
        aria-label="Toggle strikethrough"
        className="h-8 w-8 p-0"
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={isCode}
        onPressedChange={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")
        }
        aria-label="Toggle code"
        className="h-8 w-8 p-0"
      >
        <Code className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={blockType === "code"}
        onPressedChange={formatCode}
        aria-label="Toggle code block"
        className="h-8 w-8 p-0"
      >
        <FileCode className="h-4 w-4" />
      </Toggle>

      <div className="w-[1px] h-6 bg-border mx-1" />

      <Toggle
        pressed={isLink}
        onPressedChange={insertLink}
        aria-label="Insert Link"
        className="h-8 w-8 p-0"
      >
        <Link className="h-4 w-4" />
      </Toggle>

      <div className="w-[1px] h-6 bg-border mx-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
        className="h-8 w-8"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
        className="h-8 w-8"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
        className="h-8 w-8"
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")
        }
        className="h-8 w-8"
      >
        <AlignJustify className="h-4 w-4" />
      </Button>

      <div className="w-[1px] h-6 bg-border mx-1" />

      {/* Insert Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 gap-1 px-2">
          <Plus className="h-4 w-4" />
          <span className="text-xs">삽입</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleOpenInsertDialog("image")}>
            <Image className="h-4 w-4 mr-2" />
            이미지
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenInsertDialog("youtube")}>
            <Youtube className="h-4 w-4 mr-2" />
            YouTube
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenInsertDialog("tweet")}>
            <Twitter className="h-4 w-4 mr-2" />
            트윗
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Insert Dialog */}
      <InsertDialog
        open={insertDialogOpen}
        onOpenChange={setInsertDialogOpen}
        type={insertType}
        onConfirm={handleInsertConfirm}
      />
    </div>
  );
}
