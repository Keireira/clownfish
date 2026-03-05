import { load, type Store } from '@tauri-apps/plugin-store';
import { CATEGORIES as DEFAULT_CATEGORIES } from './data/characters';
import { DEFAULT_SHORTCUTS } from './data/shortcuts';
import type { Category, Plugin, PluginId, PluginRegistryEntry, Shortcut } from './types';

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
): { categories: Category[]; shortcuts: Shortcut[] } {
	const enabledIds = new Set(registry.filter((r) => r.enabled).map((r) => r.id));
	const sorted = [...registry].filter((r) => enabledIds.has(r.id)).sort((a, b) => a.order - b.order);

	const categories: Category[] = [];
	const shortcuts: Shortcut[] = [];

	for (const entry of sorted) {
		const plugin = plugins.find((p) => p.id === entry.id);
		if (!plugin) continue;
		categories.push(...plugin.categories);
		shortcuts.push(...plugin.shortcuts);
	}

	return { categories, shortcuts };
}

/**
 * High-level: load registry + all plugins → merge enabled → flat data.
 * Used by main window and startup sync.
 */
export async function loadMergedData(): Promise<{ categories: Category[]; shortcuts: Shortcut[] }> {
	const registry = await loadPluginRegistry();

	// Not yet migrated — fall back to legacy behaviour
	if (registry.length === 0) {
		const { loadCategories, loadShortcuts } = await import('./store');
		return {
			categories: await loadCategories(),
			shortcuts: await loadShortcuts()
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
		shortcuts: DEFAULT_SHORTCUTS
	};
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
		shortcuts: hasCustomShortcuts ? shortcuts : DEFAULT_SHORTCUTS
	};

	// Save plugin file
	await savePlugin(defaultPlugin);

	// Save registry
	await savePluginRegistry([{ id: 'default', enabled: true, order: 0 }]);

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
