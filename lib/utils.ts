import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseLexicalEditorState } from "./content-format"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function estimateReadTimeMinutes(content?: string | null) {
  if (!content) return 0
  const lexicalState = parseLexicalEditorState(content)
  const normalizedContent = lexicalState
    ? extractTextFromLexicalState(lexicalState)
    : content

  const wordCount = normalizedContent
    .replace(/[`*_>#\[\]\(\)!~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length
  if (!wordCount) return 0
  return Math.max(1, Math.ceil(wordCount / 200))
}

function extractTextFromLexicalState(state: unknown): string {
  const parts: string[] = []

  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return
    const record = node as Record<string, unknown>
    const text = record.text
    if (typeof text === "string") parts.push(text)

    const children = record.children
    if (Array.isArray(children)) {
      children.forEach(walk)
    }
  }

  walk(state)
  return parts.join(" ")
}
