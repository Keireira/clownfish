import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useEffect } from 'react';

import en from './locales/en.json';
import ru from './locales/ru.json';
import es from './locales/es.json';
import ja from './locales/ja.json';

export type Locale = 'en' | 'ru' | 'es' | 'ja';

const SUPPORTED: Locale[] = ['en', 'ru', 'es', 'ja'];
const STORAGE_KEY = 'hs-locale';

export const LOCALES: { code: Locale; label: string }[] = [
	{ code: 'en', label: 'EN' },
	{ code: 'ru', label: 'RU' },
	{ code: 'es', label: 'ES' },
	{ code: 'ja', label: 'JA' }
];

const detectLocale = (): Locale => {
	const saved = localStorage.getItem(STORAGE_KEY);
	if (saved && SUPPORTED.includes(saved as Locale)) return saved as Locale;
	const lang = navigator.language.toLowerCase();
	for (const code of SUPPORTED) {
		if (lang === code || lang.startsWith(code + '-')) return code;
	}
	return 'en';
};

i18n.use(initReactI18next).init({
	resources: {
		en: { translation: en },
		ru: { translation: ru },
		es: { translation: es },
		ja: { translation: ja }
	},
	lng: 'en',
	fallbackLng: 'en',
	interpolation: { escapeValue: false }
});

i18n.on('languageChanged', (lng) => {
	if (typeof window !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, lng);
	}
});

export const useLocaleDetection = () => {
	useEffect(() => {
		const detected = detectLocale();
		if (i18n.language !== detected) {
			i18n.changeLanguage(detected);
		}
	}, []);
};

export default i18n;
