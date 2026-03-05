import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Root, {
	SettingsGlobalStyle,
	GlassOverrides,
	Header,
	HeaderRight,
	Body,
	Main,
	Empty,
	BtnPrimary,
	BtnSecondary,
	BtnIcon,
	SettingsGroup,
	SettingsRow,
	SettingsRowLabel,
	DataBtnRow,
	SearchInput,
	SearchClear,
	SearchWrap,
	SearchResultsGrid,
	SearchResultChar,
	SearchCatLabel,
	SearchCatGroup,
	Footer,
	Copyright
} from './settings.styles';
import { loadStopList, saveStopList, exportAllSettings, importAllSettings } from '../store';
import AutocorrectPanel from '../components/autocorrect-panel';
import {
	loadPluginRegistry,
	savePluginRegistry,
	loadAllPlugins,
	savePlugin,
	deletePluginFile,
	mergePlugins,
	getDefaultPluginTemplate
} from '../plugin-store';
import { emitEvent } from '../events';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import SettingsSidebar from '../components/settings-sidebar';
import type { ActiveSection } from '../components/settings-sidebar';
import { parseCategorySection, parseShortcutsSection, parseAutocorrectSection } from '../components/settings-sidebar';
import CategoryEditor from '../components/category-editor';
import PresetPicker from '../components/preset-picker';
import TriggerPrompt from '../components/trigger-prompt';
import ThemePicker from '../components/theme-picker';
import LanguagePicker from '../components/language-picker';
import AutostartToggle from '../components/autostart-toggle';
import ExpansionToggle from '../components/expansion-toggle';
import HintsPositionPicker from '../components/hints-position';
import UnicodeHintsToggle from '../components/unicode-hints-toggle/unicode-hints-toggle';
import AutocorrectToggle from '../components/autocorrect-toggle';
import HotkeyPicker from '../components/hotkey-picker';
import TriggerCharPicker from '../components/trigger-char-picker';
import ShortcutEditor from '../components/shortcut-editor';
import AppSettingsPanel from '../components/stoplist-editor';
import PluginManager from '../components/plugin-manager';
import StatsPanel from '../components/stats-panel';
import BottomBar, { openUrl } from '../components/bottom-bar';
import { useLanguage } from '../i18n';
import { charMatchesQuery } from '../utils/char-match';
import { displayChar } from '../types';
import { DropOverlay } from '../components/stoplist-editor/stoplist-editor.styles';
import type { Category, CharEntry, Plugin, PluginId, PluginRegistryEntry, Shortcut, StopListEntry } from '../types';

type UndoEntry =
	| { type: 'shortcut'; pluginId: PluginId; index: number; item: Shortcut }
	| { type: 'category'; pluginId: PluginId; index: number; item: Category }
	| { type: 'char'; pluginId: PluginId; categoryIndex: number; charIndex: number; item: CharEntry };

/* ---- Zone navigation ---- */
const ZONES = ['header', 'sidebar', 'content', 'footer'] as const;
type Zone = typeof ZONES[number];
const FOCUSABLE_SELECTOR =
	'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]';

/** Filter out elements that can't actually receive focus (hidden, collapsed, etc). */
const isVisibleFocusable = (el: HTMLElement): boolean => {
	const style = getComputedStyle(el);
	if (style.display === 'none' || style.visibility === 'hidden') return false;
	let parent = el.parentElement;
	while (parent) {
		if (parent.hasAttribute('data-zone')) break;
		const ps = getComputedStyle(parent);
		if (ps.display === 'none') return false;
		if (ps.overflow === 'hidden' && parent.clientHeight === 0) return false;
		parent = parent.parentElement;
	}
	return true;
};

const Settings = () => {
	const t = useLanguage();
	const [active, setActive] = useState<ActiveSection>('settings');
	const [plugins, setPlugins] = useState<Plugin[]>([]);
	const [registry, setRegistry] = useState<PluginRegistryEntry[]>([]);
	const [pluginDirty, setPluginDirty] = useState<Set<PluginId>>(new Set());
	const [registryDirty, setRegistryDirty] = useState(false);
	const [showPresets, setShowPresets] = useState(false);
	const [stopList, setStopList] = useState<StopListEntry[]>([]);
	const [stopListDirty, setStopListDirty] = useState(false);
	const [dragging, setDragging] = useState(false);
	const [undoStack, setUndoStack] = useState<UndoEntry[]>([]);
	const [promptChar, setPromptChar] = useState<[string, string] | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [settingsKey, setSettingsKey] = useState(0);

	// Zone navigation state
	const [activeZone, setActiveZone] = useState<Zone | null>(null);
	const [drilled, setDrilled] = useState(false);
	const [zoneVisual, setZoneVisual] = useState(false);

	const savedPluginsRef = useRef<Map<PluginId, string>>(new Map());
	const modalOpenRef = useRef(false);

	const stopListRef = useRef(stopList);
	useEffect(() => {
		stopListRef.current = stopList;
	}, [stopList]);

	useEffect(() => {
		modalOpenRef.current = showPresets || !!promptChar;
	}, [showPresets, promptChar]);

	// Derived merged data
	const merged = useMemo(() => mergePlugins(plugins, registry), [plugins, registry]);

	// Load plugins + registry on mount
	useEffect(() => {
		let unlisten: (() => void) | undefined;
		let unlistenShortcuts: (() => void) | undefined;

		async function loadAll() {
			const reg = await loadPluginRegistry();
			const allPlugins = await loadAllPlugins(reg);
			setRegistry(reg);
			setPlugins(allPlugins);
			for (const p of allPlugins) {
				savedPluginsRef.current.set(p.id, JSON.stringify(p));
			}
		}

		loadAll();
		loadStopList().then(setStopList);

		import('@tauri-apps/api/event')
			.then(({ listen }) => {
				listen('open-shortcuts-tab', () => {
					// Select the first plugin's shortcuts section
					loadPluginRegistry().then((reg) => {
						if (reg.length > 0) setActive(`shortcuts:${reg[0].id}`);
					});
				}).then((fn) => {
					unlisten = fn;
				});
				listen('shortcuts-changed', () => {
					loadAll().then(() => {
						setPluginDirty(new Set());
						setRegistryDirty(false);
					});
				}).then((fn) => {
					unlistenShortcuts = fn;
				});
			})
			.catch(() => {});
		return () => {
			unlisten?.();
			unlistenShortcuts?.();
		};
	}, []);

	// Drag-drop for adding apps
	const addExe = useCallback((exe: string) => {
		const lower = exe.toLowerCase();
		const cur = stopListRef.current;
		if (cur.some((e) => e.exe.toLowerCase() === lower)) return;
		const newList = [
			...cur,
			{
				exe: lower,
				expansion: true,
				hints: true,
				autocorrect: true,
				autocorrect_rules: [],
				direction: 'auto' as const,
				offset: { top: 0, bottom: 0, left: 0, right: 0 }
			}
		];
		setStopList(newList);
		setStopListDirty(true);
		setActive(lower);
	}, []);

	useEffect(() => {
		let unlisten: (() => void) | undefined;
		getCurrentWebviewWindow()
			.onDragDropEvent((event) => {
				if (event.payload.type === 'over') {
					setDragging(true);
				} else if (event.payload.type === 'drop') {
					setDragging(false);
					for (const path of event.payload.paths) {
						invoke<string | null>('expansion_resolve_exe', { path })
							.then((exe) => {
								if (exe) addExe(exe);
							})
							.catch(() => {});
					}
				} else {
					setDragging(false);
				}
			})
			.then((fn) => {
				unlisten = fn;
			});
		return () => {
			unlisten?.();
		};
	}, [addExe]);

	/* ---- Plugin helpers ---- */
	const markPluginDirty = useCallback((id: PluginId) => {
		setPluginDirty((prev) => {
			const next = new Set(prev);
			next.add(id);
			return next;
		});
	}, []);

	const updatePlugin = useCallback(
		(id: PluginId, updater: (p: Plugin) => Plugin) => {
			setPlugins((prev) => prev.map((p) => (p.id === id ? updater(p) : p)));
			markPluginDirty(id);
		},
		[markPluginDirty]
	);

	const getPlugin = useCallback((id: PluginId): Plugin | undefined => plugins.find((p) => p.id === id), [plugins]);

	/* ---- Undo ---- */
	const undo = useCallback(() => {
		setUndoStack((prev) => {
			if (prev.length === 0) return prev;
			const entry = prev[prev.length - 1];
			switch (entry.type) {
				case 'shortcut':
					updatePlugin(entry.pluginId, (p) => {
						const next = [...p.shortcuts];
						next.splice(entry.index, 0, entry.item);
						return { ...p, shortcuts: next };
					});
					break;
				case 'category':
					updatePlugin(entry.pluginId, (p) => {
						const next = [...p.categories];
						next.splice(entry.index, 0, entry.item);
						return { ...p, categories: next };
					});
					break;
				case 'char':
					updatePlugin(entry.pluginId, (p) => {
						const next = p.categories.map((cat, i) => {
							if (i !== entry.categoryIndex) return cat;
							const chars = [...cat.chars];
							chars.splice(entry.charIndex, 0, entry.item);
							return { ...cat, chars };
						});
						return { ...p, categories: next };
					});
					break;
			}
			return prev.slice(0, -1);
		});
	}, [updatePlugin]);

	const handleSave = useCallback(async () => {
		// Save dirty plugins
		for (const id of pluginDirty) {
			const p = plugins.find((pl) => pl.id === id);
			if (p) {
				await savePlugin(p);
				savedPluginsRef.current.set(p.id, JSON.stringify(p));
			}
		}
		if (registryDirty) {
			await savePluginRegistry(registry);
		}

		// Always sync merged shortcuts to Rust
		const m = mergePlugins(plugins, registry);
		await invoke('expansion_update_shortcuts', { shortcuts: m.shortcuts });
		await emitEvent('shortcuts-changed');
		await emitEvent('categories-changed');

		if (stopListDirty) {
			await saveStopList(stopList);
			await invoke('expansion_update_stoplist', { entries: stopList });
			setStopListDirty(false);
		}

		// Sync autocorrect rules to Rust
		const m2 = mergePlugins(plugins, registry);
		await invoke('autocorrect_update_rules', { rules: m2.autocorrect });

		setPluginDirty(new Set());
		setRegistryDirty(false);
	}, [pluginDirty, plugins, registry, registryDirty, stopListDirty, stopList]);

	/* ---- Keyboard: Ctrl combos + zone navigation ---- */
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			// Ctrl/Meta combos always pass through
			if (e.ctrlKey || e.metaKey) {
				if (e.code === 'KeyZ' && !e.shiftKey) {
					e.preventDefault();
					undo();
				}
				if (e.code === 'KeyS') {
					e.preventDefault();
					handleSave();
				}
				return;
			}

			// Skip zone navigation when modal is open
			if (modalOpenRef.current) return;

			const target = e.target as HTMLElement;
			const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

			if (drilled) {
				// Inside a zone
				if (e.key === 'Escape') {
					// Let inputs handle Escape first (clear, blur, close dropdown)
					if (isInput) return;
					e.preventDefault();
					setDrilled(false);
					(document.activeElement as HTMLElement)?.blur();
					return;
				}
				if (e.key === 'Tab') {
					// Trap Tab within the active zone
					const zone = document.querySelector(`[data-zone="${activeZone}"]`);
					if (!zone) return;
					const focusables = Array.from(zone.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isVisibleFocusable);
					if (focusables.length === 0) return;
					e.preventDefault();
					const idx = focusables.indexOf(document.activeElement as HTMLElement);
					const next = e.shiftKey
						? (idx <= 0 ? focusables.length - 1 : idx - 1)
						: (idx >= focusables.length - 1 ? 0 : idx + 1);
					focusables[next].focus();
					return;
				}
				return;
			}

			// Zone-level navigation — don't interfere with inputs
			if (isInput) return;

			if (e.key === 'Tab') {
				e.preventDefault();
				setZoneVisual(true);
				const currentIdx = activeZone ? ZONES.indexOf(activeZone) : -1;
				const next = e.shiftKey
					? (currentIdx <= 0 ? ZONES.length - 1 : currentIdx - 1)
					: (currentIdx >= ZONES.length - 1 ? 0 : currentIdx + 1);
				setActiveZone(ZONES[next]);
			} else if (e.key === 'Enter' && activeZone) {
				e.preventDefault();
				setDrilled(true);
				setZoneVisual(true);
				// Focus first visible focusable in the zone
				const zone = document.querySelector(`[data-zone="${activeZone}"]`);
				if (zone) {
					const focusable = Array.from(zone.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).find(isVisibleFocusable);
					focusable?.focus();
				}
			} else if (e.key === 'Escape' && activeZone) {
				e.preventDefault();
				setActiveZone(null);
			}
		};
		document.addEventListener('keydown', handler);
		return () => document.removeEventListener('keydown', handler);
	}, [undo, handleSave, activeZone, drilled]);

	// Track zone from mouse interaction (silent — no visual)
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (modalOpenRef.current) return;
			const target = e.target as HTMLElement;
			const zoneEl = target.closest<HTMLElement>('[data-zone]');
			if (zoneEl) {
				const zone = zoneEl.dataset.zone as Zone;
				if ((ZONES as readonly string[]).includes(zone)) {
					setActiveZone(zone);
					setDrilled(false);
					setZoneVisual(false);
					return;
				}
			}
			setActiveZone(null);
			setDrilled(false);
			setZoneVisual(false);
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	/* ---- Derived state ---- */
	const catSection = parseCategorySection(active);
	const shortcutsSection = parseShortcutsSection(active);
	const autocorrectSec = parseAutocorrectSection(active);
	const selectedPlugin = catSection
		? getPlugin(catSection.pluginId)
		: shortcutsSection
			? getPlugin(shortcutsSection.pluginId)
			: autocorrectSec
				? getPlugin(autocorrectSec.pluginId)
				: null;
	const selectedCatIdx = catSection ? catSection.catIdx : -1;
	const selectedCat =
		selectedPlugin && selectedCatIdx >= 0 ? (selectedPlugin.categories[selectedCatIdx] ?? null) : null;
	const selectedStopEntry = stopList.find((e) => e.exe === active) ?? null;

	const anyDirty = pluginDirty.size > 0 || registryDirty || stopListDirty;
	const searchEnabled = shortcutsSection !== null || catSection !== null;

	const sq = searchEnabled ? searchQuery.trim() : '';
	const searchCharResults = sq
		? merged.categories
				.map((cat) => ({
					name: cat.name,
					chars: cat.chars.filter(([char, name]) => charMatchesQuery(char, name, sq))
				}))
				.filter((cat) => cat.chars.length > 0)
		: null;

	/* ---- Zone state helper ---- */
	const zoneState = (zone: Zone) => {
		if (activeZone !== zone || !zoneVisual) return undefined;
		return drilled ? 'drilled' as const : 'focused' as const;
	};

	/* ---- Category handlers ---- */
	const handleAddCategory = (pluginId: PluginId) => {
		const newCat: Category = { name: 'New Category', chars: [] };
		updatePlugin(pluginId, (p) => ({ ...p, categories: [...p.categories, newCat] }));
		const plugin = getPlugin(pluginId);
		const newIdx = plugin ? plugin.categories.length : 0;
		setActive(`cat:${pluginId}:${newIdx}`);
	};

	const handleDeleteCategory = (pluginId: PluginId, idx: number) => {
		const plugin = getPlugin(pluginId);
		if (!plugin) return;
		setUndoStack((prev) => [...prev, { type: 'category', pluginId, index: idx, item: plugin.categories[idx] }]);
		updatePlugin(pluginId, (p) => ({
			...p,
			categories: p.categories.filter((_, i) => i !== idx)
		}));
		// Fix active selection
		if (catSection && catSection.pluginId === pluginId) {
			const newLen = plugin.categories.length - 1;
			if (catSection.catIdx === idx) {
				if (newLen === 0) {
					setActive(`shortcuts:${pluginId}`);
				} else {
					setActive(`cat:${pluginId}:${Math.min(idx, newLen - 1)}`);
				}
			} else if (catSection.catIdx > idx) {
				setActive(`cat:${pluginId}:${catSection.catIdx - 1}`);
			}
		}
	};

	const handleReorderCategory = (pluginId: PluginId, fromIdx: number, toIdx: number) => {
		updatePlugin(pluginId, (p) => {
			const cats = [...p.categories];
			const [moved] = cats.splice(fromIdx, 1);
			cats.splice(toIdx, 0, moved);
			return { ...p, categories: cats };
		});
		// Follow selection
		if (catSection && catSection.pluginId === pluginId) {
			if (catSection.catIdx === fromIdx) {
				setActive(`cat:${pluginId}:${toIdx}`);
			} else if (catSection.catIdx > fromIdx && catSection.catIdx <= toIdx) {
				setActive(`cat:${pluginId}:${catSection.catIdx - 1}`);
			} else if (catSection.catIdx < fromIdx && catSection.catIdx >= toIdx) {
				setActive(`cat:${pluginId}:${catSection.catIdx + 1}`);
			}
		}
	};

	const handleUpdateCategory = (pluginId: PluginId, idx: number, updatedCat: Category) => {
		updatePlugin(pluginId, (p) => ({
			...p,
			categories: p.categories.map((c, i) => (i === idx ? updatedCat : c))
		}));
	};

	/* ---- Save / Reset ---- */
	const handleReset = async () => {
		const defaultTemplate = getDefaultPluginTemplate();

		// Reset default plugin to template
		const newPlugins = plugins.map((p) => (p.builtin ? { ...defaultTemplate } : p));
		// Remove non-builtin plugins
		const builtinOnly = newPlugins.filter((p) => p.builtin);
		for (const p of plugins) {
			if (!p.builtin) await deletePluginFile(p.id);
		}
		setPlugins(builtinOnly);

		const newRegistry = [{ id: 'default', enabled: true, order: 0 }];
		setRegistry(newRegistry);

		for (const p of builtinOnly) {
			await savePlugin(p);
			savedPluginsRef.current.set(p.id, JSON.stringify(p));
		}
		await savePluginRegistry(newRegistry);

		const m = mergePlugins(builtinOnly, newRegistry);
		await invoke('expansion_update_shortcuts', { shortcuts: m.shortcuts });
		await emitEvent('shortcuts-changed');
		await emitEvent('categories-changed');

		setStopList([]);
		setStopListDirty(false);
		await saveStopList([]);
		await invoke('expansion_update_stoplist', { entries: [] as StopListEntry[] });

		setPluginDirty(new Set());
		setRegistryDirty(false);
		setUndoStack([]);
		setActive('settings');
	};

	/* ---- Export / Import ---- */
	const handleExport = async () => {
		await exportAllSettings(plugins, registry, stopList);
	};

	const handleImport = async () => {
		const backup = await importAllSettings();
		if (!backup) return;
		const reg = await loadPluginRegistry();
		const allPlugins = await loadAllPlugins(reg);
		setRegistry(reg);
		setPlugins(allPlugins);
		for (const p of allPlugins) {
			savedPluginsRef.current.set(p.id, JSON.stringify(p));
		}
		loadStopList().then(setStopList);
		setPluginDirty(new Set());
		setRegistryDirty(false);
		setStopListDirty(false);

		// Sync shortcuts + autocorrect to Rust + notify other windows
		const m = mergePlugins(allPlugins, reg);
		await invoke('expansion_update_shortcuts', { shortcuts: m.shortcuts });
		await invoke('autocorrect_update_rules', { rules: m.autocorrect });
		await invoke('expansion_update_stoplist', { entries: backup.stop_list });
		await emitEvent('shortcuts-changed');
		await emitEvent('categories-changed');

		// Apply theme & language in current window + notify others
		const { applyTheme } = await import('../theme');
		const { applyLanguage } = await import('../i18n');
		const s = backup.settings;
		const themeVal = (s.theme as string) ?? 'auto';
		const langVal = (s.language as string) ?? 'auto';
		localStorage.setItem('theme', themeVal);
		applyTheme(themeVal as 'auto' | 'light' | 'dark');
		await emitEvent('theme-changed', themeVal);
		localStorage.setItem('language', langVal);
		applyLanguage(langVal);
		await emitEvent('language-changed', langVal);

		// Force settings components to remount and re-read from store
		setSettingsKey((k) => k + 1);
	};

	/* ---- Plugin toggle ---- */
	const handleTogglePlugin = (id: PluginId, enabled: boolean) => {
		setRegistry((prev) => prev.map((r) => (r.id === id ? { ...r, enabled } : r)));
		setRegistryDirty(true);
	};

	/* ---- Plugin management callbacks ---- */
	const handlePluginsChanged = useCallback(async () => {
		const reg = await loadPluginRegistry();
		const allPlugins = await loadAllPlugins(reg);
		setRegistry(reg);
		setPlugins(allPlugins);
		for (const p of allPlugins) {
			savedPluginsRef.current.set(p.id, JSON.stringify(p));
		}
		setPluginDirty(new Set());
		setRegistryDirty(false);
	}, []);

	const handleAddFromPresets = (chars: CharEntry[]) => {
		if (!selectedCat || !catSection) return;
		const existing = new Set(selectedCat.chars.map(([ch]) => ch));
		const newChars = chars.filter(([ch]) => !existing.has(ch));
		if (newChars.length === 0) return;
		handleUpdateCategory(catSection.pluginId, selectedCatIdx, {
			...selectedCat,
			chars: [...selectedCat.chars, ...newChars]
		});
		setShowPresets(false);
	};

	/* ---- Shortcuts handlers for current plugin ---- */
	const handleShortcutsChange = (newShortcuts: Shortcut[]) => {
		if (!shortcutsSection) return;
		updatePlugin(shortcutsSection.pluginId, (p) => ({ ...p, shortcuts: newShortcuts }));
	};

	const handleShortcutDelete = (idx: number) => {
		if (!shortcutsSection || !selectedPlugin) return;
		setUndoStack((prev) => [
			...prev,
			{ type: 'shortcut', pluginId: shortcutsSection.pluginId, index: idx, item: selectedPlugin.shortcuts[idx] }
		]);
		updatePlugin(shortcutsSection.pluginId, (p) => ({
			...p,
			shortcuts: p.shortcuts.filter((_, i) => i !== idx)
		}));
	};

	return (
		<>
			<SettingsGlobalStyle />
			<GlassOverrides />
			<Root>
				<Header data-tauri-drag-region data-zone="header" data-zone-state={zoneState('header')}>
					<h1>{t('settings_title')}</h1>
					<HeaderRight>
						<SearchWrap $disabled={!searchEnabled}>
							<svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
								/>
							</svg>
							<SearchInput
								type="text"
								placeholder={t('search_placeholder') as string}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Escape') {
										setSearchQuery('');
										e.currentTarget.blur();
									}
								}}
								disabled={!searchEnabled}
								spellCheck={false}
								autoComplete="off"
							/>
							{searchQuery && searchEnabled && <SearchClear onClick={() => setSearchQuery('')}>&times;</SearchClear>}
						</SearchWrap>
						<BtnIcon onClick={undo} disabled={undoStack.length === 0} title={t('undo') as string}>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M3 7v6h6" />
								<path d="M3 13a9 9 0 0 1 3-7.7A9 9 0 0 1 21 12a9 9 0 0 1-9 9 9 9 0 0 1-7.4-3.9" />
							</svg>
						</BtnIcon>
						<BtnSecondary onClick={handleReset}>{t('reset_to_default')}</BtnSecondary>
						<BtnPrimary onClick={handleSave} disabled={!anyDirty}>
							{anyDirty ? t('save_changes') : t('saved')}
						</BtnPrimary>
					</HeaderRight>
				</Header>

				<Body style={{ position: 'relative' }}>
					<SettingsSidebar
						zoneState={zoneState('sidebar')}
						active={active}
						onSelect={setActive}
						plugins={plugins}
						registry={registry}
						onTogglePlugin={handleTogglePlugin}
						onAddCategory={handleAddCategory}
						onDeleteCategory={handleDeleteCategory}
						onReorderCategory={handleReorderCategory}
						stopList={stopList}
						onStopListChange={(e) => {
							setStopList(e);
							setStopListDirty(true);
						}}
					/>
					<Main data-zone="content" data-zone-state={zoneState('content')}>
						{active === 'plugins' && (
							<PluginManager plugins={plugins} registry={registry} onChanged={handlePluginsChanged} />
						)}

						{active === 'stats' && <StatsPanel />}

						{autocorrectSec && selectedPlugin && (
							<AutocorrectPanel
								rules={selectedPlugin.autocorrect ?? []}
								onChange={(rules) => {
									updatePlugin(autocorrectSec.pluginId, (p) => ({ ...p, autocorrect: rules }));
								}}
								onDelete={(idx) => {
									if (!selectedPlugin) return;
									updatePlugin(autocorrectSec.pluginId, (p) => ({
										...p,
										autocorrect: (p.autocorrect ?? []).filter((_, i) => i !== idx)
									}));
								}}
							/>
						)}

						{shortcutsSection && selectedPlugin && (
							<ShortcutEditor
								shortcuts={selectedPlugin.shortcuts}
								filterQuery={sq || undefined}
								onChange={handleShortcutsChange}
								onDelete={handleShortcutDelete}
							/>
						)}

						{active === 'settings' && (
							<React.Fragment key={settingsKey}>
								<SettingsGroup>
									<SettingsRow>
										<SettingsRowLabel>{t('expansion_enabled_label')}</SettingsRowLabel>
										<ExpansionToggle />
									</SettingsRow>
									<SettingsRow>
										<SettingsRowLabel>{t('hints_position_label')}</SettingsRowLabel>
										<HintsPositionPicker />
									</SettingsRow>
									<SettingsRow>
										<SettingsRowLabel>{t('trigger_char_label')}</SettingsRowLabel>
										<TriggerCharPicker
											shortcuts={merged.shortcuts}
											onShortcutsChange={(s) => {
												// Distribute changed shortcuts back to plugins
												// For trigger char changes, all shortcuts are remapped, update all plugins
												let idx = 0;
												setPlugins((prev) =>
													prev.map((p) => {
														const enabledEntry = registry.find((r) => r.id === p.id && r.enabled);
														if (!enabledEntry) return p;
														const newShortcuts = s.slice(idx, idx + p.shortcuts.length);
														idx += p.shortcuts.length;
														return { ...p, shortcuts: newShortcuts };
													})
												);
												// Mark all enabled plugins dirty
												for (const r of registry) {
													if (r.enabled) markPluginDirty(r.id);
												}
											}}
										/>
									</SettingsRow>
									<SettingsRow>
										<SettingsRowLabel>{t('unicode_hints_label')}</SettingsRowLabel>
										<UnicodeHintsToggle />
									</SettingsRow>
									<SettingsRow>
										<SettingsRowLabel>{t('autocorrect_enabled_label')}</SettingsRowLabel>
										<AutocorrectToggle />
									</SettingsRow>
									<SettingsRow>
										<SettingsRowLabel>{t('hotkey_label')}</SettingsRowLabel>
										<HotkeyPicker />
									</SettingsRow>
								</SettingsGroup>
								<SettingsGroup>
									<ThemePicker />
								</SettingsGroup>
								<SettingsGroup>
									<SettingsRow>
										<SettingsRowLabel>{t('language_label')}</SettingsRowLabel>
										<LanguagePicker />
									</SettingsRow>
									<SettingsRow>
										<SettingsRowLabel>{t('autostart_label')}</SettingsRowLabel>
										<AutostartToggle />
									</SettingsRow>
								</SettingsGroup>
								<SettingsGroup>
									<SettingsRow>
										<SettingsRowLabel>{t('data_label')}</SettingsRowLabel>
										<DataBtnRow>
											<BtnSecondary onClick={handleExport}>{t('export_settings')}</BtnSecondary>
											<BtnSecondary onClick={handleImport}>{t('import_settings')}</BtnSecondary>
										</DataBtnRow>
									</SettingsRow>
								</SettingsGroup>
							</React.Fragment>
						)}

						{selectedCat && catSection && !sq && (
							<CategoryEditor
								category={selectedCat}
								onChange={(cat) => handleUpdateCategory(catSection.pluginId, selectedCatIdx, cat)}
								onOpenPresets={() => setShowPresets(true)}
								onAddShortcut={(char, name) => setPromptChar([char, name])}
								existingExpansions={merged.shortcuts.map((s) => s.expansion)}
								onDeleteChar={(charIdx) => {
									setUndoStack((prev) => [
										...prev,
										{
											type: 'char',
											pluginId: catSection.pluginId,
											categoryIndex: selectedCatIdx,
											charIndex: charIdx,
											item: selectedCat.chars[charIdx]
										}
									]);
									handleUpdateCategory(catSection.pluginId, selectedCatIdx, {
										...selectedCat,
										chars: selectedCat.chars.filter((_, i) => i !== charIdx)
									});
								}}
							/>
						)}

						{catSection &&
							sq &&
							(searchCharResults && searchCharResults.length > 0 ? (
								<>
									{searchCharResults.map((cat) => (
										<SearchCatGroup key={cat.name}>
											<SearchCatLabel>{cat.name}</SearchCatLabel>
											<SearchResultsGrid>
												{cat.chars.map(([char, name]) => (
													<SearchResultChar
														key={char}
														title={`${char} ${name}`}
														onClick={() => setPromptChar([char, name])}
													>
														{displayChar(char)}
													</SearchResultChar>
												))}
											</SearchResultsGrid>
										</SearchCatGroup>
									))}
								</>
							) : (
								<Empty>{t('nothing_found')}</Empty>
							))}

						{selectedStopEntry && (
							<AppSettingsPanel
								entry={selectedStopEntry}
								onChange={(updated) => {
									setStopList(stopList.map((e) => (e.exe === updated.exe ? updated : e)));
									setStopListDirty(true);
								}}
							/>
						)}

						{!selectedCat &&
							!selectedStopEntry &&
							!shortcutsSection &&
							!autocorrectSec &&
							active !== 'settings' &&
							active !== 'plugins' &&
							active !== 'stats' && <Empty>{t('no_category_selected')}</Empty>}
					</Main>
					{dragging && <DropOverlay>{t('stoplist_drop_hint')}</DropOverlay>}
				</Body>

				<Footer data-zone="footer" data-zone-state={zoneState('footer')}>
					<BottomBar
						right={
							<Copyright onClick={() => openUrl('https://github.com/keireira')}>
								&copy; Alena Dzhukich (2026)
								<svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
									<path d="M3.5 3a.5.5 0 0 0 0 1h3.793L2.146 9.146a.5.5 0 1 0 .708.708L8 4.707V8.5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5h-5z" />
								</svg>
							</Copyright>
						}
					/>
				</Footer>

				{showPresets && selectedCat && (
					<PresetPicker
						onAdd={handleAddFromPresets}
						onClose={() => setShowPresets(false)}
						existingChars={selectedCat.chars.map(([ch]) => ch)}
					/>
				)}

				{promptChar && (
					<TriggerPrompt
						char={promptChar[0]}
						name={promptChar[1]}
						existingTriggers={merged.shortcuts.map((s) => s.trigger)}
						onAdd={(keyword) => {
							import('../store').then(({ loadTriggerChar }) => {
								loadTriggerChar().then((tc) => {
									const newShortcut = { trigger: tc + keyword + tc, expansion: promptChar[0] };
									// Add to the plugin that owns the character
									const ownerPlugin =
										plugins.find((p) => p.categories.some((cat) => cat.chars.some(([ch]) => ch === promptChar[0]))) ||
										plugins[0];
									if (ownerPlugin) {
										updatePlugin(ownerPlugin.id, (p) => ({
											...p,
											shortcuts: [...p.shortcuts, newShortcut]
										}));
									}
									setPromptChar(null);
								});
							});
						}}
						onClose={() => setPromptChar(null)}
					/>
				)}
			</Root>
		</>
	);
};

export default Settings;
