"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface Tag {
  name: string;
  count: number;
}

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  maxTags?: number;
}

export function TagInput({ tags, setTags, maxTags = 5 }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Fetch tags logic
  const fetchTags = React.useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tags?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const json = await res.json();
        setSuggestions(json.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch tags", error);
    } finally {
      setIsLoading(false);
      setShowSuggestions(true);
    }
  }, []);

  // Debounce search or fetch on focus
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTags(inputValue);
    }, 300); // 300ms debounce for typing
    return () => clearTimeout(timer);
  }, [inputValue, , fetchTags]);

  // Handle Input Focus
  const handleFocus = () => {
    setShowSuggestions(true);
    // Removed explicit fetchTags call to avoid double-fetching (useEffect handles it)
  };

  // Handle selecting a tag from suggestions
  const selectTag = (tagName: string) => {
    if (!tags.includes(tagName) && tags.length < maxTags) {
      setTags([...tags, tagName]);
    }
    setInputValue("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle adding a new tag manually
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Fix Korean IME composition issue: ignore Enter key during composition
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      // Add current input as tag if it's not empty
      if (!tags.includes(inputValue.trim()) && tags.length < maxTags) {
        setTags([...tags, inputValue.trim()]);
      }
      setInputValue("");
      setShowSuggestions(false);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-3 relative">
      <Label>태그</Label>

      {/* Selected Tags Display (Input Complete Area - Above) */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" size="lg">
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-destructive focus:outline-none"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Input Field */}
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder={
            tags.length >= maxTags
              ? "최대 개수에 도달했습니다"
              : "태그 입력 후 Enter..."
          }
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          disabled={tags.length >= maxTags}
        />
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Suggestions List (Static Below Input) */}
      {showSuggestions &&
        suggestions.filter((t) => !tags.includes(t.name)).length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-2">추천 태그</p>
            <div className="flex flex-wrap gap-2">
              {suggestions
                .filter((tag) => !tags.includes(tag.name))
                .map((tag) => (
                  <Badge
                    key={tag.name}
                    variant="outline"
                    size="lg"
                    onClick={() => selectTag(tag.name)}
                    className="cursor-pointer select-none hover:bg-accent"
                  >
                    #{tag.name}
                  </Badge>
                ))}
            </div>
          </div>
        )}

      {/* Helper Text */}
      <div className="mt-1 min-h-[1.25rem]">
        {!showSuggestions && (
          <p className="text-[10px] text-muted-foreground">
            최대 {maxTags}개까지 입력 가능합니다.
          </p>
        )}
        {showSuggestions &&
          suggestions.length === 0 &&
          !isLoading &&
          inputValue &&
          !tags.includes(inputValue.trim()) && (
            <p
              className="text-[10px] text-blue-500 cursor-pointer"
              onClick={() => {
                if (tags.length < maxTags) {
                  setTags([...tags, inputValue.trim()]);
                  setInputValue("");
                }
              }}
            >
              엔터 키를 눌러 "{inputValue}" 태그를 생성하세요.
            </p>
          )}
      </div>
    </div>
  );
}
