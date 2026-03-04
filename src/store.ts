import { load, type Store } from '@tauri-apps/plugin-store';
import { CATEGORIES as DEFAULT_CATEGORIES } from './data/characters';
import { DEFAULT_SHORTCUTS } from './data/shortcuts';
import type { Category, Shortcut, StopListEntry } from './types';

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

// ---------------------------------------------------------------------------
// Shortcuts
// ---------------------------------------------------------------------------

export async function loadShortcuts(): Promise<Shortcut[]> {
	try {
		const store = await getStore();
		const saved = await store.get<Shortcut[]>('shortcuts');
		if (saved && Array.isArray(saved) && saved.length > 0) {
			return saved;
		}
	} catch (e) {
		console.error('Failed to load shortcuts:', e);
	}
	return DEFAULT_SHORTCUTS;
}

export async function saveShortcuts(shortcuts: Shortcut[]): Promise<void> {
	const store = await getStore();
	await store.set('shortcuts', shortcuts);
	await store.save();
}

export async function resetShortcuts(): Promise<void> {
	const store = await getStore();
	await store.delete('shortcuts');
	await store.save();
}

export async function loadExpansionEnabled(): Promise<boolean> {
	try {
		const store = await getStore();
		const val = await store.get<boolean>('expansion_enabled');
		return val ?? false;
	} catch {
		return false;
	}
}

export async function saveExpansionEnabled(enabled: boolean): Promise<void> {
	const store = await getStore();
	await store.set('expansion_enabled', enabled);
	await store.save();
}

// ---------------------------------------------------------------------------
// Hints position
// ---------------------------------------------------------------------------

export type HintsPosition = 'caret' | 'corner' | 'off';

export async function loadHintsPosition(): Promise<HintsPosition> {
	try {
		const store = await getStore();
		const val = await store.get<HintsPosition>('hints_position');
		if (val === 'caret' || val === 'corner' || val === 'off') return val;
	} catch {
		/* use default */
	}
	return 'caret';
}

export async function saveHintsPosition(pos: HintsPosition): Promise<void> {
	const store = await getStore();
	await store.set('hints_position', pos);
	await store.save();
}

// ---------------------------------------------------------------------------
// Stop-list
// ---------------------------------------------------------------------------

export async function loadStopList(): Promise<StopListEntry[]> {
	try {
		const store = await getStore();
		const saved = await store.get<StopListEntry[]>('stop_list');
		if (saved && Array.isArray(saved)) return saved;
	} catch {
		/* use default */
	}
	return [];
}

export async function saveStopList(entries: StopListEntry[]): Promise<void> {
	const store = await getStore();
	await store.set('stop_list', entries);
	await store.save();
}

export { DEFAULT_CATEGORIES, DEFAULT_SHORTCUTS };
