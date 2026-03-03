type TranslationValue = string | ((...args: unknown[]) => string);

type TranslationRecord = Record<string, TranslationValue>;

export const translations: Record<string, TranslationRecord> = {
  en: {
    // App
    search_placeholder: "Search characters...",
    nothing_found: "Nothing found",
    settings: "Settings",
    copied_char: (char) => `Copied ${char}`,

    // Settings header
    settings_title: "Settings",
    reset_to_default: "Reset to Default",
    save_changes: "Save Changes",
    saved: "Saved",

    // Settings tabs
    tab_categories: "Categories",
    tab_appearance: "Appearance",

    // Settings empty
    no_category_selected: "No category selected. Add one to get started.",

    // CategoryList
    delete_category: "Delete category",
    add_category: "+ Add Category",

    // CategoryEditor
    category_name_label: "Category Name",
    characters_count: (n) => `Characters (${n})`,
    from_presets: "+ From Presets",
    placeholder_symbol: "Symbol",
    placeholder_name_optional: "Name (optional)",
    placeholder_category_name: "Category name",
    add: "Add",

    // PresetPicker
    add_from_presets: "Add from Presets",
    n_selected: (n) => `${n} selected`,
    cancel: "Cancel",
    add_selected: "Add Selected",
    already_added: "already added",

    // ThemePicker
    theme_label: "Theme",
    theme_auto: "Auto",
    theme_light: "Light",
    theme_dark: "Dark",
    theme_auto_desc: "Follow system appearance",
    theme_light_desc: "Always use light theme",
    theme_dark_desc: "Always use dark theme",

    // LanguagePicker
    language_label: "Language",

    // AutostartToggle
    autostart_label: "Launch at Login",

    // Category names (defaults)
    cat_arrows: "Arrows",
    cat_math: "Math",
    cat_currency: "Currency",
    cat_typography: "Typography",
    cat_checks_marks: "Checks & Marks",
    cat_stars_shapes: "Stars & Shapes",
    cat_greek: "Greek",
    cat_misc: "Misc",

    cat_sub_super: "Subscript & Superscript",
    cat_lines_boxes: "Lines & Boxes",
    cat_latin_ext: "Latin Extended",
  },

  ru: {
    search_placeholder: "\u041F\u043E\u0438\u0441\u043A \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432\u2026",
    nothing_found: "\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E",
    settings: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
    copied_char: (char) => `${char} \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D`,

    settings_title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
    reset_to_default: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C",
    save_changes: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C",
    saved: "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043E",

    tab_categories: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438",
    tab_appearance: "\u041E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u0435",

    no_category_selected: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F \u043D\u0435 \u0432\u044B\u0431\u0440\u0430\u043D\u0430. \u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043D\u043E\u0432\u0443\u044E.",

    delete_category: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044E",
    add_category: "+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C",

    category_name_label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435",
    characters_count: (n) => `\u0421\u0438\u043C\u0432\u043E\u043B\u044B (${n})`,
    from_presets: "+ \u0418\u0437 \u043D\u0430\u0431\u043E\u0440\u043E\u0432",
    placeholder_symbol: "\u0421\u0438\u043C\u0432\u043E\u043B",
    placeholder_name_optional: "\u0418\u043C\u044F (\u043D\u0435\u043E\u0431\u044F\u0437.)",
    placeholder_category_name: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438",
    add: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C",

    add_from_presets: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0438\u0437 \u043D\u0430\u0431\u043E\u0440\u043E\u0432",
    n_selected: (n) => `\u0412\u044B\u0431\u0440\u0430\u043D\u043E: ${n}`,
    cancel: "\u041E\u0442\u043C\u0435\u043D\u0430",
    add_selected: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C",
    already_added: "\u0443\u0436\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E",

    theme_label: "\u0422\u0435\u043C\u0430",
    theme_auto: "\u0410\u0432\u0442\u043E",
    theme_light: "\u0421\u0432\u0435\u0442\u043B\u0430\u044F",
    theme_dark: "\u0422\u0451\u043C\u043D\u0430\u044F",
    theme_auto_desc: "\u041A\u0430\u043A \u0432 \u0441\u0438\u0441\u0442\u0435\u043C\u0435",
    theme_light_desc: "\u0412\u0441\u0435\u0433\u0434\u0430 \u0441\u0432\u0435\u0442\u043B\u0430\u044F",
    theme_dark_desc: "\u0412\u0441\u0435\u0433\u0434\u0430 \u0442\u0451\u043C\u043D\u0430\u044F",

    language_label: "\u042F\u0437\u044B\u043A",

    autostart_label: "\u0417\u0430\u043F\u0443\u0441\u043A\u0430\u0442\u044C \u043F\u0440\u0438 \u0432\u0445\u043E\u0434\u0435",

    cat_arrows: "\u0421\u0442\u0440\u0435\u043B\u043A\u0438",
    cat_math: "\u041C\u0430\u0442\u0435\u043C\u0430\u0442\u0438\u043A\u0430",
    cat_currency: "\u0412\u0430\u043B\u044E\u0442\u044B",
    cat_typography: "\u0422\u0438\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u043A\u0430",
    cat_checks_marks: "\u0413\u0430\u043B\u043E\u0447\u043A\u0438 \u0438 \u043C\u0435\u0442\u043A\u0438",
    cat_stars_shapes: "\u0417\u0432\u0451\u0437\u0434\u044B \u0438 \u0444\u0438\u0433\u0443\u0440\u044B",
    cat_greek: "\u0413\u0440\u0435\u0447\u0435\u0441\u043A\u0438\u0435",
    cat_misc: "\u0420\u0430\u0437\u043D\u043E\u0435",

    cat_sub_super: "\u041F\u043E\u0434\u0441\u0442\u0440\u043E\u0447\u043D\u044B\u0435 \u0438 \u043D\u0430\u0434\u0441\u0442\u0440\u043E\u0447\u043D\u044B\u0435",
    cat_lines_boxes: "\u041B\u0438\u043D\u0438\u0438 \u0438 \u0440\u0430\u043C\u043A\u0438",
    cat_latin_ext: "\u041B\u0430\u0442\u0438\u043D\u0438\u0446\u0430 \u0440\u0430\u0441\u0448.",
  },

  es: {
    search_placeholder: "Buscar caracteres\u2026",
    nothing_found: "No se encontr\u00F3 nada",
    settings: "Ajustes",
    copied_char: (char) => `${char} copiado`,

    settings_title: "Ajustes",
    reset_to_default: "Restablecer",
    save_changes: "Guardar",
    saved: "Guardado",

    tab_categories: "Categor\u00EDas",
    tab_appearance: "Apariencia",

    no_category_selected: "Ninguna categor\u00EDa seleccionada. A\u00F1ade una para empezar.",

    delete_category: "Eliminar categor\u00EDa",
    add_category: "+ A\u00F1adir",

    category_name_label: "Nombre",
    characters_count: (n) => `Caracteres (${n})`,
    from_presets: "+ De preajustes",
    placeholder_symbol: "S\u00EDmbolo",
    placeholder_name_optional: "Nombre (opcional)",
    placeholder_category_name: "Nombre de categor\u00EDa",
    add: "A\u00F1adir",

    add_from_presets: "A\u00F1adir de preajustes",
    n_selected: (n) => `${n} seleccionados`,
    cancel: "Cancelar",
    add_selected: "A\u00F1adir",
    already_added: "ya a\u00F1adido",

    theme_label: "Tema",
    theme_auto: "Auto",
    theme_light: "Claro",
    theme_dark: "Oscuro",
    theme_auto_desc: "Seguir apariencia del sistema",
    theme_light_desc: "Siempre tema claro",
    theme_dark_desc: "Siempre tema oscuro",

    language_label: "Idioma",

    autostart_label: "Iniciar con el sistema",

    cat_arrows: "Flechas",
    cat_math: "Matem\u00E1ticas",
    cat_currency: "Monedas",
    cat_typography: "Tipograf\u00EDa",
    cat_checks_marks: "Marcas y checks",
    cat_stars_shapes: "Estrellas y formas",
    cat_greek: "Griego",
    cat_misc: "Varios",

    cat_sub_super: "Sub\u00EDndices y super\u00EDndices",
    cat_lines_boxes: "L\u00EDneas y marcos",
    cat_latin_ext: "Lat\u00EDn extendido",
  },

  ja: {
    search_placeholder: "\u6587\u5B57\u3092\u691C\u7D22\u2026",
    nothing_found: "\u898B\u3064\u304B\u308A\u307E\u305B\u3093",
    settings: "\u8A2D\u5B9A",
    copied_char: (char) => `${char} \u3092\u30B3\u30D4\u30FC`,

    settings_title: "\u8A2D\u5B9A",
    reset_to_default: "\u30EA\u30BB\u30C3\u30C8",
    save_changes: "\u4FDD\u5B58",
    saved: "\u4FDD\u5B58\u6E08\u307F",

    tab_categories: "\u30AB\u30C6\u30B4\u30EA\u30FC",
    tab_appearance: "\u5916\u89B3",

    no_category_selected: "\u30AB\u30C6\u30B4\u30EA\u30FC\u304C\u672A\u9078\u629E\u3067\u3059\u3002\u8FFD\u52A0\u3057\u3066\u304F\u3060\u3055\u3044\u3002",

    delete_category: "\u30AB\u30C6\u30B4\u30EA\u30FC\u3092\u524A\u9664",
    add_category: "+ \u8FFD\u52A0",

    category_name_label: "\u30AB\u30C6\u30B4\u30EA\u30FC\u540D",
    characters_count: (n) => `\u6587\u5B57 (${n})`,
    from_presets: "+ \u30D7\u30EA\u30BB\u30C3\u30C8\u304B\u3089",
    placeholder_symbol: "\u8A18\u53F7",
    placeholder_name_optional: "\u540D\u524D\uFF08\u4EFB\u610F\uFF09",
    placeholder_category_name: "\u30AB\u30C6\u30B4\u30EA\u30FC\u540D",
    add: "\u8FFD\u52A0",

    add_from_presets: "\u30D7\u30EA\u30BB\u30C3\u30C8\u304B\u3089\u8FFD\u52A0",
    n_selected: (n) => `${n}\u4EF6\u9078\u629E`,
    cancel: "\u30AD\u30E3\u30F3\u30BB\u30EB",
    add_selected: "\u8FFD\u52A0",
    already_added: "\u8FFD\u52A0\u6E08\u307F",

    theme_label: "\u30C6\u30FC\u30DE",
    theme_auto: "\u81EA\u52D5",
    theme_light: "\u30E9\u30A4\u30C8",
    theme_dark: "\u30C0\u30FC\u30AF",
    theme_auto_desc: "\u30B7\u30B9\u30C6\u30E0\u306E\u5916\u89B3\u306B\u5408\u308F\u305B\u308B",
    theme_light_desc: "\u5E38\u306B\u30E9\u30A4\u30C8\u30C6\u30FC\u30DE",
    theme_dark_desc: "\u5E38\u306B\u30C0\u30FC\u30AF\u30C6\u30FC\u30DE",

    language_label: "\u8A00\u8A9E",

    autostart_label: "\u30ED\u30B0\u30A4\u30F3\u6642\u306B\u8D77\u52D5",

    cat_arrows: "\u77E2\u5370",
    cat_math: "\u6570\u5B66",
    cat_currency: "\u901A\u8CA8",
    cat_typography: "\u7D44\u7248",
    cat_checks_marks: "\u30C1\u30A7\u30C3\u30AF\u30DE\u30FC\u30AF",
    cat_stars_shapes: "\u661F\u3068\u56F3\u5F62",
    cat_greek: "\u30AE\u30EA\u30B7\u30E3\u6587\u5B57",
    cat_misc: "\u305D\u306E\u4ED6",

    cat_sub_super: "\u4E0A\u4ED8\u304D\u30FB\u4E0B\u4ED8\u304D",
    cat_lines_boxes: "\u7F6B\u7DDA\u30FB\u56F2\u307F",
    cat_latin_ext: "\u30E9\u30C6\u30F3\u62E1\u5F35",
  },
};
