import { load } from '@tauri-apps/plugin-store';
import { CATEGORIES as DEFAULT_CATEGORIES } from './data/characters';
import type { Category } from './types';

export async function loadCategories(): Promise<Category[]> {
	try {
		const store = await load('settings.json', { defaults: {}, autoSave: true });
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
	const store = await load('settings.json', { defaults: {}, autoSave: true });
	await store.set('categories', categories);
	await store.save();
}

export async function resetCategories(): Promise<void> {
	const store = await load('settings.json', { defaults: {}, autoSave: true });
	await store.delete('categories');
	await store.save();
}

export { DEFAULT_CATEGORIES };
