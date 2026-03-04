import { useState, useCallback } from 'react';

export type Locale = 'en' | 'ru' | 'es' | 'ja';

const LOCALE_CODES: Locale[] = ['en', 'ru', 'es', 'ja'];
const STORAGE_KEY = 'hs-locale';

export const LOCALES: { code: Locale; label: string }[] = [
	{ code: 'en', label: 'EN' },
	{ code: 'ru', label: 'RU' },
	{ code: 'es', label: 'ES' },
	{ code: 'ja', label: 'JA' }
];

function detectLocale(): Locale {
	if (typeof window === 'undefined') return 'en';

	const saved = localStorage.getItem(STORAGE_KEY);
	if (saved && LOCALE_CODES.includes(saved as Locale)) return saved as Locale;

	const lang = navigator.language.toLowerCase();
	for (const code of LOCALE_CODES) {
		if (lang === code || lang.startsWith(code + '-')) return code;
	}
	return 'en';
}

export function useLocale() {
	const [locale, setLocaleState] = useState<Locale>(detectLocale);

	const setLocale = useCallback((code: Locale) => {
		setLocaleState(code);
		localStorage.setItem(STORAGE_KEY, code);
	}, []);

	return [locale, setLocale] as const;
}

const translations: Record<Locale, Record<string, string>> = {
	en: {
		// Nav
		nav_features: 'Features',
		nav_symbols: 'Symbols',
		nav_download: 'Download',
		nav_support: 'Donate',

		// Hero
		tagline: 'Gaslight everyone into thinking you use AI for texts.',
		subtitle: "⌘ → ± ∞ © and more from your menu bar. Click — and it's copied.",
		download_cta: 'Download for macOS',
		download_cta_win: 'Download for Windows',
		search_placeholder: 'Search symbols…',

		// How it works
		how_heading: 'How it works',
		how_step1_title: 'Click the menu bar',
		how_step1_desc: 'Lives up top. No dock icon, no windows, zero clutter.',
		how_step2_title: 'Find it',
		how_step2_desc: 'Browse through or just type. π = "pi".',
		how_step3_title: 'Click → copied',
		how_step3_desc: "One click, it's on your clipboard. Paste anywhere.",

		// Features
		feat_instant_title: 'Lives in menu bar',
		feat_instant_desc: 'No dock icon. No window juggling. Click, grab, gone.',
		feat_symbols_title: '11 prebuilt categories',
		feat_symbols_desc: 'Typography • Arrows • Math • Currency • Greek • Stars • Sub/Super • Box Drawing • Latin • Keys',
		feat_custom_title: 'Your layout',
		feat_custom_desc: 'Add categories, drag to reorder, toss in your own symbols.',

		// Showcase
		showcase_heading: 'What\u2019s inside',
		typo_cat: 'Typography',
		arrows_cat: 'Arrows',
		math_cat: 'Math',
		currency_cat: 'Currency',
		greek_cat: 'Greek',
		misc_cat: 'Keyboard',

		// Who it's for
		who_heading: 'Built for',
		who_writers_title: 'Writers & Editors',
		who_writers_desc: 'Em dashes, curly quotes, ellipses — real typography without Alt codes.',
		who_devs_title: 'Developers',
		who_devs_desc: '⌘ ⌥ ⇧ for docs, → for flow, box-drawing for ASCII art.',
		who_designers_title: 'Designers',
		who_designers_desc: '© ® ™ for mockups, arrows for flows. Paste straight into Figma.',
		who_academics_title: 'Academics',
		who_academics_desc: 'αβγ Greek, ∫∑√ operators, ²³ superscripts. No LaTeX needed.',

		// Details
		also_heading: 'Under the hood',
		extra_theme_title: 'Dark & Light',
		extra_theme_desc: 'Follows macOS appearance automatically.',
		extra_search_title: 'Type to find',
		extra_search_desc: '"arrow" → ← → ↑ ↓. Instant.',
		extra_lang_title: '4 languages',
		extra_lang_desc: 'EN · RU · ES · JA — full interface.',
		extra_light_title: '< 10 MB',
		extra_light_desc: 'Tauri, not Electron. Native WebView.',
		extra_private_title: 'Offline-only',
		extra_private_desc: 'No accounts. No cloud. No tracking.',
		extra_login_title: 'Starts with macOS',
		extra_login_desc: 'Launches silently at login. Always ready.',

		// Download
		download_heading: 'Get it',
		download_desc: 'Free and open source.',
		download_macos: 'macOS',
		download_windows: 'Windows',
		download_macos_req: 'Requires macOS 15+',
		download_windows_req: 'Requires Windows 10+',
		dl_universal: 'Universal',
		dl_universal_desc: 'Apple Silicon + Intel',
		dl_arm: 'Apple Silicon',
		dl_arm_desc: 'M-series chips',
		dl_intel: 'Intel',
		dl_intel_desc: 'x86_64',
		dl_win_x64_desc: 'Most Windows PCs',
		dl_win_arm_desc: 'Snapdragon / Copilot+ PCs',

		// Support
		support_heading: 'Like it? Fuel it.',
		support_desc: 'Free and open source. If it saves you even one google search — consider buying me a coffee.',
		buy_coffee: 'Buy Me a Coffee',
		sponsor_gh: 'Sponsor on GitHub',
		footer_built: 'Built with Tauri & React',

		// Privacy
		privacy_back: '← Back',
		privacy_title: 'Privacy Policy',
		privacy_short: 'Hot Symbols collects nothing. Zero. Nada.',
		privacy_short_label: 'Short version:',
		privacy_no_data_title: 'No data collection',
		privacy_no_data_desc:
			'Hot Symbols does not collect, store, process, or transmit any personal data or usage information. The app runs entirely on your device.',
		privacy_no_analytics_title: 'No analytics',
		privacy_no_analytics_desc:
			"There are no analytics, telemetry, crash reporters, or tracking of any kind. We don't know how many users we have, and we like it that way.",
		privacy_no_network_title: 'No network requests',
		privacy_no_network_desc:
			'The app works completely offline. It never connects to the internet. No APIs, no servers, no cloud sync, no update pings.',
		privacy_no_accounts_title: 'No accounts',
		privacy_no_accounts_desc: "No sign-ups, no logins, no email addresses. You download it, you use it. That's it.",
		privacy_local_title: 'Local storage only',
		privacy_local_desc:
			'Your preferences (theme, language, custom categories) are stored locally on your machine. They never leave your device.',
		privacy_third_title: 'Third parties',
		privacy_third_desc: 'There are none. No SDKs, no embedded services, no third-party code that phones home.',
		privacy_updated: 'Last updated: March 2026'
	},
	ru: {
		nav_features: 'Фичи',
		nav_symbols: 'Символы',
		nav_download: 'Скачать',
		nav_support: 'Донат',

		tagline: 'Загазлайть всех, что ты пишешь им с AI.',
		subtitle: '⌘ → ± ∞ © и не только — из меню-бара. Клик — и скопировано.',
		download_cta: 'Скачать для macOS',
		download_cta_win: 'Скачать для Windows',
		search_placeholder: 'Поиск символов…',

		how_heading: 'Как это работает',
		how_step1_title: 'Клик в меню-баре',
		how_step1_desc: 'Живёт наверху. Без иконки в доке, без окон.',
		how_step2_title: 'Найди',
		how_step2_desc: 'Листай категории или ищи. π = «pi».',
		how_step3_title: 'Клик → скопировано',
		how_step3_desc: 'Один клик — в буфере. Вставляй куда хочешь.',

		feat_instant_title: 'В меню-баре',
		feat_instant_desc: 'Без дока, без окон. Кликнул, скопировал, вставил.',
		feat_symbols_title: '11 пренабранных категорий',
		feat_symbols_desc:
			'Типографика • Стрелки • Математика • Валюты • Греческий • Формы • Индексы • Рамки • Латиница • Клавиши',
		feat_custom_title: 'Под себя',
		feat_custom_desc: 'Свои категории, DnD, любые символы.',

		showcase_heading: 'Что внутри',
		typo_cat: 'Типографика',
		arrows_cat: 'Стрелки',
		math_cat: 'Математика',
		currency_cat: 'Валюты',
		greek_cat: 'Греческий',
		misc_cat: 'Клавиши',

		who_heading: 'Для кого',
		who_writers_title: 'Писатели и редакторы',
		who_writers_desc: 'Тире, кавычки-ёлочки, многоточия — нормальная типографика без Alt-кодов.',
		who_devs_title: 'Разработчики',
		who_devs_desc: '⌘ ⌥ ⇧ для доков, → для комментов, рамки для ASCII-арта.',
		who_designers_title: 'Дизайнеры',
		who_designers_desc: '© ® ™ для макетов, стрелки для схем. Прямо в Figma.',
		who_academics_title: 'Учёные',
		who_academics_desc: 'Греческий αβγ, операторы ∫∑√, индексы ²³. Без LaTeX.',

		also_heading: 'Под капотом',
		extra_theme_title: 'Тёмная и светлая',
		extra_theme_desc: 'Следует за macOS автоматически.',
		extra_search_title: 'Пиши — находи',
		extra_search_desc: '«arrow» → ← → ↑ ↓. Мгновенно.',
		extra_lang_title: '4 языка',
		extra_lang_desc: 'EN · RU · ES · JA — весь интерфейс.',
		extra_light_title: '< 10 МБ',
		extra_light_desc: 'Tauri, не Electron. Нативный WebView.',
		extra_private_title: 'Только оффлайн',
		extra_private_desc: 'Никаких аккаунтов, облака, трекинга.',
		extra_login_title: 'Автозапуск',
		extra_login_desc: 'Тихо стартует с macOS. Всегда наготове.',

		download_heading: 'Скачать',
		download_desc: 'Бесплатно и опен сорс.',
		download_macos: 'macOS',
		download_windows: 'Windows',
		download_macos_req: 'macOS 15+',
		download_windows_req: 'Windows 10+',
		dl_universal: 'Universal',
		dl_universal_desc: 'Apple Silicon + Intel',
		dl_arm: 'Apple Silicon',
		dl_arm_desc: 'Чипы M-серии',
		dl_intel: 'Intel',
		dl_intel_desc: 'x86_64',
		dl_win_x64_desc: 'Большинство ПК',
		dl_win_arm_desc: 'Snapdragon / Copilot+ PC',

		support_heading: 'Нравится? Поддержи.',
		support_desc: 'Бесплатно и опен сорс. Если сэкономило хотя бы один гугл — купи кофе.',
		buy_coffee: 'Купить кофе',
		sponsor_gh: 'Спонсор на GitHub',
		footer_built: 'Сделано на Tauri и React',

		privacy_back: '← Назад',
		privacy_title: 'Политика конфиденциальности',
		privacy_short: 'Hot Symbols ничего не собирает. Ноль. Зеро. Nada.',
		privacy_short_label: 'Коротко:',
		privacy_no_data_title: 'Никакого сбора данных',
		privacy_no_data_desc:
			'Hot Symbols не собирает, не хранит, не обрабатывает и не передаёт никаких персональных данных. Приложение работает полностью на вашем устройстве.',
		privacy_no_analytics_title: 'Никакой аналитики',
		privacy_no_analytics_desc:
			'Никакой аналитики, телеметрии, краш-репортеров или трекинга. Мы не знаем, сколько у нас пользователей, и нам это нравится.',
		privacy_no_network_title: 'Никаких сетевых запросов',
		privacy_no_network_desc:
			'Приложение работает полностью оффлайн. Никогда не подключается к интернету. Никаких API, серверов, облачной синхронизации.',
		privacy_no_accounts_title: 'Никаких аккаунтов',
		privacy_no_accounts_desc: 'Никакой регистрации, логинов, email. Скачал — пользуешься. Всё.',
		privacy_local_title: 'Только локальное хранение',
		privacy_local_desc:
			'Ваши настройки (тема, язык, категории) хранятся локально. Они никогда не покидают ваше устройство.',
		privacy_third_title: 'Третьи стороны',
		privacy_third_desc: 'Их нет. Никаких SDK, встроенных сервисов, стороннего кода.',
		privacy_updated: 'Последнее обновление: март 2026'
	},
	es: {
		nav_features: 'Funciones',
		nav_symbols: 'Símbolos',
		nav_download: 'Descargar',
		nav_support: 'Donar',

		tagline: 'Gaslight a todos de que escribes con IA.',
		subtitle: '⌘ → ± ∞ © y más desde tu barra de menú. Clic — y copiado.',
		download_cta: 'Descargar para macOS',
		download_cta_win: 'Descargar para Windows',
		search_placeholder: 'Buscar símbolos…',

		how_heading: 'Cómo funciona',
		how_step1_title: 'Clic en la barra de menú',
		how_step1_desc: 'Vive arriba. Sin icono en el Dock, sin ventanas.',
		how_step2_title: 'Encuéntralo',
		how_step2_desc: 'Explora categorías o busca. π = "pi".',
		how_step3_title: 'Clic → copiado',
		how_step3_desc: 'Un clic y está en tu portapapeles. Pégalo donde quieras.',

		feat_instant_title: 'Nativo en la barra',
		feat_instant_desc: 'Sin Dock, sin ventanas extra. Clic, toma, listo.',
		feat_symbols_title: '11 categorías predefinidas',
		feat_symbols_desc:
			'Tipografía • Flechas • Matemáticas • Monedas • Griego • Formas • Índices • Diagramas • Latín • Teclas',
		feat_custom_title: 'A tu medida',
		feat_custom_desc: 'Tus categorías, DnD, cualquier símbolo.',

		showcase_heading: 'Qué incluye',
		typo_cat: 'Tipografía',
		arrows_cat: 'Flechas',
		math_cat: 'Matemáticas',
		currency_cat: 'Monedas',
		greek_cat: 'Griego',
		misc_cat: 'Teclado',

		who_heading: 'Hecho para',
		who_writers_title: 'Escritores y editores',
		who_writers_desc: 'Rayas, comillas tipográficas, puntos suspensivos — sin códigos Alt.',
		who_devs_title: 'Desarrolladores',
		who_devs_desc: '⌘ ⌥ ⇧ para docs, → para flujos, líneas para ASCII art.',
		who_designers_title: 'Diseñadores',
		who_designers_desc: '© ® ™ para mockups, flechas para flujos. Directo a Figma.',
		who_academics_title: 'Académicos',
		who_academics_desc: 'αβγ griego, ∫∑√ operadores, ²³ superíndices. Sin LaTeX.',

		also_heading: 'Bajo el capó',
		extra_theme_title: 'Oscuro y claro',
		extra_theme_desc: 'Sigue la apariencia de macOS automáticamente.',
		extra_search_title: 'Escribe y encuentra',
		extra_search_desc: '"arrow" → ← → ↑ ↓. Instantáneo.',
		extra_lang_title: '4 idiomas',
		extra_lang_desc: 'EN · RU · ES · JA — toda la interfaz.',
		extra_light_title: '< 10 MB',
		extra_light_desc: 'Tauri, no Electron. WebView nativo.',
		extra_private_title: 'Solo offline',
		extra_private_desc: 'Sin cuentas. Sin nube. Sin rastreo.',
		extra_login_title: 'Inicia con macOS',
		extra_login_desc: 'Arranca en silencio. Siempre listo.',

		download_heading: 'Descargar',
		download_desc: 'Gratuito y código abierto.',
		download_macos: 'macOS',
		download_windows: 'Windows',
		download_macos_req: 'macOS 15+',
		download_windows_req: 'Windows 10+',
		dl_universal: 'Universal',
		dl_universal_desc: 'Apple Silicon + Intel',
		dl_arm: 'Apple Silicon',
		dl_arm_desc: 'Chips serie M',
		dl_intel: 'Intel',
		dl_intel_desc: 'x86_64',
		dl_win_x64_desc: 'La mayoría de PCs',
		dl_win_arm_desc: 'Snapdragon / Copilot+ PC',

		support_heading: '¿Te gusta? Apóyalo.',
		support_desc: 'Gratuito y abierto. Si te ahorró un solo google — invítame un café.',
		buy_coffee: 'Invítame un café',
		sponsor_gh: 'Patrocinar en GitHub',
		footer_built: 'Hecho con Tauri y React',

		privacy_back: '← Volver',
		privacy_title: 'Política de privacidad',
		privacy_short: 'Hot Symbols no recopila nada. Cero. Nada.',
		privacy_short_label: 'En resumen:',
		privacy_no_data_title: 'Sin recolección de datos',
		privacy_no_data_desc:
			'Hot Symbols no recopila, almacena, procesa ni transmite ningún dato personal. La app funciona completamente en tu dispositivo.',
		privacy_no_analytics_title: 'Sin analíticas',
		privacy_no_analytics_desc:
			'No hay analíticas, telemetría, reportes de errores ni rastreo de ningún tipo. No sabemos cuántos usuarios tenemos, y nos gusta así.',
		privacy_no_network_title: 'Sin peticiones de red',
		privacy_no_network_desc:
			'La app funciona completamente offline. Nunca se conecta a internet. Sin APIs, sin servidores, sin sincronización en la nube.',
		privacy_no_accounts_title: 'Sin cuentas',
		privacy_no_accounts_desc: 'Sin registros, sin logins, sin correos electrónicos. La descargas, la usas. Punto.',
		privacy_local_title: 'Solo almacenamiento local',
		privacy_local_desc:
			'Tus preferencias (tema, idioma, categorías) se almacenan localmente en tu máquina. Nunca salen de tu dispositivo.',
		privacy_third_title: 'Terceros',
		privacy_third_desc: 'No hay ninguno. Sin SDKs, sin servicios integrados, sin código de terceros.',
		privacy_updated: 'Última actualización: marzo 2026'
	},
	ja: {
		nav_features: '機能',
		nav_symbols: 'シンボル',
		nav_download: 'ダウンロード',
		nav_support: '寄付',

		tagline: 'AIで書いてるとみんなに思わせよう。',
		subtitle: '⌘ → ± ∞ © などメニューバーから。クリックでコピー。',
		download_cta: 'macOS版をダウンロード',
		download_cta_win: 'Windows版をダウンロード',
		search_placeholder: 'シンボルを検索…',

		how_heading: '使い方',
		how_step1_title: 'メニューバーをクリック',
		how_step1_desc: '上に常駐。Dockアイコンなし、ウィンドウなし。',
		how_step2_title: '見つける',
		how_step2_desc: 'カテゴリを閲覧または検索。π = 「pi」。',
		how_step3_title: 'クリック → コピー',
		how_step3_desc: 'ワンクリックでクリップボードへ。どこにでも貼り付け。',

		feat_instant_title: 'メニューバー常駐',
		feat_instant_desc: 'Dockなし。ウィンドウなし。クリックして取得。',
		feat_symbols_title: '11のプリセットカテゴリ',
		feat_symbols_desc: 'タイポ • 矢印 • 数学 • 通貨 • ギリシャ • 図形 • 上下付き • 罫線 • ラテン • キー',
		feat_custom_title: '自由にカスタマイズ',
		feat_custom_desc: 'カテゴリ作成、DnD、好きなシンボルを追加。',

		showcase_heading: '収録内容',
		typo_cat: 'タイポグラフィ',
		arrows_cat: '矢印',
		math_cat: '数学',
		currency_cat: '通貨',
		greek_cat: 'ギリシャ',
		misc_cat: 'キーボード',

		who_heading: 'こんな人に',
		who_writers_title: 'ライター・編集者',
		who_writers_desc: 'ダッシュ、引用符、三点リーダー——Altコード不要。',
		who_devs_title: '開発者',
		who_devs_desc: '⌘ ⌥ ⇧ ドキュメント用、→ フロー用、罫線でASCIIアート。',
		who_designers_title: 'デザイナー',
		who_designers_desc: '© ® ™ モックアップ用、矢印でフロー。Figmaに直接。',
		who_academics_title: '研究者',
		who_academics_desc: 'αβγ ギリシャ、∫∑√ 演算子、²³ 上付き。LaTeX不要。',

		also_heading: '中身の話',
		extra_theme_title: 'ダーク & ライト',
		extra_theme_desc: 'macOSの外観に自動追従。',
		extra_search_title: '打って探す',
		extra_search_desc: '「arrow」→ ← → ↑ ↓。即座に。',
		extra_lang_title: '4言語対応',
		extra_lang_desc: 'EN · RU · ES · JA — インターフェース全体。',
		extra_light_title: '10MB未満',
		extra_light_desc: 'Tauri製、Electronではない。ネイティブWebView。',
		extra_private_title: '完全オフライン',
		extra_private_desc: 'アカウント不要。クラウドなし。トラッキングなし。',
		extra_login_title: 'ログイン時起動',
		extra_login_desc: '静かに起動。いつでも準備OK。',

		download_heading: 'ダウンロード',
		download_desc: '無料・オープンソース。',
		download_macos: 'macOS',
		download_windows: 'Windows',
		download_macos_req: 'macOS 15以降',
		download_windows_req: 'Windows 10以降',
		dl_universal: 'Universal',
		dl_universal_desc: 'Apple Silicon + Intel',
		dl_arm: 'Apple Silicon',
		dl_arm_desc: 'Mシリーズ',
		dl_intel: 'Intel',
		dl_intel_desc: 'x86_64',
		dl_win_x64_desc: 'ほとんどのPC',
		dl_win_arm_desc: 'Snapdragon / Copilot+ PC',

		support_heading: '気に入った？応援しよう。',
		support_desc: '無料・オープンソース。一回でもググる手間が減ったら——コーヒーをおごってください。',
		buy_coffee: 'コーヒーをおごる',
		sponsor_gh: 'GitHubでスポンサー',
		footer_built: 'TauriとReactで構築',

		privacy_back: '← 戻る',
		privacy_title: 'プライバシーポリシー',
		privacy_short: 'Hot Symbolsは何も収集しません。ゼロです。',
		privacy_short_label: '要約:',
		privacy_no_data_title: 'データ収集なし',
		privacy_no_data_desc:
			'Hot Symbolsは個人データや利用情報を収集・保存・処理・送信しません。アプリは完全にお使いのデバイス上で動作します。',
		privacy_no_analytics_title: 'アナリティクスなし',
		privacy_no_analytics_desc:
			'アナリティクス、テレメトリー、クラッシュレポーター、トラッキングは一切ありません。ユーザー数も把握していません。',
		privacy_no_network_title: 'ネットワークリクエストなし',
		privacy_no_network_desc:
			'アプリは完全にオフラインで動作します。インターネットに接続しません。API、サーバー、クラウド同期はありません。',
		privacy_no_accounts_title: 'アカウント不要',
		privacy_no_accounts_desc: 'サインアップ、ログイン、メールアドレスは不要です。ダウンロードして使うだけ。',
		privacy_local_title: 'ローカル保存のみ',
		privacy_local_desc:
			'設定（テーマ、言語、カテゴリ）はお使いのマシンにローカル保存されます。デバイスの外に出ることはありません。',
		privacy_third_title: 'サードパーティ',
		privacy_third_desc: 'ありません。SDK、埋め込みサービス、外部コードは一切ありません。',
		privacy_updated: '最終更新: 2026年3月'
	}
};

export function t(locale: Locale, key: string): string {
	return translations[locale]?.[key] ?? translations.en[key] ?? key;
}
