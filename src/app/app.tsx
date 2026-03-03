declare const APP_VERSION: string;

import { useState, useCallback, useRef, useEffect } from 'react';
import Root, {
	AppGlobalStyle,
	GridArea,
	NoResults,
	BottomBar,
	BottomBarBtn,
	BottomBarInfo,
	BottomBarLink
} from './app.styles';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../data/characters';
import SearchBar from '../components/search-bar';
import Category from '../components/category';
import Toast from '../components/toast';
import { useLanguage, getLanguageChoice, applyLanguage } from '../i18n';
import type { Category as CategoryType } from '../types';

const MAX_HEIGHT = 520;
const WIDTH = 420;

export default function App() {
	const t = useLanguage();
	const [categories, setCategories] = useState<CategoryType[]>(DEFAULT_CATEGORIES);
	const [query, setQuery] = useState('');
	const [toast, setToast] = useState<string | null>(null);
	const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const appRef = useRef<HTMLDivElement>(null);
	const lastHeight = useRef(0);

	// Load categories from store on mount and on focus
	useEffect(() => {
		let cancelled = false;
		let unlistenPromise: Promise<() => void> | undefined;

		async function load() {
			try {
				const { loadCategories } = await import('../store');
				const cats = await loadCategories();
				if (!cancelled) setCategories(cats);
			} catch (e) {
				console.error('Store load failed:', e);
			}
		}
		load();

		// Listen for explicit categories-changed event from settings window
		let unlistenCatsPromise: Promise<() => void> | undefined;
		import('@tauri-apps/api/event')
			.then(({ listen }) => {
				if (cancelled) return;
				unlistenCatsPromise = listen('categories-changed', () => {
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
				});
			})
			.catch((e) => console.error('Focus listener setup failed:', e));

		return () => {
			cancelled = true;
			if (unlistenPromise) unlistenPromise.then((fn) => fn()).catch(() => {});
			if (unlistenCatsPromise) unlistenCatsPromise.then((fn) => fn()).catch(() => {});
		};
	}, []);

	const showToast = useCallback((message: string) => {
		setToast(message);
		if (toastTimer.current) clearTimeout(toastTimer.current);
		toastTimer.current = setTimeout(() => setToast(null), 1200);
	}, []);

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

	const q = query.toLowerCase().trim();

	const filtered = categories
		.map((cat) => {
			if (!q) return cat;
			const categoryMatch = cat.name.toLowerCase().includes(q);
			const matchedChars = cat.chars.filter(([char, name]) => categoryMatch || char.includes(q) || name.includes(q));
			return { ...cat, chars: matchedChars };
		})
		.filter((cat) => cat.chars.length > 0);

	const openUrl = (url: string) => {
		import('@tauri-apps/api/core')
			.then(({ invoke }) => invoke('open_url_cmd', { url }))
			.catch(() => window.open(url, '_blank'));
	};

	const openSettings = () => {
		import('@tauri-apps/api/core')
			.then(({ invoke }) => {
				invoke('open_settings_cmd');
			})
			.catch((e) => console.error('Failed to open settings:', e));
	};

	return (
		<>
			<AppGlobalStyle />
			<Root ref={appRef}>
				<SearchBar value={query} onChange={setQuery} />
				<GridArea>
					{filtered.length > 0 ? (
						filtered.map((cat) => <Category key={cat.name} category={cat} onCopy={showToast} />)
					) : (
						<NoResults>{t('nothing_found')}</NoResults>
					)}
				</GridArea>
				<BottomBar>
					<BottomBarInfo>
						<BottomBarLink
							onClick={() => openUrl('https://github.com/Keireira/clownfish/releases')}
							title="GitHub Releases"
						>
							<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
								<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
							</svg>
							v{APP_VERSION}
						</BottomBarLink>
						<BottomBarLink onClick={() => openUrl('https://hot.keireira.com')} title="Website">
							hot.keireira.com
						</BottomBarLink>
					</BottomBarInfo>
					<BottomBarBtn onClick={openSettings} title="Settings">
						<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.062 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
							/>
						</svg>
						<span>{t('settings')}</span>
					</BottomBarBtn>
				</BottomBar>
				<Toast message={toast} />
			</Root>
		</>
	);
}
