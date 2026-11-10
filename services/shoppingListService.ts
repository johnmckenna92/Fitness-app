import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { ChecklistSection, ShoppingListRecord } from "../types/database";

export const SHOPPING_RAW_STORAGE_KEY = "@protocol_weekly_ingredients";
export const SHOPPING_CHECKLIST_STORAGE_KEY = "@shopping_list_checklist_v2";
export const SHOPPING_HISTORY_STORAGE_KEY = "@shopping_list_history_v1";

export interface ArchivedShoppingList {
  id: string;
  archivedAt: string;
  title: string;
  totalItems: number;
  checkedItems: number;
  adherenceRate: number;
  sections: ChecklistSection[];
  rawIngredients: string[];
}

export interface ShoppingAnalyticsSummary {
  totalItems: number;
  checkedItems: number;
  adherenceRate: number;
  lastUpdated: string | null;
  sections: ChecklistSection[];
  rawIngredients: string[];
}

/**
 * Loads the user's shopping list with an offline-first hybrid pattern:
 * 1. Reads local AsyncStorage instantly for zero-latency UI rendering.
 * 2. In the background or if online, checks Supabase 'shopping_lists' for newer cloud state.
 */
export async function loadShoppingList(userId?: string): Promise<{
  rawIngredients: string[];
  sections: ChecklistSection[];
  fromCloud: boolean;
}> {
  let localRaw: string[] = [];
  let localSections: ChecklistSection[] = [];

  try {
    const rawVal = await AsyncStorage.getItem(SHOPPING_RAW_STORAGE_KEY);
    if (rawVal) localRaw = JSON.parse(rawVal);
    const secVal = await AsyncStorage.getItem(SHOPPING_CHECKLIST_STORAGE_KEY);
    if (secVal) localSections = JSON.parse(secVal);
  } catch (err) {
    console.warn("[shoppingListService] Local read error:", err);
  }

  // If no authenticated user ID, return local state directly
  if (!userId) {
    return { rawIngredients: localRaw, sections: localSections, fromCloud: false };
  }

  try {
    const { data, error } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) {
      const cloudSections = Array.isArray(data.sections)
        ? (data.sections as ChecklistSection[])
        : [];
      const cloudRaw = Array.isArray(data.raw_ingredients)
        ? (data.raw_ingredients as string[])
        : [];

      // If cloud has data, update local cache to mirror synced state
      if (cloudSections.length > 0 || cloudRaw.length > 0) {
        await AsyncStorage.setItem(SHOPPING_RAW_STORAGE_KEY, JSON.stringify(cloudRaw));
        await AsyncStorage.setItem(
          SHOPPING_CHECKLIST_STORAGE_KEY,
          JSON.stringify(cloudSections)
        );
        return {
          rawIngredients: cloudRaw,
          sections: cloudSections,
          fromCloud: true,
        };
      } else if (localSections.length > 0 || localRaw.length > 0) {
        // If local has data but cloud is empty, sync local state up to cloud
        await saveShoppingList(localRaw, localSections, userId);
      }
    }
  } catch (err) {
    console.warn("[shoppingListService] Cloud sync fallback to local:", err);
  }

  return { rawIngredients: localRaw, sections: localSections, fromCloud: false };
}

/**
 * Saves shopping list changes.
 * Updates local AsyncStorage synchronously, then asynchronously syncs to Supabase.
 */
export async function saveShoppingList(
  rawIngredients: string[],
  sections: ChecklistSection[],
  userId?: string
): Promise<void> {
  // 1. Optimistic local persistence for offline reliability
  try {
    await AsyncStorage.setItem(SHOPPING_RAW_STORAGE_KEY, JSON.stringify(rawIngredients));
    await AsyncStorage.setItem(
      SHOPPING_CHECKLIST_STORAGE_KEY,
      JSON.stringify(sections)
    );
  } catch (err) {
    console.warn("[shoppingListService] Local save failure:", err);
  }

  if (!userId) return;

  // 2. Compute metrics for trainer analytics
  const allItems = sections.flatMap((sec) => sec.data || []);
  const totalItems = allItems.length;
  const checkedItems = allItems.filter((it) => it.checked).length;
  const adherenceRate = totalItems > 0 ? Number(((checkedItems / totalItems) * 100).toFixed(2)) : 0;

  // 3. Upsert to Supabase
  try {
    await supabase.from("shopping_lists").upsert(
      {
        user_id: userId,
        raw_ingredients: rawIngredients,
        sections: sections as any,
        total_items: totalItems,
        checked_items: checkedItems,
        adherence_rate: adherenceRate,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch (err) {
    console.warn("[shoppingListService] Cloud upsert skipped/failed:", err);
  }
}

/**
 * Retrieves archived shopping lists from local storage and optionally synchronizes with Supabase.
 */
export async function getArchivedShoppingLists(userId?: string): Promise<ArchivedShoppingList[]> {
  let localArchives: ArchivedShoppingList[] = [];
  try {
    const raw = await AsyncStorage.getItem(SHOPPING_HISTORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) localArchives = parsed;
    }
  } catch (err) {
    console.warn("[shoppingListService] Error loading local history:", err);
  }

  if (!userId) return localArchives;

  try {
    const { data, error } = await supabase
      .from("shopping_list_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const cloudArchives: ArchivedShoppingList[] = data.map((d) => ({
        id: d.id,
        archivedAt: d.created_at,
        title: d.title,
        totalItems: d.total_items,
        checkedItems: d.checked_items,
        adherenceRate: Number(d.adherence_rate),
        sections: (Array.isArray(d.sections) ? d.sections : []) as ChecklistSection[],
        rawIngredients: (Array.isArray(d.raw_ingredients) ? d.raw_ingredients : []) as string[],
      }));

      // Cache cloud history locally
      await AsyncStorage.setItem(
        SHOPPING_HISTORY_STORAGE_KEY,
        JSON.stringify(cloudArchives)
      );
      return cloudArchives;
    }
  } catch (err) {
    console.warn("[shoppingListService] Cloud history read error:", err);
  }

  return localArchives;
}

/**
 * Archives a shopping list snapshot before clearing or for historical logging.
 */
export async function archiveCurrentShoppingList(
  rawIngredients: string[],
  sections: ChecklistSection[],
  userId?: string
): Promise<ArchivedShoppingList | null> {
  const allItems = sections.flatMap((sec) => sec.data || []);
  if (allItems.length === 0 && rawIngredients.length === 0) return null;

  const totalItems = allItems.length;
  const checkedItems = allItems.filter((it) => it.checked).length;
  const adherenceRate =
    totalItems > 0 ? Number(((checkedItems / totalItems) * 100).toFixed(2)) : 0;

  const now = new Date();
  const archiveEntry: ArchivedShoppingList = {
    id: `archive_${Date.now()}`,
    archivedAt: now.toISOString(),
    title: `Week of ${now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`,
    totalItems,
    checkedItems,
    adherenceRate,
    sections,
    rawIngredients,
  };

  try {
    const existing = await getArchivedShoppingLists();
    const updated = [archiveEntry, ...existing].slice(0, 30);
    await AsyncStorage.setItem(
      SHOPPING_HISTORY_STORAGE_KEY,
      JSON.stringify(updated)
    );
  } catch (err) {
    console.warn("[shoppingListService] Error saving local archive:", err);
  }

  if (userId) {
    try {
      const { data } = await supabase.from("shopping_list_history").insert({
        user_id: userId,
        title: archiveEntry.title,
        raw_ingredients: rawIngredients,
        sections: sections as any,
        total_items: totalItems,
        checked_items: checkedItems,
        adherence_rate: adherenceRate,
      }).select().single();

      if (data) {
        archiveEntry.id = data.id;
      }
    } catch (cloudErr) {
      console.warn("[shoppingListService] Error syncing archive to Supabase:", cloudErr);
    }
  }

  return archiveEntry;
}

/**
 * Deletes a single archived shopping list.
 */
export async function deleteArchivedShoppingList(id: string, userId?: string): Promise<void> {
  try {
    const existing = await getArchivedShoppingLists();
    const filtered = existing.filter((it) => it.id !== id);
    await AsyncStorage.setItem(
      SHOPPING_HISTORY_STORAGE_KEY,
      JSON.stringify(filtered)
    );
  } catch (err) {
    console.warn("[shoppingListService] Error deleting archived list:", err);
  }

  if (userId && !id.startsWith("archive_")) {
    try {
      await supabase.from("shopping_list_history").delete().eq("id", id).eq("user_id", userId);
    } catch (err) {
      console.warn("[shoppingListService] Error deleting cloud archive:", err);
    }
  }
}

/**
 * Clears shopping list both locally and on Supabase.
 * Automatically archives the list before clearing if items exist.
 */
export async function clearShoppingList(
  userId?: string,
  rawToArchive?: string[],
  sectionsToArchive?: ChecklistSection[]
): Promise<void> {
  if (
    (rawToArchive && rawToArchive.length > 0) ||
    (sectionsToArchive && sectionsToArchive.length > 0)
  ) {
    await archiveCurrentShoppingList(
      rawToArchive || [],
      sectionsToArchive || [],
      userId
    );
  }

  try {
    await AsyncStorage.removeItem(SHOPPING_RAW_STORAGE_KEY);
    await AsyncStorage.removeItem(SHOPPING_CHECKLIST_STORAGE_KEY);
  } catch (err) {
    console.warn("[shoppingListService] Local clear error:", err);
  }

  if (!userId) return;

  try {
    await supabase.from("shopping_lists").delete().eq("user_id", userId);
  } catch (err) {
    console.warn("[shoppingListService] Cloud delete error:", err);
  }
}

/**
 * Trainer Analytics: Retrieves a client's shopping list and procurement adherence.
 */
export async function fetchClientShoppingList(
  clientId: string
): Promise<ShoppingAnalyticsSummary | null> {
  try {
    const { data, error } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("user_id", clientId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const sections = Array.isArray(data.sections) ? (data.sections as ChecklistSection[]) : [];
    const raw = Array.isArray(data.raw_ingredients) ? (data.raw_ingredients as string[]) : [];

    return {
      totalItems: Number(data.total_items) || 0,
      checkedItems: Number(data.checked_items) || 0,
      adherenceRate: Number(data.adherence_rate) || 0,
      lastUpdated: data.updated_at || null,
      sections,
      rawIngredients: raw,
    };
  } catch (err) {
    console.error("[shoppingListService] fetchClientShoppingList error:", err);
    return null;
  }
}
