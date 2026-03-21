import { generateHtmlFromContent } from "@/lib/generateHtmlFromContent";
import theme from "@/components/editor/theme";
import { cn } from "@/lib/utils";
import {
  readOnlyRenderContentClassName,
  readOnlyRenderFrameClassName,
  readOnlyRenderRootClassName,
  readOnlyRenderScrollAreaClassName,
} from "@/components/editor/readOnlyRenderShell";

interface ServerGeneratedLexicalHtmlProps {
  content: string;
  className?: string;
}

export function ServerGeneratedLexicalHtml({
  content,
  className,
}: ServerGeneratedLexicalHtmlProps) {
  const html = generateHtmlFromContent(content);

  return (
    <div className={cn(readOnlyRenderRootClassName, className)}>
      <div className={readOnlyRenderFrameClassName}>
        <div data-editor-scroll-area className={readOnlyRenderScrollAreaClassName}>
          <div
            className={cn(readOnlyRenderContentClassName, theme.root)}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
