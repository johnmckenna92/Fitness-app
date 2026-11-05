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
 * Uploads an image base64 buffer to the Supabase 'avatars' storage bucket
 * and returns the public URL.
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

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return data?.publicUrl || null;
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
