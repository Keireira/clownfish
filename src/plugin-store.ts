import { load, type Store } from '@tauri-apps/plugin-store';
import { CATEGORIES as DEFAULT_CATEGORIES } from './data/characters';
import { DEFAULT_SHORTCUTS } from './data/shortcuts';
import { DEFAULT_AUTOCORRECT_RULES } from './data/autocorrect-rules';
import { GITMOJI_SHORTCUTS } from './data/gitmoji';
import type { AutoCorrectRule, Category, Plugin, PluginId, PluginRegistryEntry, Shortcut } from './types';

// ---------------------------------------------------------------------------
// Main settings store (shared instance from store.ts)
// ---------------------------------------------------------------------------

import { getStore } from './store';

// ---------------------------------------------------------------------------
// Plugin file store helpers
// ---------------------------------------------------------------------------

const pluginStores = new Map<PluginId, Promise<Store>>();

function getPluginStore(id: PluginId): Promise<Store> {
	let p = pluginStores.get(id);
	if (!p) {
		p = load(`plugins/${id}.json`, { defaults: {}, autoSave: true });
		p.catch(() => {
			pluginStores.delete(id);
		});
		pluginStores.set(id, p);
	}
	return p;
}

// ---------------------------------------------------------------------------
// Registry (lives in settings.json)
// ---------------------------------------------------------------------------

export async function loadPluginRegistry(): Promise<PluginRegistryEntry[]> {
	try {
		const store = await getStore();
		const reg = await store.get<PluginRegistryEntry[]>('plugin_registry');
		if (reg && Array.isArray(reg) && reg.length > 0) return reg;
	} catch (e) {
		console.error('Failed to load plugin registry:', e);
	}
	return [];
}

export async function savePluginRegistry(reg: PluginRegistryEntry[]): Promise<void> {
	const store = await getStore();
	await store.set('plugin_registry', reg);
	await store.save();
}

// ---------------------------------------------------------------------------
// Single plugin CRUD
// ---------------------------------------------------------------------------

export async function loadPlugin(id: PluginId): Promise<Plugin | null> {
	try {
		const store = await getPluginStore(id);
		const plugin = await store.get<Plugin>('plugin');
		return plugin ?? null;
	} catch (e) {
		console.error(`Failed to load plugin "${id}":`, e);
		return null;
	}
}

export async function savePlugin(plugin: Plugin): Promise<void> {
	const store = await getPluginStore(plugin.id);
	await store.set('plugin', plugin);
	await store.save();
}

export async function deletePluginFile(id: PluginId): Promise<void> {
	try {
		const store = await getPluginStore(id);
		await store.clear();
		await store.save();
		pluginStores.delete(id);
	} catch (e) {
		console.error(`Failed to delete plugin file "${id}":`, e);
	}
}

// ---------------------------------------------------------------------------
// Bulk load
// ---------------------------------------------------------------------------

export async function loadAllPlugins(registry: PluginRegistryEntry[]): Promise<Plugin[]> {
	const sorted = [...registry].sort((a, b) => a.order - b.order);
	const plugins: Plugin[] = [];
	for (const entry of sorted) {
		const p = await loadPlugin(entry.id);
		if (p) plugins.push(p);
	}
	return plugins;
}

// ---------------------------------------------------------------------------
// Merge enabled plugins → flat data
// ---------------------------------------------------------------------------

export function mergePlugins(
	plugins: Plugin[],
	registry: PluginRegistryEntry[]
): { categories: Category[]; shortcuts: Shortcut[]; autocorrect: AutoCorrectRule[] } {
	const enabledIds = new Set(registry.filter((r) => r.enabled).map((r) => r.id));
	const sorted = [...registry].filter((r) => enabledIds.has(r.id)).sort((a, b) => a.order - b.order);

	const categories: Category[] = [];
	const shortcuts: Shortcut[] = [];
	const autocorrect: AutoCorrectRule[] = [];

	for (const entry of sorted) {
		const plugin = plugins.find((p) => p.id === entry.id);
		if (!plugin) continue;
		categories.push(...plugin.categories);
		shortcuts.push(...plugin.shortcuts.map(s => ({ ...s, plugin_id: plugin.id })));
		if (plugin.autocorrect) autocorrect.push(...plugin.autocorrect);
	}

	return { categories, shortcuts, autocorrect };
}

/**
 * Returns shortcuts from ALL plugins (enabled and disabled), each tagged with plugin_id.
 * Sent to Rust so per-app overrides can enable globally-disabled plugins.
 */
export function mergeAllShortcuts(
	plugins: Plugin[],
	registry: PluginRegistryEntry[]
): Shortcut[] {
	const sorted = [...registry].sort((a, b) => a.order - b.order);
	const shortcuts: Shortcut[] = [];
	for (const entry of sorted) {
		const plugin = plugins.find((p) => p.id === entry.id);
		if (!plugin) continue;
		shortcuts.push(...plugin.shortcuts.map(s => ({ ...s, plugin_id: plugin.id })));
	}
	return shortcuts;
}

/**
 * Returns the list of globally-disabled plugin IDs.
 */
export function getDisabledPluginIds(registry: PluginRegistryEntry[]): string[] {
	return registry.filter((r) => !r.enabled).map((r) => r.id);
}

/**
 * High-level: load registry + all plugins → merge enabled → flat data.
 * Used by main window and startup sync.
 */
export async function loadMergedData(): Promise<{ categories: Category[]; shortcuts: Shortcut[]; autocorrect: AutoCorrectRule[] }> {
	const registry = await loadPluginRegistry();

	// Not yet migrated — fall back to legacy behaviour
	if (registry.length === 0) {
		const { loadCategories, loadShortcuts } = await import('./store');
		return {
			categories: await loadCategories(),
			shortcuts: (await loadShortcuts()).map(s => ({ ...s, plugin_id: 'default' })),
			autocorrect: []
		};
	}

	const plugins = await loadAllPlugins(registry);
	return mergePlugins(plugins, registry);
}

// ---------------------------------------------------------------------------
// Default plugin template
// ---------------------------------------------------------------------------

export function getDefaultPluginTemplate(): Plugin {
	return {
		id: 'default',
		name: 'Default',
		version: '1.0.0',
		builtin: true,
		categories: DEFAULT_CATEGORIES,
		shortcuts: DEFAULT_SHORTCUTS,
		autocorrect: DEFAULT_AUTOCORRECT_RULES
	};
}

export function getGitmojiPluginTemplate(): Plugin {
	return {
		id: 'gitmoji',
		name: 'Gitmoji',
		version: '1.0.0',
		builtin: true,
		categories: [],
		shortcuts: GITMOJI_SHORTCUTS,
		autocorrect: []
	};
}

export function getBuiltinPluginTemplate(id: PluginId): Plugin {
	switch (id) {
		case 'gitmoji':
			return getGitmojiPluginTemplate();
		default:
			return getDefaultPluginTemplate();
	}
}

// ---------------------------------------------------------------------------
// Migration: flat settings → plugin system (idempotent)
// ---------------------------------------------------------------------------

export async function migrateToPluginSystem(): Promise<void> {
	const registry = await loadPluginRegistry();
	if (registry.length > 0) return; // already migrated

	// Read old data from settings.json
	const { loadCategories, loadShortcuts } = await import('./store');
	const [categories, shortcuts] = await Promise.all([loadCategories(), loadShortcuts()]);

	// Determine if user had customized data
	const hasCustomCategories = JSON.stringify(categories) !== JSON.stringify(DEFAULT_CATEGORIES);
	const hasCustomShortcuts = JSON.stringify(shortcuts) !== JSON.stringify(DEFAULT_SHORTCUTS);

	// Build default plugin with user's data (or defaults)
	const defaultPlugin: Plugin = {
		id: 'default',
		name: 'Default',
		version: '1.0.0',
		builtin: true,
		categories: hasCustomCategories ? categories : DEFAULT_CATEGORIES,
		shortcuts: hasCustomShortcuts ? shortcuts : DEFAULT_SHORTCUTS,
		autocorrect: DEFAULT_AUTOCORRECT_RULES
	};

	// Save plugin files
	await savePlugin(defaultPlugin);
	await savePlugin(getGitmojiPluginTemplate());

	// Save registry
	await savePluginRegistry([
		{ id: 'default', enabled: true, order: 0 },
		{ id: 'gitmoji', enabled: true, order: 1 }
	]);

	// Clean up old keys
	try {
		const store = await getStore();
		await store.delete('categories');
		await store.delete('shortcuts');
		await store.save();
	} catch {
		// non-critical
	}
}

// ---------------------------------------------------------------------------
// Ensure built-in plugins exist (for existing users who already migrated)
// ---------------------------------------------------------------------------

const BUILTIN_PLUGINS: { id: PluginId; order: number; template: () => Plugin }[] = [
	{ id: 'default', order: 0, template: getDefaultPluginTemplate },
	{ id: 'gitmoji', order: 1, template: getGitmojiPluginTemplate }
];

export async function ensureBuiltinPlugins(): Promise<void> {
	const registry = await loadPluginRegistry();
	if (registry.length === 0) return; // not yet migrated — migration will handle it

	let changed = false;
	const newRegistry = [...registry];
	const maxOrder = registry.reduce((max, r) => Math.max(max, r.order), -1);

	for (const bp of BUILTIN_PLUGINS) {
		if (registry.some((r) => r.id === bp.id)) continue;
		// Plugin missing — add it
		await savePlugin(bp.template());
		newRegistry.push({ id: bp.id, enabled: true, order: maxOrder + 1 + bp.order });
		changed = true;
	}

	if (changed) {
		await savePluginRegistry(newRegistry);
	}
}
