import { supabase } from "./supabase";

export interface ImageSafetyResult {
  isSafe: boolean;
  reason: string;
}

/**
 * Validates an image's safety against UGC guidelines using Supabase Edge Function 'image-safety'.
 * Returns an ImageSafetyResult indicating whether the image is safe.
 *
 * @param base64Image - Base64-encoded image string (with or without data URI prefix).
 * @param mimeType - Optional MIME type of the image, defaults to 'image/jpeg'.
 */
export async function validateImageSafety(
  base64Image: string,
  mimeType: string = "image/jpeg",
): Promise<ImageSafetyResult> {
  if (!base64Image || typeof base64Image !== "string" || base64Image.trim().length === 0) {
    return {
      isSafe: false,
      reason: "No image data provided for safety validation.",
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke("image-safety", {
      body: {
        base64Image,
        mimeType,
      },
    });

    if (error) {
      console.error("Supabase Edge Function image-safety returned error:", error);
      return {
        isSafe: false,
        reason: error.message || "Image moderation service is unavailable.",
      };
    }

    const isSafe = Boolean(data?.isSafe);
    const reason =
      typeof data?.reason === "string" && data.reason.trim().length > 0
        ? data.reason.trim()
        : isSafe
        ? "Image meets content safety standards."
        : "Image violates App Store safety guidelines.";

    return {
      isSafe,
      reason,
    };
  } catch (err: any) {
    console.error("Image safety check failed:", err);
    return {
      isSafe: false,
      reason:
        err?.message ||
        "Safety verification could not be completed. Please try again.",
    };
  }
}

/**
 * Re-engineers a user's meal idea to maximize protein and optimize macros for
 * body recomposition with prep time under 20 minutes using Supabase Edge Function 'fix-meal'.
 *
 * @param input - The meal description provided by the user.
 * @returns Markdown-formatted nutritionist breakdown.
 */
export async function fixMyMeal(input: string): Promise<string> {
  const trimmed = input?.trim();
  if (!trimmed) {
    throw new Error("Please enter a meal idea to fix.");
  }

  try {
    const { data, error } = await supabase.functions.invoke("fix-meal", {
      body: { meal: trimmed },
    });

    if (error) {
      throw new Error(error.message || "Failed to re-engineer meal.");
    }

    const output = data?.markdown?.trim();
    if (!output) {
      throw new Error("Edge Function returned an empty response. Please try again.");
    }

    return output;
  } catch (err: any) {
    console.error("fixMyMeal failed:", err);
    throw new Error(
      err?.message || "Failed to re-engineer meal. Please try again."
    );
  }
}


export interface AisleGroup {
  aisle: string;
  items: string[];
}

/**
 * Collates and sums weekly raw ingredients, normalizing them into standard
 * UK supermarket packet sizes grouped by aisle using Supabase Edge Function 'supply-chain'.
 *
 * @param rawIngredients - List of all raw ingredient strings from the weekly protocol.
 * @returns Array of grouped aisle objects with standardized grocery items.
 */
export async function optimizeShoppingList(
  rawIngredients: string[],
): Promise<AisleGroup[]> {
  if (!rawIngredients || rawIngredients.length === 0) {
    return [];
  }

  try {
    const { data, error } = await supabase.functions.invoke("supply-chain", {
      body: { ingredients: rawIngredients },
    });

    if (error) {
      throw new Error(error.message || "Failed to organize grocery list items.");
    }

    if (Array.isArray(data)) {
      if (data.length > 0 && typeof data[0] === "object" && data[0] !== null && "aisle" in data[0]) {
        return data.map((group: any) => ({
          aisle: String(group.aisle || "General"),
          items: Array.isArray(group.items) ? group.items.map((i: any) => String(i).trim()).filter(Boolean) : [],
        }));
      }

      return [{
        aisle: "General",
        items: data.map((item: any) => String(item).trim()).filter(Boolean),
      }];
    }

    if (data && Array.isArray(data.items)) {
      return [{
        aisle: "General",
        items: data.items.map((item: any) => String(item).trim()).filter(Boolean),
      }];
    }

    throw new Error("Invalid format received from grocery optimizer.");
  } catch (err: any) {
    console.error("Supabase Edge Function optimizeShoppingList failed:", err);
    throw new Error(
      err?.message || "Failed to organize grocery list items.",
    );
  }
}

/**
 * Backward compatibility alias for optimizeShoppingList.
 */
export const optimizeSupplyChain = optimizeShoppingList;

