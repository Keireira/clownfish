import { load, type Store } from '@tauri-apps/plugin-store';
import { CATEGORIES as DEFAULT_CATEGORIES } from './data/characters';
import { DEFAULT_SHORTCUTS } from './data/shortcuts';
import type { Category, Plugin, PluginRegistryEntry, Shortcut, StopListEntry } from './types';

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
// Unicode hints
// ---------------------------------------------------------------------------

export async function loadUnicodeHints(): Promise<boolean> {
	try {
		const store = await getStore();
		const val = await store.get<boolean>('unicode_hints');
		return val ?? false;
	} catch {
		return false;
	}
}

export async function saveUnicodeHints(enabled: boolean): Promise<void> {
	const store = await getStore();
	await store.set('unicode_hints', enabled);
	await store.save();
}

// ---------------------------------------------------------------------------
// Autocorrect
// ---------------------------------------------------------------------------

export async function loadAutocorrectEnabled(): Promise<boolean> {
	try {
		const store = await getStore();
		const val = await store.get<boolean>('autocorrect_enabled');
		return val ?? false;
	} catch {
		return false;
	}
}

export async function saveAutocorrectEnabled(enabled: boolean): Promise<void> {
	const store = await getStore();
	await store.set('autocorrect_enabled', enabled);
	await store.save();
}

// ---------------------------------------------------------------------------
// Variables as shortcuts (global {{var}} expansion)
// ---------------------------------------------------------------------------

export async function loadVariablesEnabled(): Promise<boolean> {
	try {
		const store = await getStore();
		const val = await store.get<boolean>('variables_enabled');
		return val ?? false;
	} catch {
		return false;
	}
}

export async function saveVariablesEnabled(enabled: boolean): Promise<void> {
	const store = await getStore();
	await store.set('variables_enabled', enabled);
	await store.save();
}

// ---------------------------------------------------------------------------
// Trigger character
// ---------------------------------------------------------------------------

export async function loadTriggerChar(): Promise<string> {
	try {
		const store = await getStore();
		const val = await store.get<string>('trigger_char');
		if (val && typeof val === 'string' && val.length === 1) return val;
	} catch {
		/* use default */
	}
	return '\\';
}

export async function saveTriggerChar(ch: string): Promise<void> {
	const store = await getStore();
	await store.set('trigger_char', ch);
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

// ---------------------------------------------------------------------------
// Global hotkey
// ---------------------------------------------------------------------------

export async function loadHotkey(): Promise<string | null> {
	try {
		const store = await getStore();
		const val = await store.get<string>('global_hotkey');
		if (val && typeof val === 'string') return val;
	} catch {
		/* use default */
	}
	return null;
}

export async function saveHotkey(shortcut: string | null): Promise<void> {
	const store = await getStore();
	if (shortcut) {
		await store.set('global_hotkey', shortcut);
	} else {
		await store.delete('global_hotkey');
	}
	await store.save();
}

// ---------------------------------------------------------------------------
// Export / Import all settings
// ---------------------------------------------------------------------------

const SCALAR_KEYS = [
	'expansion_enabled',
	'hints_position',
	'trigger_char',
	'unicode_hints',
	'autocorrect_enabled',
	'global_hotkey',
	'theme',
	'language'
] as const;

export async function exportAllSettings(
	plugins: Plugin[],
	registry: PluginRegistryEntry[],
	stopList: StopListEntry[]
): Promise<boolean> {
	try {
		const { save } = await import('@tauri-apps/plugin-dialog');
		const { invoke } = await import('@tauri-apps/api/core');
		const path = await save({
			defaultPath: 'clownfish-settings.json',
			filters: [{ name: 'JSON', extensions: ['json'] }]
		});
		if (!path) return false;

		const store = await getStore();
		const settings: Record<string, unknown> = {};
		for (const key of SCALAR_KEYS) {
			settings[key] = (await store.get(key)) ?? null;
		}

		const backup = {
			clownfish_backup: 1,
			settings,
			plugins,
			plugin_registry: registry,
			stop_list: stopList
		};
		await invoke('backup_write_file', { path, contents: JSON.stringify(backup, null, 2) });
		return true;
	} catch (e) {
		console.error('Export failed:', e);
		return false;
	}
}

export interface BackupData {
	settings: Record<string, unknown>;
	plugins: Plugin[];
	plugin_registry: PluginRegistryEntry[];
	stop_list: StopListEntry[];
}

export async function importAllSettings(): Promise<BackupData | null> {
	try {
		const { open: openDialog } = await import('@tauri-apps/plugin-dialog');
		const { invoke } = await import('@tauri-apps/api/core');
		const path = await openDialog({
			filters: [{ name: 'JSON', extensions: ['json'] }],
			multiple: false
		});
		if (!path) return null;

		const content = await invoke<string>('backup_read_file', { path });
		const data = JSON.parse(content);
		if (!data || !data.clownfish_backup) return null;

		const store = await getStore();
		const s = data.settings ?? {};

		// Restore scalar settings
		for (const key of SCALAR_KEYS) {
			if (key in s) {
				if (s[key] != null) {
					await store.set(key, s[key]);
				} else {
					await store.delete(key);
				}
			}
		}
		await store.save();

		// Restore plugins
		const { savePlugin, savePluginRegistry } = await import('./plugin-store');
		if (Array.isArray(data.plugins)) {
			for (const p of data.plugins) {
				await savePlugin(p);
			}
		}
		if (Array.isArray(data.plugin_registry)) {
			await savePluginRegistry(data.plugin_registry);
		}

		// Restore stop list
		if (Array.isArray(data.stop_list)) {
			await saveStopList(data.stop_list);
		}

		// Sync Rust-side runtime state
		if (s.expansion_enabled != null) {
			await invoke('expansion_set_enabled', { enabled: s.expansion_enabled });
		}
		if (s.hints_position != null) {
			await invoke('expansion_set_hints_mode', { mode: s.hints_position });
		}
		if (s.trigger_char != null) {
			await invoke('expansion_set_trigger_char', { ch: s.trigger_char });
		}
		if (s.unicode_hints != null) {
			await invoke('expansion_set_unicode_hints', { enabled: s.unicode_hints });
		}
		if (s.autocorrect_enabled != null) {
			await invoke('autocorrect_set_enabled', { enabled: s.autocorrect_enabled });
		}
		// Re-register global hotkey (or clear it)
		await invoke('set_global_hotkey', { shortcut: s.global_hotkey ?? null });

		return {
			settings: s,
			plugins: data.plugins ?? [],
			plugin_registry: data.plugin_registry ?? [],
			stop_list: data.stop_list ?? []
		};
	} catch (e) {
		console.error('Import failed:', e);
		return null;
	}
}

export { DEFAULT_CATEGORIES, DEFAULT_SHORTCUTS };
