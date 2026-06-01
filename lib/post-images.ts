import "server-only";

import sharp from "sharp";
import { supabase } from "@/lib/supabase";

export const POST_IMAGE_BUCKET = "dinn_dev";
const TEMP_PREFIX = "posts/temp";
const POST_PREFIX = "posts";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_WIDTH = 1600;
const WEBP_QUALITY = 82;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type RewriteResult = {
  content: string;
  moved: number;
};

export function assertPostImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("JPG, PNG, WebP 이미지만 업로드할 수 있습니다.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("이미지는 10MB 이하만 업로드할 수 있습니다.");
  }
}

function createAssetName() {
  return `${crypto.randomUUID()}.webp`;
}

export function createPostImagePath({
  draftId,
  postId,
}: {
  draftId?: string | null;
  postId?: string | null;
}) {
  if (postId) {
    return `${POST_PREFIX}/${postId}/${createAssetName()}`;
  }

  if (!draftId) {
    throw new Error("draftId 또는 postId가 필요합니다.");
  }

  return `${TEMP_PREFIX}/${draftId}/${createAssetName()}`;
}

export function getPostImagePublicUrl(path: string) {
  const { data } = supabase.storage.from(POST_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function optimizePostImage(file: File) {
  const input = Buffer.from(await file.arrayBuffer());
  const image = sharp(input, { failOn: "none" }).rotate();
  const metadata = await image.metadata();

  const output = await image
    .resize({
      width: MAX_IMAGE_WIDTH,
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  const outputMetadata = await sharp(output).metadata();

  return {
    buffer: output,
    width: outputMetadata.width ?? metadata.width ?? null,
    height: outputMetadata.height ?? metadata.height ?? null,
  };
}

export async function uploadOptimizedPostImage({
  file,
  draftId,
  postId,
}: {
  file: File;
  draftId?: string | null;
  postId?: string | null;
}) {
  assertPostImageFile(file);

  const path = createPostImagePath({ draftId, postId });
  const optimized = await optimizePostImage(file);
  const { error } = await supabase.storage
    .from(POST_IMAGE_BUCKET)
    .upload(path, optimized.buffer, {
      cacheControl: "31536000",
      contentType: "image/webp",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return {
    path,
    url: getPostImagePublicUrl(path),
    width: optimized.width,
    height: optimized.height,
  };
}

function getPublicUrlPrefix() {
  return getPostImagePublicUrl("");
}

function storagePathFromPublicUrl(url: string) {
  const prefix = getPublicUrlPrefix();
  if (!url.startsWith(prefix)) return null;
  return url.slice(prefix.length).replace(/^\/+/, "");
}

function replaceImageSrcs(
  value: unknown,
  replacements: Map<string, string>,
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => replaceImageSrcs(item, replacements));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const next: Record<string, unknown> = { ...(value as Record<string, unknown>) };
  if (next.type === "image" && typeof next.src === "string") {
    next.src = replacements.get(next.src) ?? next.src;
  }

  for (const [key, child] of Object.entries(next)) {
    if (key === "src") continue;
    next[key] = replaceImageSrcs(child, replacements);
  }

  return next;
}

export async function moveTempPostImages({
  content,
  draftId,
  postId,
}: {
  content: string;
  draftId?: string | null;
  postId: string;
}): Promise<RewriteResult> {
  if (!draftId) return { content, moved: 0 };

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return { content, moved: 0 };
  }

  const tempPrefix = `${TEMP_PREFIX}/${draftId}/`;
  const replacements = new Map<string, string>();
  const pathsToMove = new Map<string, string>();

  function collect(value: unknown) {
    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }

    if (!value || typeof value !== "object") return;

    const node = value as Record<string, unknown>;
    if (node.type === "image" && typeof node.src === "string") {
      const sourcePath = storagePathFromPublicUrl(node.src);
      if (sourcePath?.startsWith(tempPrefix)) {
        const fileName = sourcePath.split("/").pop();
        if (fileName) {
          const targetPath = `${POST_PREFIX}/${postId}/${fileName}`;
          pathsToMove.set(sourcePath, targetPath);
          replacements.set(node.src, getPostImagePublicUrl(targetPath));
        }
      }
    }

    Object.values(node).forEach(collect);
  }

  collect(parsed);

  for (const [sourcePath, targetPath] of pathsToMove) {
    const { error } = await supabase.storage
      .from(POST_IMAGE_BUCKET)
      .move(sourcePath, targetPath);

    if (error) {
      throw new Error(error.message);
    }
  }

  if (replacements.size === 0) {
    return { content, moved: 0 };
  }

  const rewritten = replaceImageSrcs(parsed, replacements);
  return {
    content: JSON.stringify(rewritten),
    moved: replacements.size,
  };
}
