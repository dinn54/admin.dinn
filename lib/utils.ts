import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function estimateReadTimeMinutes(content?: string | null) {
  if (!content) return 0
  const wordCount = content
    .replace(/[`*_>#\[\]\(\)!~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length
  if (!wordCount) return 0
  return Math.max(1, Math.ceil(wordCount / 200))
}
