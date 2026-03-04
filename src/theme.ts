import { load } from '@tauri-apps/plugin-store';
import type { ThemeChoice } from './types';

export async function getThemeChoice(): Promise<ThemeChoice> {
	try {
		const store = await load('settings.json', { defaults: {}, autoSave: true });
		const val = await store.get<string>('theme');
		if (val === 'light' || val === 'dark' || val === 'auto') return val;
	} catch (e) {
		console.error('Failed to load theme:', e);
	}
	return 'auto';
}

export async function setThemeChoice(value: ThemeChoice): Promise<void> {
	const store = await load('settings.json', { defaults: {}, autoSave: true });
	await store.set('theme', value);
	await store.save();
	localStorage.setItem('theme', value);
	applyTheme(value);

	// Notify other windows
	try {
		const { emit } = await import('@tauri-apps/api/event');
		await emit('theme-changed', value);
	} catch (err) {
		console.error(err);
	}
}

function getSystemTheme(): 'dark' | 'light' {
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Set native window theme so vibrancy material matches */
async function setNativeTheme(choice: ThemeChoice): Promise<void> {
	try {
		const { setTheme } = await import('@tauri-apps/api/app');
		await setTheme(choice === 'auto' ? null : choice);
	} catch (err) {
		console.error(err);
	}
}

export function applyTheme(choice: ThemeChoice): void {
	const resolved = choice === 'auto' ? getSystemTheme() : choice;
	if (resolved === 'light') {
		document.documentElement.setAttribute('data-theme', 'light');
	} else {
		document.documentElement.removeAttribute('data-theme');
	}
	setNativeTheme(choice);
}

function detectGlass(): void {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const tauri = (window as any).__TAURI_INTERNALS__;
	if (!tauri) return;
	const p = navigator.platform;
	const label = tauri.metadata?.currentWindow?.label as string | undefined;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const isSettings = (window as any).__IS_SETTINGS_WINDOW__ || label === 'settings';
	// Settings is a normal decorated window — no transparent background.
	// Remove glass/popup in case the inline script added them prematurely.
	if (isSettings) {
		document.documentElement.classList.remove('glass', 'popup');
		return;
	}
	if (p.startsWith('Mac') || p.startsWith('Win')) {
		document.documentElement.classList.add('glass');
	}
}

export async function initTheme(): Promise<void> {
	detectGlass();

	const choice = await getThemeChoice();
	localStorage.setItem('theme', choice);
	applyTheme(choice);

	// Listen for theme changes from other windows
	try {
		const { listen } = await import('@tauri-apps/api/event');
		await listen<string>('theme-changed', (event) => {
			localStorage.setItem('theme', event.payload);
			applyTheme(event.payload as ThemeChoice);
		});
	} catch (err) {
		console.error(err);
	}

	// Listen for system theme changes (for auto mode)
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async () => {
		const current = await getThemeChoice();
		if (current === 'auto') {
			applyTheme('auto');
		}
	});
}
