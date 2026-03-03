type TranslationValue = string | ((...args: unknown[]) => string);

type TranslationRecord = Record<string, TranslationValue>;

export const translations: Record<string, TranslationRecord> = {
	en: {
		// App
		search_placeholder: 'Search characters...',
		nothing_found: 'Nothing found',
		settings: 'Settings',
		copied_char: (char) => `Copied ${char}`,

		// Settings header
		settings_title: 'Settings',
		reset_to_default: 'Reset to Default',
		save_changes: 'Save Changes',
		saved: 'Saved',

		// Settings tabs
		tab_categories: 'Categories',
		tab_appearance: 'Appearance',
		tab_system: 'System',

		// Settings empty
		no_category_selected: 'No category selected. Add one to get started.',

		// CategoryList
		delete_category: 'Delete category',
		add_category: '+ Add Category',

		// CategoryEditor
		category_name_label: 'Category Name',
		characters_count: (n) => `Characters (${n})`,
		from_presets: '+ From Presets',
		placeholder_symbol: 'Symbol',
		placeholder_name_optional: 'Name (optional)',
		placeholder_category_name: 'Category name',
		add: 'Add',

		// PresetPicker
		add_from_presets: 'Add from Presets',
		n_selected: (n) => `${n} selected`,
		cancel: 'Cancel',
		add_selected: 'Add Selected',
		already_added: 'already added',

		// ThemePicker
		theme_label: 'Theme',
		theme_auto: 'Auto',
		theme_light: 'Light',
		theme_dark: 'Dark',
		theme_auto_desc: 'Follow system appearance',
		theme_light_desc: 'Always use light theme',
		theme_dark_desc: 'Always use dark theme',

		// LanguagePicker
		language_label: 'Language',

		// AutostartToggle
		autostart_label: 'Launch at Login',

		// Category names (defaults)
		cat_arrows: 'Arrows',
		cat_math: 'Math',
		cat_currency: 'Currency',
		cat_typography: 'Typography',
		cat_checks_marks: 'Checks & Marks',
		cat_stars_shapes: 'Stars & Shapes',
		cat_greek: 'Greek',
		cat_misc: 'Misc',

		cat_sub_super: 'Subscript & Superscript',
		cat_lines_boxes: 'Lines & Boxes',
		cat_latin_ext: 'Latin Extended'
	},

	ru: {
		search_placeholder: 'Поиск символов…',
		nothing_found: 'Ничего не найдено',
		settings: 'Настройки',
		copied_char: (char) => `${char} скопирован`,

		settings_title: 'Настройки',
		reset_to_default: 'Сбросить',
		save_changes: 'Сохранить',
		saved: 'Сохранено',

		tab_categories: 'Категории',
		tab_appearance: 'Оформление',
		tab_system: 'Система',

		no_category_selected: 'Категория не выбрана. Добавьте новую.',

		delete_category: 'Удалить категорию',
		add_category: '+ Добавить',

		category_name_label: 'Название',
		characters_count: (n) => `Символы (${n})`,
		from_presets: '+ Из наборов',
		placeholder_symbol: 'Символ',
		placeholder_name_optional: 'Имя (необяз.)',
		placeholder_category_name: 'Название категории',
		add: 'Добавить',

		add_from_presets: 'Добавить из наборов',
		n_selected: (n) => `Выбрано: ${n}`,
		cancel: 'Отмена',
		add_selected: 'Добавить',
		already_added: 'уже добавлено',

		theme_label: 'Тема',
		theme_auto: 'Авто',
		theme_light: 'Светлая',
		theme_dark: 'Тёмная',
		theme_auto_desc: 'Как в системе',
		theme_light_desc: 'Всегда светлая',
		theme_dark_desc: 'Всегда тёмная',

		language_label: 'Язык',

		autostart_label: 'Запускать при входе',

		cat_arrows: 'Стрелки',
		cat_math: 'Математика',
		cat_currency: 'Валюты',
		cat_typography: 'Типографика',
		cat_checks_marks: 'Галочки и метки',
		cat_stars_shapes: 'Звёзды и фигуры',
		cat_greek: 'Греческие',
		cat_misc: 'Разное',

		cat_sub_super: 'Подстрочные и надстрочные',
		cat_lines_boxes: 'Линии и рамки',
		cat_latin_ext: 'Латиница расш.'
	},

	es: {
		search_placeholder: 'Buscar caracteres…',
		nothing_found: 'No se encontró nada',
		settings: 'Ajustes',
		copied_char: (char) => `${char} copiado`,

		settings_title: 'Ajustes',
		reset_to_default: 'Restablecer',
		save_changes: 'Guardar',
		saved: 'Guardado',

		tab_categories: 'Categorías',
		tab_appearance: 'Apariencia',
		tab_system: 'Sistema',

		no_category_selected: 'Ninguna categoría seleccionada. Añade una para empezar.',

		delete_category: 'Eliminar categoría',
		add_category: '+ Añadir',

		category_name_label: 'Nombre',
		characters_count: (n) => `Caracteres (${n})`,
		from_presets: '+ De preajustes',
		placeholder_symbol: 'Símbolo',
		placeholder_name_optional: 'Nombre (opcional)',
		placeholder_category_name: 'Nombre de categoría',
		add: 'Añadir',

		add_from_presets: 'Añadir de preajustes',
		n_selected: (n) => `${n} seleccionados`,
		cancel: 'Cancelar',
		add_selected: 'Añadir',
		already_added: 'ya añadido',

		theme_label: 'Tema',
		theme_auto: 'Auto',
		theme_light: 'Claro',
		theme_dark: 'Oscuro',
		theme_auto_desc: 'Seguir apariencia del sistema',
		theme_light_desc: 'Siempre tema claro',
		theme_dark_desc: 'Siempre tema oscuro',

		language_label: 'Idioma',

		autostart_label: 'Iniciar con el sistema',

		cat_arrows: 'Flechas',
		cat_math: 'Matemáticas',
		cat_currency: 'Monedas',
		cat_typography: 'Tipografía',
		cat_checks_marks: 'Marcas y checks',
		cat_stars_shapes: 'Estrellas y formas',
		cat_greek: 'Griego',
		cat_misc: 'Varios',

		cat_sub_super: 'Subíndices y superíndices',
		cat_lines_boxes: 'Líneas y marcos',
		cat_latin_ext: 'Latín extendido'
	},

	ja: {
		search_placeholder: '文字を検索…',
		nothing_found: '見つかりません',
		settings: '設定',
		copied_char: (char) => `${char} をコピー`,

		settings_title: '設定',
		reset_to_default: 'リセット',
		save_changes: '保存',
		saved: '保存済み',

		tab_categories: 'カテゴリー',
		tab_appearance: '外観',
		tab_system: 'システム',

		no_category_selected: 'カテゴリーが未選択です。追加してください。',

		delete_category: 'カテゴリーを削除',
		add_category: '+ 追加',

		category_name_label: 'カテゴリー名',
		characters_count: (n) => `文字 (${n})`,
		from_presets: '+ プリセットから',
		placeholder_symbol: '記号',
		placeholder_name_optional: '名前（任意）',
		placeholder_category_name: 'カテゴリー名',
		add: '追加',

		add_from_presets: 'プリセットから追加',
		n_selected: (n) => `${n}件選択`,
		cancel: 'キャンセル',
		add_selected: '追加',
		already_added: '追加済み',

		theme_label: 'テーマ',
		theme_auto: '自動',
		theme_light: 'ライト',
		theme_dark: 'ダーク',
		theme_auto_desc: 'システムの外観に合わせる',
		theme_light_desc: '常にライトテーマ',
		theme_dark_desc: '常にダークテーマ',

		language_label: '言語',

		autostart_label: 'ログイン時に起動',

		cat_arrows: '矢印',
		cat_math: '数学',
		cat_currency: '通貨',
		cat_typography: '組版',
		cat_checks_marks: 'チェックマーク',
		cat_stars_shapes: '星と図形',
		cat_greek: 'ギリシャ文字',
		cat_misc: 'その他',

		cat_sub_super: '上付き・下付き',
		cat_lines_boxes: '罫線・囲み',
		cat_latin_ext: 'ラテン拡張'
	}
};
