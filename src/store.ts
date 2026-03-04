import { load, type Store } from '@tauri-apps/plugin-store';
import { CATEGORIES as DEFAULT_CATEGORIES } from './data/characters';
import type { Category } from './types';

const STORE_FILE = 'settings.json';
let storeInstance: Promise<Store> | null = null;

/** Returns a shared store instance, creating it on first access. */
export function getStore(): Promise<Store> {
	if (!storeInstance) {
		storeInstance = load(STORE_FILE, { defaults: {}, autoSave: true });
		storeInstance.catch(() => {
			storeInstance = null;
		});
	}
	return storeInstance;
}

export async function loadCategories(): Promise<Category[]> {
	try {
		const store = await getStore();
		const saved = await store.get<Category[]>('categories');
		if (saved && Array.isArray(saved) && saved.length > 0) {
			return saved;
		}
	} catch (e) {
		console.error('Failed to load categories:', e);
	}
	return DEFAULT_CATEGORIES;
}

export async function saveCategories(categories: Category[]): Promise<void> {
	const store = await getStore();
	await store.set('categories', categories);
	await store.save();
}

export async function resetCategories(): Promise<void> {
	const store = await getStore();
	await store.delete('categories');
	await store.save();
}

export { DEFAULT_CATEGORIES };
