import { load } from "@tauri-apps/plugin-store";
import { CATEGORIES as DEFAULT_CATEGORIES } from "./data/characters";
import type { Category } from "./types";

export { DEFAULT_CATEGORIES };

const STORE_FILE = "settings.json";
const KEY = "categories";

export async function loadCategories(): Promise<Category[]> {
  try {
    const store = await load(STORE_FILE, { defaults: {}, autoSave: true });
    const saved = await store.get<Category[]>(KEY);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
  } catch (e) {
    console.error("Failed to load categories:", e);
  }
  return DEFAULT_CATEGORIES;
}

export async function saveCategories(categories: Category[]): Promise<void> {
  const store = await load(STORE_FILE, { defaults: {}, autoSave: true });
  await store.set(KEY, categories);
  await store.save();
}

export async function resetCategories(): Promise<void> {
  const store = await load(STORE_FILE, { defaults: {}, autoSave: true });
  await store.delete(KEY);
  await store.save();
}
