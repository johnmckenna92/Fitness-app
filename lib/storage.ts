import { supabase } from "./supabase";

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

/**
 * Converts a base64 string to an ArrayBuffer in pure JS,
 * ensuring compatibility with React Native and Hermes runtime.
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  // Strip data URL prefixes (e.g. data:image/jpeg;base64,) if present
  const clean = base64.replace(/^data:image\/[a-z]+;base64,/, "").trim();
  const len = clean.length;
  let bufferLength = len * 0.75;
  if (clean.charAt(len - 1) === "=") {
    bufferLength--;
    if (clean.charAt(len - 2) === "=") {
      bufferLength--;
    }
  }

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);

  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const encoded1 = CHARS.indexOf(clean[i]);
    const encoded2 = CHARS.indexOf(clean[i + 1]);
    const encoded3 = CHARS.indexOf(clean[i + 2]);
    const encoded4 = CHARS.indexOf(clean[i + 3]);

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (encoded3 !== 64 && clean[i + 2] !== "=") {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (encoded4 !== 64 && clean[i + 3] !== "=") {
      bytes[p++] = ((encoded3 & 3) << 6) | encoded4;
    }
  }

  return arrayBuffer;
}

/**
 * Extracts storage object path from a raw Supabase public or signed URL,
 * or returns the path as-is if already a clean relative path.
 */
export function extractStoragePath(bucket: string, pathOrUrl: string): string {
  if (!pathOrUrl) return "";
  const bucketSegment = `/${bucket}/`;
  const idx = pathOrUrl.indexOf(bucketSegment);
  if (idx !== -1) {
    const rawPath = pathOrUrl.substring(idx + bucketSegment.length);
    // Strip any query params (e.g. token, t)
    return rawPath.split("?")[0];
  }
  return pathOrUrl.split("?")[0];
}

/**
 * Generates an RLS-protected signed URL for private Supabase storage assets (GDPR compliance).
 * Prevents raw public asset enumeration and access without valid JWT session.
 */
export async function getSecureSignedUrl(
  bucket: string,
  pathOrUrl: string | null | undefined,
  expiresInSeconds: number = 3600
): Promise<string | null> {
  if (!pathOrUrl || typeof pathOrUrl !== "string") return null;

  // External web URLs (http/https outside Supabase) can pass through
  if (pathOrUrl.startsWith("http") && !pathOrUrl.includes("supabase.co/storage")) {
    return pathOrUrl;
  }

  const cleanPath = extractStoragePath(bucket, pathOrUrl);
  if (!cleanPath) return null;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(cleanPath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.warn(`[SecureStorage] Failed to create signed URL for ${bucket}/${cleanPath}:`, error?.message);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.error(`[SecureStorage] Exception creating signed URL:`, err);
    return null;
  }
}

/**
 * Convenience helper to resolve an avatar path or Supabase URL to a GDPR-compliant signed URL.
 */
export async function getSecureAvatarUrl(avatarPathOrUrl: string | null | undefined): Promise<string | null> {
  return getSecureSignedUrl("avatars", avatarPathOrUrl, 3600);
}

/**
 * Uploads an image base64 buffer to the private Supabase 'avatars' storage bucket
 * and returns a secure signed URL.
 */
export async function uploadAvatar(
  userId: string,
  base64: string,
  mimeType: string = "image/jpeg",
): Promise<string | null> {
  try {
    const ext = (mimeType || "image/jpeg").includes("png") ? "png" : "jpg";
    const filePath = `${userId}/avatar_${Date.now()}.${ext}`;
    const arrayBuffer = base64ToArrayBuffer(base64);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, arrayBuffer, {
        contentType: mimeType || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading avatar to Supabase storage:", uploadError);
      return null;
    }

    // Return secure signed URL (valid for 1 week)
    const { data, error: signError } = await supabase.storage
      .from("avatars")
      .createSignedUrl(filePath, 60 * 60 * 24 * 7);

    if (signError || !data?.signedUrl) {
      console.warn("Could not generate signed URL on upload:", signError);
      return filePath;
    }

    return data.signedUrl;
  } catch (err) {
    console.error("Failed to upload avatar to Supabase:", err);
    return null;
  }
}

/**
 * Uploads a document/image base64 buffer to the Supabase 'pt-notes' storage bucket
 * and returns the public URL.
 */
export async function uploadPTNote(
  userId: string,
  base64: string,
  mimeType: string = "image/jpeg",
): Promise<string | null> {
  try {
    const ext = (mimeType || "image/jpeg").includes("png")
      ? "png"
      : (mimeType || "image/jpeg").includes("pdf")
        ? "pdf"
        : "jpg";
    const filePath = `${userId}/pt_note_${Date.now()}.${ext}`;
    const arrayBuffer = base64ToArrayBuffer(base64);

    const { error: uploadError } = await supabase.storage
      .from("pt-notes")
      .upload(filePath, arrayBuffer, {
        contentType: mimeType || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error(
        "Error uploading PT note to Supabase storage:",
        uploadError,
      );
      return null;
    }

    const { data } = supabase.storage.from("pt-notes").getPublicUrl(filePath);
    return data?.publicUrl || null;
  } catch (err) {
    console.error("Failed to upload PT note to Supabase:", err);
    return null;
  }
}
