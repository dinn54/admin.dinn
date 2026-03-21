"use client";

import { Tweet } from "react-tweet";
import theme from "../theme";

interface TweetEmbedProps {
  id: string;
  width?: number;
}

export function TweetEmbed({ id, width = 450 }: TweetEmbedProps) {
  return (
    <div style={{ width, maxWidth: "100%" }}>
      <Tweet
        id={id}
        fallback={
          <div className={theme.media.fallback}>
            <div
              className={`${theme.media.fallbackLine} ${theme.media.fallbackLineTitle}`}
            />
            <div className={theme.media.fallbackLine} />
            <div
              className={`${theme.media.fallbackLine} ${theme.media.fallbackLineShort}`}
            />
          </div>
        }
        onError={() => null}
      />
    </div>
  );
}
