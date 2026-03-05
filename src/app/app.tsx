import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import Root, { AppGlobalStyle, GridArea, NoResults, SettingsBtn, MultiSelectBar, MultiSelectPreview, MultiSelectCount, MultiSelectBtn } from './app.styles';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../data/characters';
import SearchBar from '../components/search-bar';
import Category from '../components/category';
import CharPreview, { CharPreviewProvider } from '../components/char-preview';
import Toast from '../components/toast';
import TriggerPrompt from '../components/trigger-prompt';
import BottomBar from '../components/bottom-bar';
import TabBar from '../components/tab-bar';
import type { TabId } from '../components/tab-bar';
import ComposePanel from '../components/compose-panel';
import { useLanguage, getLanguageChoice, applyLanguage } from '../i18n';
import { charMatchesQuery } from '../utils/char-match';
import { displayChar } from '../types';
import type { Category as CategoryType, Shortcut } from '../types';

const MAX_HEIGHT = 520;
const WIDTH = 420;

export default function App() {
	const t = useLanguage();
	const [categories, setCategories] = useState<CategoryType[]>(DEFAULT_CATEGORIES);
	const [query, setQuery] = useState('');
	const [toast, setToast] = useState<string | null>(null);
	const [promptChar, setPromptChar] = useState<[string, string] | null>(null);
	const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
	const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [focusedIndex, setFocusedIndex] = useState(-1);
	const [activeTab, setActiveTab] = useState<TabId>('chars');
	const [multiSelected, setMultiSelected] = useState<string[]>([]);
	const lastSelectIdx = useRef<number>(-1);
	const multiSelectedSet = useMemo(() => new Set(multiSelected), [multiSelected]);
	const appRef = useRef<HTMLDivElement>(null);
	const lastHeight = useRef(0);
	const gridColsRef = useRef(8);

	// Load categories + shortcuts from plugin system on mount and on focus
	useEffect(() => {
		let cancelled = false;
		let unlistenPromise: Promise<() => void> | undefined;

		async function load() {
			try {
				const { loadMergedData } = await import('../plugin-store');
				const { categories: cats, shortcuts: sc } = await loadMergedData();
				if (!cancelled) {
					setCategories(cats);
					setShortcuts(sc);
				}
			} catch (e) {
				console.error('Store load failed:', e);
			}
		}
		load();

		// Listen for explicit categories-changed event from settings window
		let unlistenCatsPromise: Promise<() => void> | undefined;
		let unlistenShortcutsPromise: Promise<() => void> | undefined;
		import('@tauri-apps/api/event')
			.then(({ listen }) => {
				if (cancelled) return;
				unlistenCatsPromise = listen('categories-changed', () => {
					load();
				});
				unlistenShortcutsPromise = listen('shortcuts-changed', () => {
					load();
				});
			})
			.catch((e) => console.error('Event listener setup failed:', e));

		// Listen for window focus to reload theme/language
		import('@tauri-apps/api/window')
			.then(({ getCurrentWindow }) => {
				if (cancelled) return;
				const win = getCurrentWindow();
				unlistenPromise = win.onFocusChanged(({ payload: focused }) => {
					if (!focused) return;
					load();
					setMultiSelected([]);
					lastSelectIdx.current = -1;
					import('../theme').then(({ getThemeChoice, applyTheme }) => {
						getThemeChoice().then(applyTheme);
					});
					getLanguageChoice().then(applyLanguage);
					// Focus the appropriate input when the window appears from tray
					const composeInput = document.querySelector<HTMLInputElement>('[data-compose-input]');
					const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
					if (composeInput) {
						composeInput.focus();
					} else if (searchInput) {
						searchInput.focus();
						searchInput.select();
					}
				});
			})
			.catch((e) => console.error('Focus listener setup failed:', e));

		return () => {
			cancelled = true;
			if (unlistenPromise) unlistenPromise.then((fn) => fn()).catch(() => {});
			if (unlistenCatsPromise) unlistenCatsPromise.then((fn) => fn()).catch(() => {});
			if (unlistenShortcutsPromise) unlistenShortcutsPromise.then((fn) => fn()).catch(() => {});
		};
	}, []);

	const showToast = useCallback((message: string) => {
		setToast(message);
		if (toastTimer.current) clearTimeout(toastTimer.current);
		toastTimer.current = setTimeout(() => setToast(null), 1200);
	}, []);

	const handleAddShortcut = useCallback((char: string, name: string) => {
		setPromptChar([char, name]);
	}, []);

	const handlePromptAdd = useCallback(
		async (keyword: string) => {
			if (!promptChar) return;
			try {
				const { loadPluginRegistry, loadAllPlugins, savePlugin, mergePlugins } = await import('../plugin-store');
				const { loadTriggerChar } = await import('../store');
				const { emitEvent } = await import('../events');
				const { invoke } = await import('@tauri-apps/api/core');
				const tc = await loadTriggerChar();
				const newShortcut = { trigger: tc + keyword + tc, expansion: promptChar[0] };

				// Find which plugin owns the character's category, default to first enabled
				const registry = await loadPluginRegistry();
				const plugins = await loadAllPlugins(registry);
				let targetPlugin = plugins[0];
				for (const p of plugins) {
					if (p.categories.some((cat) => cat.chars.some(([ch]) => ch === promptChar[0]))) {
						targetPlugin = p;
						break;
					}
				}
				if (targetPlugin) {
					targetPlugin.shortcuts = [...targetPlugin.shortcuts, newShortcut];
					await savePlugin(targetPlugin);
				}

				const merged = mergePlugins(plugins, registry);
				await invoke('expansion_update_shortcuts', { shortcuts: merged.shortcuts });
				await emitEvent('shortcuts-changed');
				setShortcuts(merged.shortcuts);
				showToast(t('shortcut_added') as string);
			} catch (e) {
				console.error('Failed to add shortcut:', e);
			}
			setPromptChar(null);
		},
		[promptChar, showToast, t]
	);

	// Resize the Tauri window to fit content
	useEffect(() => {
		const el = appRef.current;
		if (!el) return;

		const ro = new ResizeObserver(() => {
			// Sum up actual children heights + Root padding/border to get natural content height
			let contentH = 0;
			for (const child of el.children) {
				contentH += (child as HTMLElement).scrollHeight;
			}
			const style = getComputedStyle(el);
			const paddingY = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
			const borderY = Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth);
			const gapH = (el.children.length - 1) * (Number.parseFloat(style.rowGap) || 0);
			const desired = Math.min(Math.ceil(contentH + paddingY + borderY + gapH), MAX_HEIGHT);

			if (Math.abs(desired - lastHeight.current) < 2) return;
			lastHeight.current = desired;
			import('@tauri-apps/api/window')
				.then(({ getCurrentWindow, LogicalSize }) => {
					getCurrentWindow().setSize(new LogicalSize(WIDTH, desired));
				})
				.catch(() => {});
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	const q = query.trim();

	const filtered = categories
		.map((cat) => {
			if (!q) return cat;
			const categoryMatch = cat.name.toLowerCase().includes(q.toLowerCase());
			const matchedChars = cat.chars.filter(([char, name]) => categoryMatch || charMatchesQuery(char, name, q));
			return { ...cat, chars: matchedChars };
		})
		.filter((cat) => cat.chars.length > 0);

	const flatChars = useMemo(() => filtered.flatMap((cat) => cat.chars), [filtered]);

	const categoryOffsets = useMemo(() => {
		let offset = 0;
		return filtered.map((cat) => {
			const start = offset;
			offset += cat.chars.length;
			return start;
		});
	}, [filtered]);

	// Reset focus and multi-select when query changes
	useEffect(() => {
		setFocusedIndex(-1);
		setMultiSelected([]);
		lastSelectIdx.current = -1;
	}, [q]);

	const openSettings = () => {
		import('@tauri-apps/api/core')
			.then(({ invoke }) => {
				invoke('open_settings_cmd');
			})
			.catch((e) => console.error('Failed to open settings:', e));
	};

	const measureCols = useCallback(() => {
		const grid = document.querySelector<HTMLElement>('[data-category-grid]');
		if (grid) {
			gridColsRef.current = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
		}
	}, []);

	const handleCharModifiedClick = useCallback(
		(char: string, flatIndex: number, e: React.MouseEvent) => {
			if (e.shiftKey && lastSelectIdx.current >= 0) {
				// Range select
				const from = Math.min(lastSelectIdx.current, flatIndex);
				const to = Math.max(lastSelectIdx.current, flatIndex);
				setMultiSelected((prev) => {
					const set = new Set(prev);
					for (let i = from; i <= to; i++) {
						const [ch] = flatChars[i];
						if (!set.has(ch)) {
							set.add(ch);
						}
					}
					return [...set];
				});
			} else {
				// Ctrl/Cmd click — toggle single char
				setMultiSelected((prev) => {
					const idx = prev.indexOf(char);
					if (idx >= 0) {
						return prev.filter((_, i) => i !== idx);
					}
					return [...prev, char];
				});
				lastSelectIdx.current = flatIndex;
			}
		},
		[flatChars]
	);

	const copyMultiBuffer = useCallback(() => {
		const text = multiSelected.join('');
		writeText(text).then(() => {
			import('../stats-store').then(({ recordCharCopy }) => {
				for (const ch of multiSelected) recordCharCopy(ch);
			});
			showToast(t('copied_multi', multiSelected.length));
			setMultiSelected([]);
			lastSelectIdx.current = -1;
			import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().hide());
		});
	}, [multiSelected, showToast, t]);

	const clearMultiBuffer = useCallback(() => {
		setMultiSelected([]);
		lastSelectIdx.current = -1;
	}, []);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent | KeyboardEvent) => {
			// In compose tab, only handle Escape (to switch back)
			if (activeTab !== 'chars') {
				if (e.key === 'Escape') {
					e.preventDefault();
					setActiveTab('chars');
				}
				return;
			}

			const max = flatChars.length;
			if (max === 0 && e.key !== 'Escape' && e.key !== 'Tab') return;

			switch (e.key) {
				case 'ArrowDown': {
					e.preventDefault();
					measureCols();
					const cols = gridColsRef.current;
					if (focusedIndex < 0) {
						setFocusedIndex(0);
					} else {
						setFocusedIndex(Math.min(focusedIndex + cols, max - 1));
					}
					break;
				}
				case 'ArrowUp': {
					e.preventDefault();
					measureCols();
					const cols = gridColsRef.current;
					if (focusedIndex === max) {
						// From settings → last char row
						setFocusedIndex(max - 1);
					} else if (focusedIndex - cols < 0) {
						setFocusedIndex(-1);
						const input = document.querySelector<HTMLInputElement>('[data-search-input]');
						input?.focus();
					} else {
						setFocusedIndex(focusedIndex - cols);
					}
					break;
				}
				case 'ArrowRight': {
					e.preventDefault();
					if (focusedIndex < max - 1) {
						setFocusedIndex(focusedIndex + 1);
					}
					break;
				}
				case 'ArrowLeft': {
					e.preventDefault();
					if (focusedIndex <= 0) {
						setFocusedIndex(-1);
						const input = document.querySelector<HTMLInputElement>('[data-search-input]');
						input?.focus();
					} else {
						setFocusedIndex(focusedIndex - 1);
					}
					break;
				}
				case 'Enter': {
					if ((e.ctrlKey || e.metaKey) && focusedIndex >= 0 && focusedIndex < max) {
						e.preventDefault();
						const [ch] = flatChars[focusedIndex];
						setMultiSelected((prev) => {
							const idx = prev.indexOf(ch);
							if (idx >= 0) return prev.filter((_, i) => i !== idx);
							return [...prev, ch];
						});
						lastSelectIdx.current = focusedIndex;
					} else if (e.shiftKey && focusedIndex >= 0 && focusedIndex < max && lastSelectIdx.current >= 0) {
						e.preventDefault();
						const from = Math.min(lastSelectIdx.current, focusedIndex);
						const to = Math.max(lastSelectIdx.current, focusedIndex);
						setMultiSelected((prev) => {
							const set = new Set(prev);
							for (let i = from; i <= to; i++) {
								const [c] = flatChars[i];
								if (!set.has(c)) set.add(c);
							}
							return [...set];
						});
					} else if (multiSelected.length > 0) {
						e.preventDefault();
						copyMultiBuffer();
					} else if (focusedIndex === max) {
						e.preventDefault();
						openSettings();
					} else if (focusedIndex >= 0 && focusedIndex < max) {
						e.preventDefault();
						const [char] = flatChars[focusedIndex];
						writeText(char).then(() => {
							import('../stats-store').then(({ recordCharCopy }) => recordCharCopy(char));
							showToast(t('copied_char', char));
							import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().hide());
						});
					}
					break;
				}
				case 'Tab': {
					e.preventDefault();
					if (e.shiftKey) {
						if (focusedIndex === max) {
							// From settings → last category
							if (categoryOffsets.length > 0) {
								setFocusedIndex(categoryOffsets[categoryOffsets.length - 1]);
							} else {
								setFocusedIndex(-1);
								const input = document.querySelector<HTMLInputElement>('[data-search-input]');
								input?.focus();
							}
						} else {
							// Jump to previous category
							for (let i = categoryOffsets.length - 1; i >= 0; i--) {
								if (categoryOffsets[i] < focusedIndex) {
									setFocusedIndex(categoryOffsets[i]);
									return;
								}
							}
							setFocusedIndex(-1);
							const input = document.querySelector<HTMLInputElement>('[data-search-input]');
							input?.focus();
						}
					} else {
						// Jump to next category, then settings
						for (let i = 0; i < categoryOffsets.length; i++) {
							if (categoryOffsets[i] > focusedIndex) {
								setFocusedIndex(categoryOffsets[i]);
								return;
							}
						}
						// Past last category → settings
						if (focusedIndex < max) {
							setFocusedIndex(max);
						}
					}
					break;
				}
				case 'Escape': {
					e.preventDefault();
					if (multiSelected.length > 0) {
						clearMultiBuffer();
					} else if (query) {
						setQuery('');
					} else {
						import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().hide());
					}
					break;
				}
			}
		},
		[activeTab, focusedIndex, flatChars, categoryOffsets, measureCols, showToast, t, query, openSettings, multiSelected, copyMultiBuffer, clearMultiBuffer, handleCharModifiedClick]
	);

	const settingsFocused = focusedIndex === flatChars.length;

	return (
		<CharPreviewProvider>
			<AppGlobalStyle />
			<Root ref={appRef} onKeyDown={handleKeyDown}>
				<TabBar active={activeTab} onChange={setActiveTab} />
				{activeTab === 'chars' ? (
					<>
						<SearchBar value={query} onChange={setQuery} onKeyDown={handleKeyDown} />
						{multiSelected.length > 0 && (
							<MultiSelectBar>
								<MultiSelectPreview>{multiSelected.map(displayChar).join('')}</MultiSelectPreview>
								<MultiSelectCount>{t('n_selected', multiSelected.length)}</MultiSelectCount>
								<MultiSelectBtn onClick={clearMultiBuffer}>{t('multi_clear')}</MultiSelectBtn>
								<MultiSelectBtn $primary onClick={copyMultiBuffer}>{t('multi_copy')}</MultiSelectBtn>
							</MultiSelectBar>
						)}
						<GridArea>
							{filtered.length > 0 ? (
								filtered.map((cat, ci) => (
									<Category
										key={cat.name}
										category={cat}
										focusedStart={categoryOffsets[ci]}
										focusedIndex={focusedIndex}
										onCopy={showToast}
										onAddShortcut={handleAddShortcut}
										existingExpansions={shortcuts.map((s) => s.expansion)}
										selectedChars={multiSelectedSet}
										onCharModifiedClick={handleCharModifiedClick}
									/>
								))
							) : (
								<NoResults>{t('nothing_found')}</NoResults>
							)}
						</GridArea>
					</>
				) : (
					<ComposePanel onCopy={showToast} />
				)}
				<BottomBar
					right={
						<SettingsBtn $focused={settingsFocused} onClick={openSettings}>
							<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.062 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
								/>
							</svg>
							<span>{t('settings')}</span>
						</SettingsBtn>
					}
				/>
				<Toast message={toast} />
				<CharPreview onCopy={showToast} />
				{promptChar && (
					<TriggerPrompt
						char={promptChar[0]}
						name={promptChar[1]}
						existingTriggers={shortcuts.map((s) => s.trigger)}
						onAdd={handlePromptAdd}
						onClose={() => setPromptChar(null)}
					/>
				)}
			</Root>
		</CharPreviewProvider>
	);
}
