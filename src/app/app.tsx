import { useState, useCallback, useRef, useEffect } from 'react';
import Root, { AppGlobalStyle, GridArea, NoResults, SettingsBtn } from './app.styles';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../data/characters';
import SearchBar from '../components/search-bar';
import Category from '../components/category';
import CharPreview, { CharPreviewProvider } from '../components/char-preview';
import Toast from '../components/toast';
import TriggerPrompt from '../components/trigger-prompt';
import BottomBar from '../components/bottom-bar';
import { useLanguage, getLanguageChoice, applyLanguage } from '../i18n';
import { charMatchesQuery } from '../utils/char-match';
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
	const appRef = useRef<HTMLDivElement>(null);
	const lastHeight = useRef(0);

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
					import('../theme').then(({ getThemeChoice, applyTheme }) => {
						getThemeChoice().then(applyTheme);
					});
					getLanguageChoice().then(applyLanguage);
					// Focus the search input when the window appears from tray
					const input = document.querySelector<HTMLInputElement>('[data-search-input]');
					if (input) {
						input.focus();
						input.select();
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

	const openSettings = () => {
		import('@tauri-apps/api/core')
			.then(({ invoke }) => {
				invoke('open_settings_cmd');
			})
			.catch((e) => console.error('Failed to open settings:', e));
	};

	return (
		<CharPreviewProvider>
			<AppGlobalStyle />
			<Root ref={appRef}>
				<SearchBar value={query} onChange={setQuery} />
				<GridArea>
					{filtered.length > 0 ? (
						filtered.map((cat) => (
							<Category
								key={cat.name}
								category={cat}
								onCopy={showToast}
								onAddShortcut={handleAddShortcut}
								existingExpansions={shortcuts.map((s) => s.expansion)}
							/>
						))
					) : (
						<NoResults>{t('nothing_found')}</NoResults>
					)}
				</GridArea>
				<BottomBar
					right={
						<SettingsBtn onClick={openSettings}>
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
				<CharPreview />
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
