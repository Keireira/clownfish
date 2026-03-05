import { getStore } from './store';
import { emitEvent } from './events';
import { useState, useEffect } from 'react';
import { translations } from './data/translations';
import type { LanguageChoice } from './types';

const LANG_KEY = 'language';
const SUPPORTED = ['en', 'ru', 'es', 'ja'] as const;

// --- Persistence ---

export async function getLanguageChoice(): Promise<LanguageChoice> {
	try {
		const store = await getStore();
		const val = await store.get<string>(LANG_KEY);
		if (val === 'auto' || (SUPPORTED as readonly string[]).includes(val!)) return val as LanguageChoice;
	} catch (e) {
		console.error('Failed to load language:', e);
	}
	return 'auto';
}

export async function setLanguageChoice(value: LanguageChoice): Promise<void> {
	const store = await getStore();
	await store.set(LANG_KEY, value);
	await store.save();
	localStorage.setItem('language', value);
	applyLanguage(value);
	await emitEvent('language-changed', value);
}

// --- Resolution ---

function resolveLocale(choice: string): string {
	if (choice !== 'auto') return choice;
	const nav = (navigator.language || 'en').toLowerCase();
	for (const loc of SUPPORTED) {
		if (nav === loc || nav.startsWith(loc + '-')) return loc;
	}
	return 'en';
}

// --- Current state ---

let currentLang = resolveLocale(localStorage.getItem('language') || 'auto');

export function applyLanguage(choice: LanguageChoice | string): void {
	currentLang = resolveLocale(choice);
	notify();
}

// --- Translation ---

export function t(key: string, ...args: unknown[]): string {
	const val = translations[currentLang]?.[key] ?? translations.en?.[key] ?? key;
	return typeof val === 'function' ? val(...args) : val;
}

// Category name mapping (English name -> translation key)
const CATEGORY_KEY_MAP: Record<string, string> = {
	Arrows: 'cat_arrows',
	Math: 'cat_math',
	Currency: 'cat_currency',
	Typography: 'cat_typography',
	'Checks & Marks': 'cat_checks_marks',
	'Stars & Shapes': 'cat_stars_shapes',
	Greek: 'cat_greek',
	Misc: 'cat_misc',
	'Subscript & Superscript': 'cat_sub_super',
	'Lines & Boxes': 'cat_lines_boxes',
	'Latin Extended': 'cat_latin_ext',
	Happy: 'cat_kaomoji_happy',
	Sad: 'cat_kaomoji_sad',
	Angry: 'cat_kaomoji_angry',
	Love: 'cat_kaomoji_love',
	Surprise: 'cat_kaomoji_surprise',
	Animals: 'cat_kaomoji_animals',
	Actions: 'cat_kaomoji_actions'
};

export function translateCategoryName(name: string): string {
	const key = CATEGORY_KEY_MAP[name];
	return key ? t(key) : name;
}

// --- Pub/Sub ---

let subscribers: Array<() => void> = [];

function notify(): void {
	subscribers.forEach((fn) => fn());
}

export function useLanguage(): typeof t {
	const [, rerender] = useState(0);
	useEffect(() => {
		const cb = () => rerender((n) => n + 1);
		subscribers.push(cb);
		return () => {
			subscribers = subscribers.filter((fn) => fn !== cb);
		};
	}, []);
	return t;
}

// --- Init ---

export async function initLanguage(): Promise<void> {
	const choice = await getLanguageChoice();
	localStorage.setItem('language', choice);
	applyLanguage(choice);

	try {
		const { listen } = await import('@tauri-apps/api/event');
		await listen<string>('language-changed', (event) => {
			localStorage.setItem('language', event.payload);
			applyLanguage(event.payload);
		});
	} catch (err) {
		console.error(err);
	}
}
