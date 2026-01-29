"use client";
import * as React from "react";
import { useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { NodeKey, $getNodeByKey } from "lexical";
import { PollOption } from "./PollNode";

export default function PollComponent({
  question,
  options: initialOptions,
  nodeKey,
}: {
  question: string;
  options: PollOption[];
  nodeKey?: NodeKey;
}) {
  const [options, setOptions] = useState(initialOptions);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [editor] = useLexicalComposerContext();

  const handleVote = (optionId: string) => {
    if (userVote === optionId) return; // Already voted for this

    const newOptions = options.map((opt) => {
      if (opt.uid === optionId) {
        return { ...opt, votes: opt.votes + 1 };
      }
      if (opt.uid === userVote) {
        return { ...opt, votes: opt.votes - 1 };
      }
      return opt;
    });

    setOptions(newOptions);
    setUserVote(optionId);

    // In a real app, you would save this vote to the backend here.
    // For the editor, maybe we should update the node data?
    // But if it's "read-only" (viewing), we don't want to change the document content structure usually.
    // However, if we want to reflect it in the editor state:
    if (nodeKey) {
      editor.update(() => {
        // const node = $getNodeByKey(nodeKey); // We would update the node here
        // For this demo, local state is fine.
      });
    }
  };

  return (
    <div className="border rounded-lg p-4 max-w-sm bg-card my-4 shadow-sm">
      <h3 className="font-bold mb-4 text-lg">{question}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <div
            key={option.uid}
            onClick={() => handleVote(option.uid)}
            className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-all ${
              userVote === option.uid
                ? "bg-primary/10 border-primary ring-1 ring-primary"
                : "hover:bg-muted/50"
            }`}
          >
            <span className="font-medium">{option.text}</span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                {option.votes} votes
              </span>
              {userVote === option.uid && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
          </div>
        ))}
      </div>
      {userVote && (
        <div className="mt-4 text-center text-sm text-muted-foreground animate-in fade-in">
          투표해주셔서 감사합니다!
        </div>
      )}
    </div>
  );
}
