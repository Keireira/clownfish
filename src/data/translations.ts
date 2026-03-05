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
		undo: 'Undo',

		// Settings tabs
		tab_categories: 'Categories',
		tab_appearance: 'Appearance',
		tab_system: 'System',

		// Shortcuts sidebar sections
		section_settings: 'Settings',
		section_shortcuts: 'Shortcuts',
		section_apps: 'Apps',

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

		no_characters: 'No characters yet. Add one or use presets.',

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

		// Text Expansion
		tab_shortcuts: 'Shortcuts',
		expansion_enabled_label: 'Text Expansion',
		shortcut_trigger_placeholder: 'trigger',
		shortcut_expansion_placeholder: 'Expansion text',
		shortcuts_count: (n: unknown) => `Shortcuts (${n})`,
		no_shortcuts: 'No shortcuts yet. Add one to get started.',
		duplicate_trigger: 'This trigger already exists',
		hints_position_label: 'Hints Position',
		trigger_char_label: 'Trigger Character',
		unicode_hints_label: 'Unicode Lookup (\\uXXXX)',
		hints_caret: 'Near cursor',
		hints_corner: 'Bottom-right corner',
		hints_off: 'Disabled',
		stoplist_label: 'Per-App Settings',
		stoplist_expansion: 'Expansion',
		stoplist_hints: 'Hints',
		stoplist_hints_position: 'Hints position',
		stoplist_empty: 'No per-app settings',
		stoplist_add_app: 'Add app',
		stoplist_no_apps: 'No running apps found',
		stoplist_search_placeholder: 'Search apps...',
		stoplist_drop_hint: 'Drop .exe or shortcut here',
		stoplist_direction: 'Direction',
		stoplist_offset: 'Offset (px)',
		stoplist_select_app: 'Select an app',

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
		cat_latin_ext: 'Latin Extended',

		// TriggerPrompt
		enter_trigger: 'Add Shortcut',
		trigger_keyword_placeholder: 'keyword',
		trigger_exists: 'This trigger already exists',
		shortcut_added: 'Shortcut added',
		right_click_shortcut: 'Right-click → shortcut'
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
		undo: 'Отменить',

		tab_categories: 'Категории',
		tab_appearance: 'Оформление',
		tab_system: 'Система',

		section_settings: 'Настройки',
		section_shortcuts: 'Автозамена',
		section_apps: 'Приложения',

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

		no_characters: 'Нет символов. Добавьте или используйте наборы.',

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

		tab_shortcuts: 'Автозамена',
		expansion_enabled_label: 'Автозамена текста',
		shortcut_trigger_placeholder: 'триггер',
		shortcut_expansion_placeholder: 'Текст замены',
		shortcuts_count: (n: unknown) => `Замены (${n})`,
		no_shortcuts: 'Нет замен. Добавьте первую.',
		duplicate_trigger: 'Такой триггер уже существует',
		hints_position_label: 'Подсказки',
		trigger_char_label: 'Символ-разделитель',
		unicode_hints_label: 'Поиск по коду (\\uXXXX)',
		hints_caret: 'У курсора',
		hints_corner: 'В углу экрана',
		hints_off: 'Выключены',
		stoplist_label: 'Настройки приложений',
		stoplist_expansion: 'Замена',
		stoplist_hints: 'Подсказки',
		stoplist_hints_position: 'Позиция подсказок',
		stoplist_empty: 'Нет настроек приложений',
		stoplist_add_app: 'Добавить',
		stoplist_no_apps: 'Нет запущенных приложений',
		stoplist_search_placeholder: 'Поиск приложений...',
		stoplist_drop_hint: 'Перетащите .exe или ярлык сюда',
		stoplist_direction: 'Направление',
		stoplist_offset: 'Смещение (пикс.)',
		stoplist_select_app: 'Выберите приложение',

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
		cat_latin_ext: 'Латиница расш.',

		enter_trigger: 'Новая автозамена',
		trigger_keyword_placeholder: 'ключевое слово',
		trigger_exists: 'Такой триггер уже существует',
		shortcut_added: 'Автозамена добавлена',
		right_click_shortcut: 'ПКМ → автозамена'
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

		section_settings: 'Ajustes',
		section_shortcuts: 'Atajos',
		section_apps: 'Apps',

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

		no_characters: 'Sin caracteres. Añade uno o usa preajustes.',

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

		tab_shortcuts: 'Atajos',
		expansion_enabled_label: 'Expansión de texto',
		shortcut_trigger_placeholder: 'atajo',
		shortcut_expansion_placeholder: 'Texto de expansión',
		shortcuts_count: (n: unknown) => `Atajos (${n})`,
		no_shortcuts: 'No hay atajos. Añade uno para empezar.',
		duplicate_trigger: 'Este atajo ya existe',
		hints_position_label: 'Posición de sugerencias',
		trigger_char_label: 'Carácter disparador',
		unicode_hints_label: 'Búsqueda Unicode (\\uXXXX)',
		hints_caret: 'Cerca del cursor',
		hints_corner: 'Esquina inferior derecha',
		hints_off: 'Desactivado',
		stoplist_label: 'Ajustes por app',
		stoplist_expansion: 'Expansión',
		stoplist_hints: 'Sugerencias',
		stoplist_hints_position: 'Posición de sugerencias',
		stoplist_empty: 'Sin ajustes por app',
		stoplist_add_app: 'Añadir app',
		stoplist_no_apps: 'No se encontraron apps',
		stoplist_search_placeholder: 'Buscar apps...',
		stoplist_drop_hint: 'Suelta .exe o acceso directo aquí',
		stoplist_direction: 'Dirección',
		stoplist_offset: 'Desplazamiento (px)',
		stoplist_select_app: 'Selecciona una app',

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
		cat_latin_ext: 'Latín extendido',

		enter_trigger: 'Añadir atajo',
		trigger_keyword_placeholder: 'palabra clave',
		trigger_exists: 'Este atajo ya existe',
		shortcut_added: 'Atajo añadido',
		right_click_shortcut: 'Clic derecho → atajo'
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

		section_settings: '設定',
		section_shortcuts: 'ショートカット',
		section_apps: 'アプリ',

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

		no_characters: '文字がありません。追加するかプリセットを使用してください。',

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

		tab_shortcuts: 'ショートカット',
		expansion_enabled_label: 'テキスト展開',
		shortcut_trigger_placeholder: 'トリガー',
		shortcut_expansion_placeholder: '展開テキスト',
		shortcuts_count: (n: unknown) => `ショートカット (${n})`,
		no_shortcuts: 'ショートカットがありません。追加してください。',
		duplicate_trigger: 'このトリガーは既に存在します',
		hints_position_label: 'ヒント位置',
		trigger_char_label: 'トリガー文字',
		unicode_hints_label: 'Unicode検索 (\\uXXXX)',
		hints_caret: 'カーソル付近',
		hints_corner: '右下コーナー',
		hints_off: '無効',
		stoplist_label: 'アプリ別設定',
		stoplist_expansion: '展開',
		stoplist_hints: 'ヒント',
		stoplist_hints_position: 'ヒント位置',
		stoplist_empty: 'アプリ別設定なし',
		stoplist_add_app: 'アプリ追加',
		stoplist_no_apps: '実行中のアプリなし',
		stoplist_search_placeholder: 'アプリを検索...',
		stoplist_drop_hint: '.exe またはショートカットをドロップ',
		stoplist_direction: '方向',
		stoplist_offset: 'オフセット (px)',
		stoplist_select_app: 'アプリを選択',

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
		cat_latin_ext: 'ラテン拡張',

		enter_trigger: 'ショートカット追加',
		trigger_keyword_placeholder: 'キーワード',
		trigger_exists: 'このトリガーは既に存在します',
		shortcut_added: 'ショートカットを追加しました',
		right_click_shortcut: '右クリック → ショートカット'
	}
};
