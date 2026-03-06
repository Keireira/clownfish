//! Global text expansion engine.
//!
//! Listens to all keystrokes system-wide via a low-level keyboard hook,
//! matches typed text against user-defined triggers (e.g. `:arrow:`),
//! and replaces them with expansion text (e.g. `→`).

use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{LazyLock, Mutex, OnceLock};
use std::time::Duration;

#[cfg(not(target_os = "windows"))]
use rdev::{Event, EventType, Key};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/// A single trigger → expansion mapping.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Shortcut {
    pub trigger: String,
    pub expansion: String,
    #[serde(default)]
    pub variables: HashMap<String, String>,
    #[serde(default)]
    pub plugin_id: String,
}

/// A single autocorrect rule: pattern → replacement.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AutoCorrectRule {
    pub pattern: String,
    pub replacement: String,
}

/// Per-app pixel offsets for hints positioning.
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct HintsOffset {
    #[serde(default)]
    pub top: i32,
    #[serde(default)]
    pub bottom: i32,
    #[serde(default)]
    pub left: i32,
    #[serde(default)]
    pub right: i32,
}

fn default_direction() -> String {
    "auto".to_string()
}

/// Per-application override: which features are disabled + hints placement.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct StopListEntry {
    pub exe: String,
    pub expansion: bool,
    pub hints: bool,
    /// Compass direction: "auto","NW","N","NE","W","E","SW","S","SE".
    #[serde(default = "default_direction")]
    pub direction: String,
    /// Custom pixel offsets from the computed position.
    #[serde(default)]
    pub offset: HintsOffset,
    /// Whether autocorrect is active for this app (default true).
    #[serde(default = "default_true")]
    pub autocorrect: bool,
    /// Extra per-app autocorrect rules (added on top of global rules).
    #[serde(default)]
    pub autocorrect_rules: Vec<AutoCorrectRule>,
    /// Per-app plugin overrides: plugin_id → enabled.
    /// Overrides the global enabled/disabled state for this app.
    #[serde(default)]
    pub plugin_overrides: HashMap<String, bool>,
}

fn default_true() -> bool {
    true
}

/// Screen-space caret rectangle in physical pixels.
#[derive(Clone, Copy, Debug)]
pub struct CaretRect {
    pub left: i32,
    pub top: i32,
    pub right: i32,
    pub bottom: i32,
}

/// Resolved per-app configuration (from STOP_LIST).
#[derive(Clone, Debug)]
struct AppConfig {
    expansion: bool,
    hints: bool,
    direction: String,
    offset: HintsOffset,
    autocorrect: bool,
    autocorrect_rules: Vec<(String, String)>,
    plugin_overrides: HashMap<String, bool>,
}

/// Data stored per-shortcut in the internal lookup map.
#[derive(Clone, Debug)]
struct ShortcutData {
    expansion: String,
    variables: HashMap<String, String>,
    plugin_id: String,
}

/// Internal state shared between the listener thread and Tauri commands.
struct ExpanderState {
    /// Ring buffer of recently typed characters.
    buffer: String,
    /// Maximum buffer capacity.
    max_buffer: usize,
    /// Active shortcuts keyed by trigger for fast lookup.
    shortcuts: HashMap<String, ShortcutData>,
}

// ---------------------------------------------------------------------------
// Global state
// ---------------------------------------------------------------------------

/// Whether text expansion is enabled.
static ENABLED: AtomicBool = AtomicBool::new(false);

/// Suppression flag – set while we simulate keystrokes to prevent re-entry.
static SUPPRESSING: AtomicBool = AtomicBool::new(false);

/// Hints position mode: 0 = caret, 1 = corner, 2 = off.
static HINTS_MODE: std::sync::atomic::AtomicU8 = std::sync::atomic::AtomicU8::new(0);

/// Whether Unicode code-point hints (\uXXXX) are enabled.
static UNICODE_HINTS: AtomicBool = AtomicBool::new(false);

/// Currently visible hints (stored so keyboard navigation can reference them).
static ACTIVE_HINTS: LazyLock<Mutex<Vec<Shortcut>>> = LazyLock::new(|| Mutex::new(Vec::new()));

/// Selected hint index (-1 = none).
static HINT_SELECTED: std::sync::atomic::AtomicI8 = std::sync::atomic::AtomicI8::new(-1);

/// Per-app stop-list: exe name (lowercase) → full app config.
static STOP_LIST: LazyLock<Mutex<HashMap<String, AppConfig>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

static STATE: LazyLock<Mutex<ExpanderState>> = LazyLock::new(|| {
    Mutex::new(ExpanderState {
        buffer: String::with_capacity(128),
        max_buffer: 100,
        shortcuts: HashMap::new(),
    })
});

/// Configurable trigger character (default `\`).
static TRIGGER_CHAR: LazyLock<Mutex<char>> = LazyLock::new(|| Mutex::new('\\'));

/// Globally disabled plugin IDs.
static DISABLED_PLUGINS: LazyLock<Mutex<Vec<String>>> =
    LazyLock::new(|| Mutex::new(Vec::new()));

/// Whether standalone `{{var}}` expansion is globally enabled.
static VARIABLES_ENABLED: AtomicBool = AtomicBool::new(false);

/// Whether autocorrect is globally enabled.
static AUTOCORRECT_ENABLED: AtomicBool = AtomicBool::new(false);

/// Active autocorrect rules: (pattern, replacement).
static AUTOCORRECT_RULES: LazyLock<Mutex<Vec<(String, String)>>> =
    LazyLock::new(|| Mutex::new(Vec::new()));

/// Returns the current trigger character.
fn trigger_char() -> char {
    *TRIGGER_CHAR.lock().unwrap()
}

/// Updates the trigger character at runtime.
pub fn set_trigger_char(ch: char) {
    *TRIGGER_CHAR.lock().unwrap() = ch;
}

/// Stored app handle for emitting events from the listener thread.
static APP_HANDLE: OnceLock<AppHandle> = OnceLock::new();

// ---------------------------------------------------------------------------
// Public API (called from lib.rs setup)
// ---------------------------------------------------------------------------

/// Spawns a background thread that globally hooks keyboard events.
///
/// On Windows: uses a direct `WH_KEYBOARD_LL` hook (no rdev) so we can call
/// `ToUnicode` with the `0x4` flag that prevents dead-key state corruption
/// (the root cause of the phantom characters produced by rdev's hook).
///
/// On other platforms: uses `rdev::grab` to consume keystrokes.
#[cfg(target_os = "windows")]
pub fn start_listener(app: &AppHandle) {
    let _ = APP_HANDLE.set(app.clone());
    std::thread::spawn(|| unsafe { run_win_hook() });
}

#[cfg(not(target_os = "windows"))]
pub fn start_listener(app: &AppHandle) {
    let _ = APP_HANDLE.set(app.clone());
    std::thread::spawn(|| {
        if let Err(e) = rdev::grab(on_rdev_event) {
            eprintln!("[text_expand] grab error: {:?}", e);
        }
    });
}

/// Replaces the current set of shortcuts.
pub fn update_shortcuts(shortcuts: Vec<Shortcut>) {
    let mut state = STATE.lock().unwrap();
    state.shortcuts.clear();
    for s in shortcuts {
        state.shortcuts.insert(
            s.trigger,
            ShortcutData {
                expansion: s.expansion,
                variables: s.variables,
                plugin_id: s.plugin_id,
            },
        );
    }
}

pub fn set_enabled(enabled: bool) {
    ENABLED.store(enabled, Ordering::Relaxed);
}

pub fn is_enabled() -> bool {
    ENABLED.load(Ordering::Relaxed)
}

// ---------------------------------------------------------------------------
// Tauri commands
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn expansion_set_enabled(enabled: bool) {
    set_enabled(enabled);
}

#[tauri::command]
pub fn expansion_is_enabled() -> bool {
    is_enabled()
}

#[tauri::command]
pub fn expansion_update_shortcuts(shortcuts: Vec<Shortcut>) {
    update_shortcuts(shortcuts);
}

/// Sets the hints display mode: "caret", "corner", or "off".
#[tauri::command]
pub fn expansion_set_hints_mode(mode: String) {
    let val = match mode.as_str() {
        "corner" => 1,
        "off" => 2,
        _ => 0, // "caret"
    };
    HINTS_MODE.store(val, Ordering::Relaxed);
}

/// Enables or disables Unicode code-point hints.
#[tauri::command]
pub fn expansion_set_unicode_hints(enabled: bool) {
    UNICODE_HINTS.store(enabled, Ordering::Relaxed);
}

#[tauri::command]
pub fn expansion_is_unicode_hints() -> bool {
    UNICODE_HINTS.load(Ordering::Relaxed)
}

/// Updates the per-app stop-list.
#[tauri::command]
pub fn expansion_update_stoplist(entries: Vec<StopListEntry>) {
    let mut map = STOP_LIST.lock().unwrap();
    map.clear();
    for e in entries {
        let app_rules: Vec<(String, String)> = e
            .autocorrect_rules
            .iter()
            .map(|r| (r.pattern.clone(), r.replacement.clone()))
            .collect();
        map.insert(
            e.exe.to_lowercase(),
            AppConfig {
                expansion: e.expansion,
                hints: e.hints,
                direction: e.direction,
                offset: e.offset,
                autocorrect: e.autocorrect,
                autocorrect_rules: app_rules,
                plugin_overrides: e.plugin_overrides,
            },
        );
    }
}

/// Updates the set of globally-disabled plugin IDs.
#[tauri::command]
pub fn expansion_update_disabled_plugins(ids: Vec<String>) {
    let mut list = DISABLED_PLUGINS.lock().unwrap();
    *list = ids;
}

/// Computes the effective set of disabled plugin IDs for a given app,
/// combining the global disabled list with per-app overrides.
fn effective_disabled_plugins(overrides: &HashMap<String, bool>) -> Vec<String> {
    let global = DISABLED_PLUGINS.lock().unwrap();
    let mut disabled = Vec::new();
    // Globally disabled, unless per-app override enables it.
    for id in global.iter() {
        if !overrides.get(id).copied().unwrap_or(false) {
            disabled.push(id.clone());
        }
    }
    // Globally enabled, but per-app override disables it.
    for (id, &enabled) in overrides {
        if !enabled && !global.contains(id) {
            disabled.push(id.clone());
        }
    }
    disabled
}

/// Sets the trigger character used to delimit shortcuts.
#[tauri::command]
pub fn expansion_set_trigger_char(ch: String) {
    if let Some(c) = ch.chars().next() {
        set_trigger_char(c);
    }
}

/// Returns a list of currently running applications (visible windows).
#[tauri::command]
pub fn expansion_list_running_apps() -> Vec<RunningApp> {
    list_running_apps()
}

/// Resolves a dropped file path to an exe filename.
/// Handles `.exe` directly and `.lnk` shortcuts (Windows).
#[tauri::command]
pub fn expansion_resolve_exe(path: String) -> Option<String> {
    resolve_exe_path(&path)
}

/// Applies a hint: deletes the partial prefix from the buffer and inserts the expansion.
#[tauri::command]
pub fn expansion_apply_hint(expansion: String, variables: Option<HashMap<String, String>>) {
    let mut state = STATE.lock().unwrap();
    // Find the partial prefix length (e.g. `:xxx` without closing `:`).
    let tc = trigger_char();
    let prefix_len = if let Some(pos) = state.buffer.rfind(tc) {
        state.buffer[pos..].chars().count()
    } else {
        0
    };
    state.buffer.clear();
    drop(state);

    if prefix_len == 0 {
        return;
    }

    clear_hints();

    record_expansion_stat(expansion.clone());
    if let Some(app) = APP_HANDLE.get() {
        let _ = app.emit("expansion-used", &expansion);
    }

    let vars = variables.unwrap_or_default();
    let resolved = resolve_expansion(&expansion, &vars);
    SUPPRESSING.store(true, Ordering::SeqCst);
    std::thread::spawn(move || {
        perform_replacement(prefix_len, &resolved);
        SUPPRESSING.store(false, Ordering::SeqCst);
    });
}

// ---------------------------------------------------------------------------
// Keyboard hook callback
// ---------------------------------------------------------------------------

/// Non-Windows keyboard hook callback via rdev::grab.
#[cfg(not(target_os = "windows"))]
fn on_rdev_event(event: Event) -> Option<Event> {
    // Always pass through our own simulated keystrokes.
    if SUPPRESSING.load(Ordering::SeqCst) {
        return Some(event);
    }
    if !ENABLED.load(Ordering::Relaxed) {
        return Some(event);
    }

    // Check per-app stop-list.
    let app_cfg = get_app_config();
    let (app_expansion, app_hints) = (app_cfg.expansion, app_cfg.hints);
    let app_autocorrect = app_cfg.autocorrect && AUTOCORRECT_ENABLED.load(Ordering::Relaxed);
    if !app_expansion && !app_hints && !app_autocorrect {
        return Some(event);
    }
    let disabled = effective_disabled_plugins(&app_cfg.plugin_overrides);

    if let EventType::KeyPress(key) = event.event_type {
        let hints_active = {
            let h = ACTIVE_HINTS.lock().unwrap();
            !h.is_empty()
        };

        // When hints are visible, intercept navigation keys and *consume* them.
        if hints_active {
            match key {
                Key::RightArrow | Key::DownArrow => {
                    let count = ACTIVE_HINTS.lock().unwrap().len() as i8;
                    let sel = HINT_SELECTED.load(Ordering::Relaxed);
                    let next = if sel < 0 || sel >= count - 1 {
                        0
                    } else {
                        sel + 1
                    };
                    HINT_SELECTED.store(next, Ordering::Relaxed);
                    reemit_hints();
                    return None; // consume
                }
                Key::LeftArrow | Key::UpArrow => {
                    let count = ACTIVE_HINTS.lock().unwrap().len() as i8;
                    let sel = HINT_SELECTED.load(Ordering::Relaxed);
                    let next = if sel <= 0 { count - 1 } else { sel - 1 };
                    HINT_SELECTED.store(next, Ordering::Relaxed);
                    reemit_hints();
                    return None; // consume
                }
                Key::Return | Key::Tab => {
                    let sel = HINT_SELECTED.load(Ordering::Relaxed);
                    if sel >= 0 {
                        let hints = ACTIVE_HINTS.lock().unwrap();
                        if let Some(hint) = hints.get(sel as usize) {
                            let resolved = resolve_expansion(&hint.expansion, &hint.variables);
                            drop(hints);
                            let tc = trigger_char();
                            let mut state = STATE.lock().unwrap();
                            let prefix_len = if let Some(pos) = state.buffer.rfind(tc) {
                                state.buffer[pos..].chars().count()
                            } else {
                                0
                            };
                            state.buffer.clear();
                            drop(state);
                            clear_hints();
                            if prefix_len > 0 {
                                SUPPRESSING.store(true, Ordering::SeqCst);
                                std::thread::spawn(move || {
                                    perform_replacement(prefix_len, &resolved);
                                    SUPPRESSING.store(false, Ordering::SeqCst);
                                });
                            }
                            return None; // consume — don't send Enter/Tab to the app
                        }
                    }
                    // No selection — fall through.
                }
                Key::Escape => {
                    let mut state = STATE.lock().unwrap();
                    state.buffer.clear();
                    drop(state);
                    clear_hints();
                    return None; // consume
                }
                _ => {}
            }
        }

        // Backspace: pop one character and recalculate hints.
        if key == Key::Backspace {
            let mut state = STATE.lock().unwrap();
            state.buffer.pop();
            if app_hints && !state.buffer.is_empty() {
                let hints = find_hints(&state, &disabled);
                drop(state);
                show_hints(hints);
            } else {
                drop(state);
                clear_hints();
            }
        } else if is_buffer_reset_key(key) {
            let mut state = STATE.lock().unwrap();
            state.buffer.clear();
            drop(state);
            clear_hints();
        } else if let Some(ch) = event_to_char(&event) {
            let mut state = STATE.lock().unwrap();
            state.buffer.push(ch);

            if state.buffer.chars().count() > state.max_buffer {
                let excess = state.buffer.chars().count() - state.max_buffer;
                let byte_off = state
                    .buffer
                    .char_indices()
                    .nth(excess)
                    .map_or(state.buffer.len(), |(i, _)| i);
                state.buffer.drain(..byte_off);
            }

            if app_expansion {
                let fire = match find_match(&state, &disabled) {
                    MatchResult::Fire(len, data) => {
                        let resolved = resolve_expansion(&data.expansion, &data.variables);
                        Some((len, data.expansion.clone(), resolved))
                    }
                    MatchResult::FireWithOverflow(len, data, overflow) => {
                        let resolved = resolve_expansion(&data.expansion, &data.variables);
                        Some((len, data.expansion.clone(), format!("{}{}", resolved, overflow)))
                    }
                    MatchResult::Pending => None,
                };
                if let Some((trigger_len, expansion_str, resolved)) = fire {
                    state.buffer.clear();
                    drop(state);
                    clear_hints();

                    record_expansion_stat(expansion_str.clone());
                    if let Some(app) = APP_HANDLE.get() {
                        let _ = app.emit("expansion-used", &expansion_str);
                    }

                    SUPPRESSING.store(true, Ordering::SeqCst);
                    std::thread::spawn(move || {
                        perform_replacement(trigger_len, &resolved);
                        SUPPRESSING.store(false, Ordering::SeqCst);
                    });
                    return Some(event);
                }
            }

            if app_autocorrect {
                if let Some((trigger_len, replacement)) =
                    find_autocorrect(&state, &app_cfg.autocorrect_rules)
                {
                    state.buffer.clear();
                    drop(state);
                    clear_hints();
                    SUPPRESSING.store(true, Ordering::SeqCst);
                    std::thread::spawn(move || {
                        perform_replacement(trigger_len, &replacement);
                        SUPPRESSING.store(false, Ordering::SeqCst);
                    });
                    return Some(event);
                }
            }

            if VARIABLES_ENABLED.load(Ordering::Relaxed) {
                if let Some((var_len, resolved)) = find_standalone_variable(&state) {
                    state.buffer.clear();
                    drop(state);
                    clear_hints();
                    SUPPRESSING.store(true, Ordering::SeqCst);
                    std::thread::spawn(move || {
                        perform_replacement(var_len, &resolved);
                        SUPPRESSING.store(false, Ordering::SeqCst);
                    });
                    return Some(event);
                }
            }

            if app_hints {
                let hints = find_hints(&state, &disabled);
                drop(state);
                show_hints(hints);
            } else {
                drop(state);
                clear_hints();
            }
        }
    }

    Some(event) // pass through by default
}

#[cfg(not(target_os = "windows"))]
fn event_to_char(event: &Event) -> Option<char> {
    event.name.as_ref().and_then(|s| {
        let mut chars = s.chars();
        let ch = chars.next()?;
        if chars.next().is_some() {
            return None; // multi-char name
        }
        if ch.is_control() {
            return None; // reject \u{8} etc.
        }
        Some(ch)
    })
}

#[cfg(not(target_os = "windows"))]
fn is_buffer_reset_key(key: Key) -> bool {
    matches!(
        key,
        Key::Return
            | Key::Tab
            | Key::Escape
            | Key::UpArrow
            | Key::DownArrow
            | Key::LeftArrow
            | Key::RightArrow
            | Key::Home
            | Key::End
            | Key::PageUp
            | Key::PageDown
            | Key::Delete
    )
}

/// Resolves `{{...}}` template variables in an expansion string.
///
/// - `{{name}}` → looked up in `variables` map
/// - `{{date}}` → current date (YYYY-MM-DD)
/// - `{{time}}` → current time (HH:MM)
/// - `{{random:N}}` → N random alphanumeric characters
/// - Unknown `{{...}}` with no matching variable → left as-is
fn resolve_expansion(expansion: &str, variables: &HashMap<String, String>) -> String {
    // Fast path: no templates at all.
    if !expansion.contains("{{") {
        return expansion.to_string();
    }

    let mut result = String::with_capacity(expansion.len());
    let mut rest = expansion;

    while let Some(start) = rest.find("{{") {
        result.push_str(&rest[..start]);
        let after_open = &rest[start + 2..];
        if let Some(end) = after_open.find("}}") {
            let key = &after_open[..end];
            let replacement = resolve_variable(key, variables);
            result.push_str(&replacement);
            rest = &after_open[end + 2..];
        } else {
            // No closing `}}` — push the rest as-is.
            result.push_str(&rest[start..]);
            rest = "";
            break;
        }
    }
    result.push_str(rest);
    result
}

/// Resolves a single template variable name to its value.
fn resolve_variable(key: &str, variables: &HashMap<String, String>) -> String {
    // Plain date / date with offset / date with format
    if key == "date"
        || key.starts_with("date+")
        || key.starts_with("date-")
        || key.starts_with("date:")
    {
        return resolve_date(key);
    }
    // Plain time / time with offset / time with format
    if key == "time"
        || key.starts_with("time+")
        || key.starts_with("time-")
        || key.starts_with("time:")
    {
        return resolve_time(key);
    }
    if key.starts_with("random:") {
        let n: usize = key[7..].parse().unwrap_or(6);
        let n = n.min(64); // cap at 64 chars
        use std::collections::hash_map::RandomState;
        use std::hash::{BuildHasher, Hasher};
        let chars: &[u8] = b"abcdefghijklmnopqrstuvwxyz0123456789";
        let rs = RandomState::new();
        let mut out = String::with_capacity(n);
        for i in 0..n {
            let mut hasher = rs.build_hasher();
            hasher.write_usize(i);
            let idx = (hasher.finish() as usize) % chars.len();
            out.push(chars[idx] as char);
        }
        return out;
    }
    // User-defined variable lookup.
    if let Some(val) = variables.get(key) {
        val.clone()
    } else {
        // Unknown — leave as-is.
        format!("{{{{{}}}}}", key)
    }
}

/// Splits `"date+7d:DD.MM.YYYY"` into `("date+7d", Some("DD.MM.YYYY"))`.
/// The first `:` after the keyword (and optional offset) is the separator.
fn split_format<'a>(key: &'a str, prefix: &str) -> (&'a str, Option<&'a str>) {
    let after = &key[prefix.len()..];
    if let Some(colon) = after.find(':') {
        let base_end = prefix.len() + colon;
        (&key[..base_end], Some(&key[base_end + 1..]))
    } else {
        (key, None)
    }
}

/// Converts a Luxon/moment.js-style format string to a chrono strftime string.
///
/// Tokens (longest match wins):
///   YYYY/yyyy→%Y  YY/yy→%y  MMMM→%B  MMM→%b  MM→%m  M→%-m
///   dddd→%A  ddd→%a  DD/dd→%d  D/d→%-d
///   HH→%H  H→%-H  hh→%I  h→%-I  mm→%M  ss→%S  s→%-S  A/a→%p
///
/// Literal text: wrap in single quotes, e.g. `DD 'of' MMMM`.
fn moment_to_strftime(fmt: &str) -> String {
    // Token table, ordered longest-first per starting character.
    const TOKENS: &[(&str, &str)] = &[
        ("YYYY", "%Y"), ("yyyy", "%Y"),
        ("MMMM", "%B"),
        ("EEEE", "%A"), ("dddd", "%A"),
        ("MMM",  "%b"),
        ("EEE",  "%a"), ("ddd",  "%a"),
        ("YY", "%y"), ("yy", "%y"),
        ("MM", "%m"), ("DD", "%d"), ("dd", "%d"),
        ("HH", "%H"), ("hh", "%I"),
        ("mm", "%M"), ("ss", "%S"),
        ("M", "%-m"), ("D", "%-d"), ("d", "%-d"),
        ("H", "%-H"), ("h", "%-I"),
        ("m", "%-M"), ("s", "%-S"),
        ("A", "%p"),  ("a", "%p"),
    ];

    let mut result = String::with_capacity(fmt.len() * 2);
    let mut i = 0;
    while i < fmt.len() {
        // Single-quote escape: 'literal text'
        if fmt.as_bytes()[i] == b'\'' {
            i += 1;
            while i < fmt.len() {
                let ch = fmt[i..].chars().next().unwrap();
                if ch == '\'' { i += 1; break; }
                if ch == '%' { result.push('%'); } // escape for strftime
                result.push(ch);
                i += ch.len_utf8();
            }
            continue;
        }
        // Escape raw `%` for strftime.
        if fmt.as_bytes()[i] == b'%' {
            result.push_str("%%");
            i += 1;
            continue;
        }
        let rest = &fmt[i..];
        let mut matched = false;
        for &(token, replacement) in TOKENS {
            if rest.starts_with(token) {
                result.push_str(replacement);
                i += token.len();
                matched = true;
                break;
            }
        }
        if !matched {
            let ch = rest.chars().next().unwrap();
            result.push(ch);
            i += ch.len_utf8();
        }
    }
    result
}

/// Resolves `date`, `date+7d`, `date:DD.MM.YYYY`, `date-1m:DD/MM`, etc.
/// Units: d=days, w=weeks, m=months, y=years.
/// Format uses Luxon/moment.js tokens.
fn resolve_date(key: &str) -> String {
    use chrono::{Datelike, Local, NaiveDate};

    let (base, user_fmt) = split_format(key, "date");
    // In date context, mm (minutes) doesn't make sense — treat as MM (month)
    let fmt = match user_fmt {
        Some(f) => moment_to_strftime(&f.replace("mm", "MM")),
        None => "%Y-%m-%d".to_string(),
    };

    let now = Local::now().date_naive();
    let date = if base == "date" {
        now
    } else {
        let (sign, rest) = if base.starts_with("date+") {
            (1i32, &base[5..])
        } else {
            (-1i32, &base[5..])
        };
        if let Some((n, unit)) = parse_offset(rest) {
            let n = n as i32 * sign;
            match unit {
                'd' => now + chrono::Duration::days(n as i64),
                'w' => now + chrono::Duration::weeks(n as i64),
                'm' => add_months(now, n),
                'y' => {
                    let target_year = now.year() + n;
                    NaiveDate::from_ymd_opt(target_year, now.month(), now.day())
                        .or_else(|| NaiveDate::from_ymd_opt(target_year, now.month(), now.day() - 1))
                        .unwrap_or(now)
                }
                _ => now,
            }
        } else {
            now
        }
    };
    use std::fmt::Write;
    let mut out = String::new();
    if write!(out, "{}", date.format(&fmt)).is_err() {
        // User format produced an invalid strftime string — fall back to manual ISO.
        out.clear();
        use chrono::Datelike as _;
        let _ = write!(out, "{}-{:02}-{:02}", date.year(), date.month(), date.day());
    }
    out
}

/// Resolves `time`, `time+2h`, `time:HH:mm:ss`, `time-30m:hh:mm A`, etc.
/// Units: h=hours, m=minutes, s=seconds.
/// Format uses Luxon/moment.js tokens.
fn resolve_time(key: &str) -> String {
    use chrono::Local;

    let (base, user_fmt) = split_format(key, "time");
    // In time context, MM (month) doesn't make sense — treat as mm (minutes)
    let fmt = match user_fmt {
        Some(f) => moment_to_strftime(&f.replace("MM", "mm")),
        None => "%H:%M".to_string(),
    };

    let now = Local::now();
    let dt = if base == "time" {
        now
    } else {
        let (sign, rest) = if base.starts_with("time+") {
            (1i64, &base[5..])
        } else {
            (-1i64, &base[5..])
        };
        if let Some((n, unit)) = parse_offset(rest) {
            let n = n as i64 * sign;
            match unit {
                'h' => now + chrono::Duration::hours(n),
                'm' => now + chrono::Duration::minutes(n),
                's' => now + chrono::Duration::seconds(n),
                _ => now,
            }
        } else {
            now
        }
    };
    use std::fmt::Write;
    let mut out = String::new();
    if write!(out, "{}", dt.format(&fmt)).is_err() {
        out.clear();
        use chrono::Timelike as _;
        let _ = write!(out, "{:02}:{:02}", dt.time().hour(), dt.time().minute());
    }
    out
}

/// Parses "7d", "1m", "30s" → Some((7, 'd')), Some((1, 'm')), etc.
fn parse_offset(s: &str) -> Option<(u32, char)> {
    let unit = s.chars().last()?;
    if !unit.is_ascii_alphabetic() {
        return None;
    }
    let num_str = &s[..s.len() - unit.len_utf8()];
    let n: u32 = num_str.parse().ok()?;
    Some((n, unit))
}

/// Adds (or subtracts) calendar months to a NaiveDate, clamping day.
fn add_months(date: chrono::NaiveDate, months: i32) -> chrono::NaiveDate {
    use chrono::{Datelike, NaiveDate};
    let total_months = date.year() * 12 + date.month() as i32 - 1 + months;
    let y = total_months.div_euclid(12);
    let m = (total_months.rem_euclid(12) + 1) as u32;
    // Clamp day to valid range for target month
    let max_day = NaiveDate::from_ymd_opt(y, m + 1, 1)
        .unwrap_or_else(|| NaiveDate::from_ymd_opt(y + 1, 1, 1).unwrap())
        .pred_opt()
        .unwrap()
        .day();
    let d = date.day().min(max_day);
    NaiveDate::from_ymd_opt(y, m, d).unwrap_or(date)
}

/// Checks if the buffer ends with `{{key}}` and resolves the variable.
/// Returns `(char_count_of_whole_match, resolved_value)` if found.
fn find_standalone_variable(state: &ExpanderState) -> Option<(usize, String)> {
    if !state.buffer.ends_with("}}") {
        return None;
    }
    // Find the last `{{` before the closing `}}`.
    let body = &state.buffer[..state.buffer.len() - 2];
    let open = body.rfind("{{")?;
    let key = &body[open + 2..];
    // Only resolve built-in variables (date, time, random) — not user-defined.
    let empty: HashMap<String, String> = HashMap::new();
    let resolved = resolve_variable(key, &empty);
    // resolve_variable returns `{{key}}` for unknowns — detect that.
    if resolved == format!("{{{{{}}}}}", key) {
        return None;
    }
    let full = &state.buffer[open..];
    let char_count = full.chars().count();
    Some((char_count, resolved))
}

/// Result of greedy trigger matching.
enum MatchResult<'a> {
    /// Exact match, no longer trigger possible — fire now.
    Fire(usize, &'a ShortcutData),
    /// A shorter trigger matched but extra chars were typed past it.
    /// `(total_chars_to_delete, data, overflow_to_retype)`
    FireWithOverflow(usize, &'a ShortcutData, String),
    /// No match yet — still typing or ambiguous.
    Pending,
}

/// Greedy trigger matching (LaTeX-style): prefers the longest possible trigger.
///
/// * If the current input exactly matches a trigger and no longer trigger shares
///   the same prefix, fires immediately.
/// * If a longer trigger *could* still match, returns `Pending`.
/// * If the input diverges past a previously valid trigger, fires that trigger
///   and returns the overflow characters to re-type.
fn find_match<'a>(state: &'a ExpanderState, disabled: &[String]) -> MatchResult<'a> {
    if state.buffer.len() < 2 {
        return MatchResult::Pending;
    }
    let tc = trigger_char();
    let Some(tc_pos) = state.buffer.rfind(tc) else {
        return MatchResult::Pending;
    };
    let input = &state.buffer[tc_pos..];

    // 1. Exact match?
    if let Some(data) = state.shortcuts.get(input) {
        if !disabled.contains(&data.plugin_id) {
            let has_longer = state
                .shortcuts
                .iter()
                .any(|(t, d)| t.len() > input.len() && t.starts_with(input) && !disabled.contains(&d.plugin_id));
            if !has_longer {
                return MatchResult::Fire(input.chars().count(), data);
            }
            // A longer trigger could still come — wait.
            return MatchResult::Pending;
        }
    }

    // 2. Current input is a prefix of some trigger — keep waiting.
    if state.shortcuts.iter().any(|(t, d)| t.starts_with(input) && !disabled.contains(&d.plugin_id)) {
        return MatchResult::Pending;
    }

    // 3. Input diverged — no trigger starts with it.
    //    Try shorter prefixes (longest first) for a deferred match.
    let tc_byte_len = tc.len_utf8();
    for (byte_idx, _) in input.char_indices().rev() {
        if byte_idx <= tc_byte_len {
            break;
        }
        let prefix = &input[..byte_idx];
        if let Some(data) = state.shortcuts.get(prefix) {
            if !disabled.contains(&data.plugin_id) {
                let overflow = input[byte_idx..].to_string();
                let total_chars = input.chars().count();
                return MatchResult::FireWithOverflow(total_chars, data, overflow);
            }
        }
    }

    MatchResult::Pending
}

/// Returns `(pattern_char_count, replacement)` if the buffer ends with an autocorrect pattern.
/// Checks per-app rules first, then global rules.
fn find_autocorrect(
    state: &ExpanderState,
    extra_rules: &[(String, String)],
) -> Option<(usize, String)> {
    // Per-app rules take priority.
    for (pattern, replacement) in extra_rules {
        if state.buffer.ends_with(pattern.as_str()) {
            return Some((pattern.chars().count(), replacement.clone()));
        }
    }
    // Global rules.
    let rules = AUTOCORRECT_RULES.lock().unwrap();
    for (pattern, replacement) in rules.iter() {
        if state.buffer.ends_with(pattern.as_str()) {
            return Some((pattern.chars().count(), replacement.clone()));
        }
    }
    None
}

// ---------------------------------------------------------------------------
// Windows: custom WH_KEYBOARD_LL hook (replaces rdev to avoid ToUnicode corruption)
// ---------------------------------------------------------------------------

#[cfg(target_os = "windows")]
unsafe fn run_win_hook() { unsafe {
    use windows_sys::Win32::System::LibraryLoader::GetModuleHandleW;
    use windows_sys::Win32::UI::WindowsAndMessaging::*;

    // Initialize COM (MTA) for UI Automation caret-position fallback.
    {
        use windows::Win32::System::Com::{CoInitializeEx, COINIT_MULTITHREADED};
        let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
    }

    let hmod = GetModuleHandleW(std::ptr::null());
    let hook = SetWindowsHookExW(WH_KEYBOARD_LL, Some(ll_keyboard_proc), hmod, 0);
    if hook.is_null() {
        eprintln!("[text_expand] failed to install keyboard hook");
        return;
    }
    // The hook needs a message loop on this thread.
    let mut msg: MSG = std::mem::zeroed();
    while GetMessageW(&mut msg, std::ptr::null_mut(), 0, 0) > 0 {}
    UnhookWindowsHookEx(hook);
}}

#[cfg(target_os = "windows")]
unsafe extern "system" fn ll_keyboard_proc(code: i32, wparam: usize, lparam: isize) -> isize { unsafe {
    use windows_sys::Win32::UI::WindowsAndMessaging::*;

    if code >= 0 {
        let is_keydown = wparam == WM_KEYDOWN as usize || wparam == WM_SYSKEYDOWN as usize;
        if is_keydown {
            let kb = &*(lparam as *const KBDLLHOOKSTRUCT);
            // catch_unwind prevents panics from propagating through the extern "system" boundary,
            // which would abort the process.
            let result = std::panic::catch_unwind(|| {
                on_win_key_down(kb.vkCode as u16, kb.scanCode)
            });
            if let Ok(true) = result {
                return 1; // consume — don't pass to the application
            }
        }
    }
    CallNextHookEx(std::ptr::null_mut(), code, wparam, lparam)
}}

/// Core key processing for Windows.  Returns `true` to consume the keystroke.
#[cfg(target_os = "windows")]
fn on_win_key_down(vk: u16, scan: u32) -> bool {
    use windows_sys::Win32::UI::Input::KeyboardAndMouse::*;

    if SUPPRESSING.load(Ordering::SeqCst) {
        return false;
    }
    if !ENABLED.load(Ordering::Relaxed) {
        return false;
    }

    let app_cfg = get_app_config();
    let (app_expansion, app_hints) = (app_cfg.expansion, app_cfg.hints);
    let app_autocorrect = app_cfg.autocorrect && AUTOCORRECT_ENABLED.load(Ordering::Relaxed);
    if !app_expansion && !app_hints && !app_autocorrect {
        return false;
    }
    let disabled = effective_disabled_plugins(&app_cfg.plugin_overrides);

    let hints_active = { !ACTIVE_HINTS.lock().unwrap().is_empty() };

    // Hint navigation — consume these keys.
    if hints_active {
        match vk {
            VK_RIGHT | VK_DOWN => {
                let count = ACTIVE_HINTS.lock().unwrap().len() as i8;
                let sel = HINT_SELECTED.load(Ordering::Relaxed);
                let next = if sel < 0 || sel >= count - 1 {
                    0
                } else {
                    sel + 1
                };
                HINT_SELECTED.store(next, Ordering::Relaxed);
                reemit_hints();
                return true;
            }
            VK_LEFT | VK_UP => {
                let count = ACTIVE_HINTS.lock().unwrap().len() as i8;
                let sel = HINT_SELECTED.load(Ordering::Relaxed);
                let next = if sel <= 0 { count - 1 } else { sel - 1 };
                HINT_SELECTED.store(next, Ordering::Relaxed);
                reemit_hints();
                return true;
            }
            VK_RETURN | VK_TAB => {
                let sel = HINT_SELECTED.load(Ordering::Relaxed);
                if sel >= 0 {
                    let hints = ACTIVE_HINTS.lock().unwrap();
                    if let Some(hint) = hints.get(sel as usize) {
                        let expansion_str = hint.expansion.clone();
                        let resolved = resolve_expansion(&hint.expansion, &hint.variables);
                        drop(hints);
                        let tc = trigger_char();
                        let mut state = STATE.lock().unwrap();
                        let prefix_len = if let Some(pos) = state.buffer.rfind(tc) {
                            state.buffer[pos..].chars().count()
                        } else {
                            0
                        };
                        state.buffer.clear();
                        drop(state);
                        clear_hints();
                        if prefix_len > 0 {
                            record_expansion_stat(expansion_str.clone());
                            if let Some(app) = APP_HANDLE.get() {
                                let _ = app.emit("expansion-used", &expansion_str);
                            }
                            SUPPRESSING.store(true, Ordering::SeqCst);
                            std::thread::spawn(move || {
                                perform_replacement(prefix_len, &resolved);
                                SUPPRESSING.store(false, Ordering::SeqCst);
                            });
                        }
                        return true;
                    }
                }
                // No selection — fall through to buffer reset.
            }
            VK_ESCAPE => {
                let mut state = STATE.lock().unwrap();
                state.buffer.clear();
                drop(state);
                clear_hints();
                return true;
            }
            _ => {}
        }
    }

    // Backspace: pop one character and recalculate hints.
    {
        use windows_sys::Win32::UI::Input::KeyboardAndMouse::VK_BACK;
        if vk == VK_BACK {
            let mut state = STATE.lock().unwrap();
            state.buffer.pop();
            if app_hints && !state.buffer.is_empty() {
                let hints = find_hints(&state, &disabled);
                drop(state);
                show_hints(hints);
            } else {
                drop(state);
                clear_hints();
            }
            return false;
        }
    }

    // Buffer reset keys.
    if is_reset_vk(vk) {
        let mut state = STATE.lock().unwrap();
        state.buffer.clear();
        drop(state);
        clear_hints();
        return false;
    }

    // Character input.
    if let Some(ch) = win_vk_to_char(vk, scan) {
        let mut state = STATE.lock().unwrap();
        state.buffer.push(ch);

        if state.buffer.chars().count() > state.max_buffer {
            let excess = state.buffer.chars().count() - state.max_buffer;
            let byte_off = state
                .buffer
                .char_indices()
                .nth(excess)
                .map_or(state.buffer.len(), |(i, _)| i);
            state.buffer.drain(..byte_off);
        }

        if app_expansion {
            let fire = match find_match(&state, &disabled) {
                MatchResult::Fire(len, data) => {
                    let resolved = resolve_expansion(&data.expansion, &data.variables);
                    Some((len, data.expansion.clone(), resolved))
                }
                MatchResult::FireWithOverflow(len, data, overflow) => {
                    let resolved = resolve_expansion(&data.expansion, &data.variables);
                    Some((len, data.expansion.clone(), format!("{}{}", resolved, overflow)))
                }
                MatchResult::Pending => None,
            };
            if let Some((trigger_len, expansion_str, resolved)) = fire {
                state.buffer.clear();
                drop(state);
                clear_hints();

                record_expansion_stat(expansion_str.clone());
                if let Some(app) = APP_HANDLE.get() {
                    let _ = app.emit("expansion-used", &expansion_str);
                }

                SUPPRESSING.store(true, Ordering::SeqCst);
                std::thread::spawn(move || {
                    perform_replacement(trigger_len, &resolved);
                    SUPPRESSING.store(false, Ordering::SeqCst);
                });
                return false;
            }
        }

        if app_autocorrect {
            if let Some((trigger_len, replacement)) =
                find_autocorrect(&state, &app_cfg.autocorrect_rules)
            {
                state.buffer.clear();
                drop(state);
                clear_hints();
                SUPPRESSING.store(true, Ordering::SeqCst);
                std::thread::spawn(move || {
                    perform_replacement(trigger_len, &replacement);
                    SUPPRESSING.store(false, Ordering::SeqCst);
                });
                return false;
            }
        }

        if VARIABLES_ENABLED.load(Ordering::Relaxed) {
            if let Some((var_len, resolved)) = find_standalone_variable(&state) {
                state.buffer.clear();
                drop(state);
                clear_hints();
                SUPPRESSING.store(true, Ordering::SeqCst);
                std::thread::spawn(move || {
                    perform_replacement(var_len, &resolved);
                    SUPPRESSING.store(false, Ordering::SeqCst);
                });
                return false;
            }
        }

        if app_hints {
            let hints = find_hints(&state, &disabled);
            drop(state);
            show_hints(hints);
        } else {
            drop(state);
            clear_hints();
        }
    }

    false
}

#[cfg(target_os = "windows")]
fn is_reset_vk(vk: u16) -> bool {
    use windows_sys::Win32::UI::Input::KeyboardAndMouse::*;
    matches!(
        vk,
        VK_RETURN
            | VK_TAB
            | VK_ESCAPE
            | VK_UP
            | VK_DOWN
            | VK_LEFT
            | VK_RIGHT
            | VK_HOME
            | VK_END
            | VK_PRIOR
            | VK_NEXT
            | VK_DELETE
    )
}

/// Converts a virtual key + scan code to a character.
///
/// Key details:
/// - Uses `ToUnicodeEx` with the **foreground window's** keyboard layout
///   (`GetKeyboardLayout(fg_tid)`) — the hook thread has its own layout that
///   may differ from the app the user is typing in.  Without this, typing
///   `:tm:` on an English layout while the hook thread has Russian layout
///   would produce `жеь` and triggers would never match.
/// - Uses `GetAsyncKeyState` for modifier keys (Shift, Ctrl, Alt) — reads
///   the physical hardware state and works from ANY thread, unlike
///   `GetKeyState`/`GetKeyboardState` which only see the calling thread's
///   message queue (empty on the dedicated hook thread).
/// - Flag `0x4` tells Windows not to modify the internal keyboard state,
///   preventing dead-key corruption / phantom characters.
#[cfg(target_os = "windows")]
fn win_vk_to_char(vk: u16, scan: u32) -> Option<char> {
    use windows_sys::Win32::UI::Input::KeyboardAndMouse::*;
    use windows_sys::Win32::UI::WindowsAndMessaging::*;

    unsafe {
        let mut kbd_state = [0u8; 256];

        // Modifier keys — GetAsyncKeyState returns the physical state.
        let mods: &[u16] = &[
            VK_SHIFT,
            VK_LSHIFT,
            VK_RSHIFT,
            VK_CONTROL,
            VK_LCONTROL,
            VK_RCONTROL,
            VK_MENU,
            VK_LMENU,
            VK_RMENU,
        ];
        for &m in mods {
            if GetAsyncKeyState(m as i32) < 0 {
                kbd_state[m as usize] |= 0x80;
            }
        }

        // Toggle keys — low bit of GetKeyState is the system-wide toggle.
        if GetKeyState(VK_CAPITAL as i32) & 1 != 0 {
            kbd_state[VK_CAPITAL as usize] |= 0x01;
        }
        if GetKeyState(VK_NUMLOCK as i32) & 1 != 0 {
            kbd_state[VK_NUMLOCK as usize] |= 0x01;
        }

        // Use the foreground window's keyboard layout, not the hook thread's.
        let fg = GetForegroundWindow();
        let fg_tid = GetWindowThreadProcessId(fg, std::ptr::null_mut());
        let hkl = GetKeyboardLayout(fg_tid);

        let mut buf = [0u16; 4];
        let result = ToUnicodeEx(
            vk as u32,
            scan,
            kbd_state.as_ptr(),
            buf.as_mut_ptr(),
            buf.len() as i32,
            0x4, // ← do NOT change keyboard state
            hkl,
        );
        if result == 1 {
            char::from_u32(buf[0] as u32).filter(|c| !c.is_control())
        } else {
            None
        }
    }
}

// ---------------------------------------------------------------------------
// Hints
// ---------------------------------------------------------------------------

/// Generates Unicode character hints for `uXXX`-style prefixes.
///
/// `prefix` is the text after the trigger char (e.g. `u223`).
/// Returns all valid `Shortcut` entries where `trigger` uses the current
/// trigger char (e.g. `\u2230`) and `expansion` is the actual character.
fn find_unicode_hints(prefix: &str) -> Vec<Shortcut> {
    let tc = trigger_char();
    // After stripping the trigger char, the prefix should start with "u" + hex digits.
    let rest = match prefix.strip_prefix('u') {
        Some(r) => r,
        None => return vec![],
    };
    if rest.is_empty() || rest.len() < 3 || rest.len() > 5 {
        return vec![];
    }
    if !rest.chars().all(|c| c.is_ascii_hexdigit()) {
        return vec![];
    }

    let mut hints = Vec::new();
    let hex_digits = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F',
    ];

    match rest.len() {
        3 => {
            // e.g. \u223 → enumerate \u2230..\u223F
            for &h in &hex_digits {
                let code_str = format!("{}{}", rest, h);
                if let Ok(cp) = u32::from_str_radix(&code_str, 16) {
                    if let Some(ch) = char::from_u32(cp) {
                        if !ch.is_control() {
                            hints.push(Shortcut {
                                trigger: format!("{}u{}", tc, code_str),
                                expansion: ch.to_string(),
                                variables: HashMap::new(),
                                plugin_id: String::new(),
                            });
                        }
                    }
                }
            }
        }
        4 => {
            // Exact 4-digit code point first.
            if let Ok(cp) = u32::from_str_radix(rest, 16) {
                if let Some(ch) = char::from_u32(cp) {
                    if !ch.is_control() {
                        hints.push(Shortcut {
                            trigger: format!("{}u{}", tc, rest.to_ascii_uppercase()),
                            expansion: ch.to_string(),
                            variables: HashMap::new(),
                            plugin_id: String::new(),
                        });
                    }
                }
            }
            // Then enumerate 5-digit completions.
            for &h in &hex_digits {
                let code_str = format!("{}{}", rest, h);
                if let Ok(cp) = u32::from_str_radix(&code_str, 16) {
                    if let Some(ch) = char::from_u32(cp) {
                        if !ch.is_control() {
                            hints.push(Shortcut {
                                trigger: format!("{}u{}", tc, code_str.to_ascii_uppercase()),
                                expansion: ch.to_string(),
                                variables: HashMap::new(),
                                plugin_id: String::new(),
                            });
                        }
                    }
                }
            }
        }
        5 => {
            // Exact 5-digit code point.
            if let Ok(cp) = u32::from_str_radix(rest, 16) {
                if let Some(ch) = char::from_u32(cp) {
                    if !ch.is_control() {
                        hints.push(Shortcut {
                            trigger: format!("{}u{}", tc, rest.to_ascii_uppercase()),
                            expansion: ch.to_string(),
                            variables: HashMap::new(),
                            plugin_id: String::new(),
                        });
                    }
                }
            }
        }
        _ => {}
    }

    hints
}

/// Finds shortcuts whose trigger starts with the current open prefix.
/// An "open prefix" is the trigger char followed by 1+ chars (LaTeX-style, no closing char).
fn find_hints(state: &ExpanderState, disabled: &[String]) -> Vec<Shortcut> {
    let tc = trigger_char();
    // Find the last trigger char in the buffer.
    let Some(tc_pos) = state.buffer.rfind(tc) else {
        return vec![];
    };
    let prefix = &state.buffer[tc_pos..];
    // Need at least trigger char + 1 char.
    if prefix.len() < 2 {
        return vec![];
    }

    let mut hints: Vec<Shortcut> = state
        .shortcuts
        .iter()
        .filter(|(trigger, data)| trigger.starts_with(prefix) && !disabled.contains(&data.plugin_id))
        .take(6)
        .map(|(trigger, data)| Shortcut {
            trigger: trigger.clone(),
            expansion: data.expansion.clone(),
            variables: data.variables.clone(),
            plugin_id: data.plugin_id.clone(),
        })
        .collect();
    hints.sort_by(|a, b| a.trigger.len().cmp(&b.trigger.len()));

    // Append Unicode code-point hints (prefix without the leading trigger char).
    if UNICODE_HINTS.load(Ordering::Relaxed) {
        let unicode_prefix = &prefix[tc.len_utf8()..];
        let unicode_hints = find_unicode_hints(unicode_prefix);
        hints.extend(unicode_hints);
    }

    hints
}

/// Payload emitted to the hints frontend.
// ---------------------------------------------------------------------------
// Usage statistics — plain JSON file, no store plugin dependency.
// ---------------------------------------------------------------------------

#[derive(Default, Clone, Serialize, Deserialize)]
pub struct StatsData {
    #[serde(default)]
    pub char_usage: HashMap<String, u64>,
    #[serde(default)]
    pub expansion_usage: HashMap<String, u64>,
    #[serde(default)]
    pub drag_usage: HashMap<String, u64>,
    #[serde(default)]
    pub daily: HashMap<String, DayStats>,
}

#[derive(Default, Clone, Serialize, Deserialize)]
pub struct DayStats {
    #[serde(default)]
    pub copies: u64,
    #[serde(default)]
    pub expansions: u64,
    #[serde(default)]
    pub drags: u64,
}

static STATS_LOCK: LazyLock<Mutex<()>> = LazyLock::new(|| Mutex::new(()));

fn stats_path() -> Option<std::path::PathBuf> {
    APP_HANDLE
        .get()
        .and_then(|app| app.path().app_data_dir().ok().map(|d| d.join("stats.json")))
}

fn read_stats(path: &std::path::Path) -> StatsData {
    std::fs::read_to_string(path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

fn write_stats(path: &std::path::Path, stats: &StatsData) {
    if let Some(parent) = path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    if let Ok(json) = serde_json::to_string(stats) {
        let _ = std::fs::write(path, json);
    }
}

fn today_key() -> String {
    chrono::Local::now().format("%Y-%m-%d").to_string()
}

/// Records an expansion stat (spawns a background thread).
fn record_expansion_stat(expansion: String) {
    std::thread::spawn(move || {
        let Some(path) = stats_path() else { return };
        let _guard = STATS_LOCK.lock().unwrap();
        let mut stats = read_stats(&path);
        *stats.expansion_usage.entry(expansion).or_default() += 1;
        stats.daily.entry(today_key()).or_default().expansions += 1;
        write_stats(&path, &stats);
    });
}

// ---------------------------------------------------------------------------
// Autocorrect commands
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn autocorrect_set_enabled(enabled: bool) {
    AUTOCORRECT_ENABLED.store(enabled, Ordering::Relaxed);
}

#[tauri::command]
pub fn autocorrect_is_enabled() -> bool {
    AUTOCORRECT_ENABLED.load(Ordering::Relaxed)
}

#[tauri::command]
pub fn expansion_set_variables_enabled(enabled: bool) {
    VARIABLES_ENABLED.store(enabled, Ordering::Relaxed);
}

#[tauri::command]
pub fn expansion_is_variables_enabled() -> bool {
    VARIABLES_ENABLED.load(Ordering::Relaxed)
}

#[tauri::command]
pub fn autocorrect_update_rules(rules: Vec<AutoCorrectRule>) {
    let mut list = AUTOCORRECT_RULES.lock().unwrap();
    list.clear();
    for r in rules {
        list.push((r.pattern, r.replacement));
    }
}

#[tauri::command]
pub fn stats_record_char(app: AppHandle, ch: String) {
    let Ok(path) = app.path().app_data_dir().map(|d| d.join("stats.json")) else {
        return;
    };
    let _guard = STATS_LOCK.lock().unwrap();
    let mut stats = read_stats(&path);
    *stats.char_usage.entry(ch).or_default() += 1;
    stats.daily.entry(today_key()).or_default().copies += 1;
    write_stats(&path, &stats);
}

#[tauri::command]
pub fn stats_record_drag(app: AppHandle, ch: String) {
    let Ok(path) = app.path().app_data_dir().map(|d| d.join("stats.json")) else {
        return;
    };
    let _guard = STATS_LOCK.lock().unwrap();
    let mut stats = read_stats(&path);
    *stats.drag_usage.entry(ch).or_default() += 1;
    stats.daily.entry(today_key()).or_default().drags += 1;
    write_stats(&path, &stats);
}

#[tauri::command]
pub fn stats_load(app: AppHandle) -> StatsData {
    let Ok(path) = app.path().app_data_dir().map(|d| d.join("stats.json")) else {
        return StatsData::default();
    };
    let _guard = STATS_LOCK.lock().unwrap();
    read_stats(&path)
}

#[tauri::command]
pub fn stats_reset(app: AppHandle) {
    let Ok(path) = app.path().app_data_dir().map(|d| d.join("stats.json")) else {
        return;
    };
    let _guard = STATS_LOCK.lock().unwrap();
    let _ = std::fs::remove_file(path);
}

// ---------------------------------------------------------------------------
// Hints
// ---------------------------------------------------------------------------

#[derive(Clone, Serialize)]
struct HintsPayload {
    hints: Vec<Shortcut>,
    /// Screen-space caret rect [left, top, right, bottom] (if available).
    caret: Option<[i32; 4]>,
    /// Currently selected hint index (-1 = none).
    selected: i8,
}

/// Shows new hints — resets selected index to 0 if hints are non-empty.
fn show_hints(hints: Vec<Shortcut>) {
    if hints.is_empty() {
        HINT_SELECTED.store(-1, Ordering::Relaxed);
    } else {
        HINT_SELECTED.store(0, Ordering::Relaxed);
    }
    *ACTIVE_HINTS.lock().unwrap() = hints.clone();
    emit_hints(&hints);
}

/// Clears hints and resets selection.
fn clear_hints() {
    HINT_SELECTED.store(-1, Ordering::Relaxed);
    ACTIVE_HINTS.lock().unwrap().clear();
    emit_hints(&[]);
}

/// Re-emits the current hints (selection change only — no resize/reposition).
fn reemit_hints() {
    let hints = ACTIVE_HINTS.lock().unwrap().clone();
    let Some(app) = APP_HANDLE.get() else { return };
    let selected = HINT_SELECTED.load(Ordering::Relaxed);
    let _ = app.emit(
        "expansion-hints",
        HintsPayload {
            hints,
            caret: None,
            selected,
        },
    );
}

/// Emits hints to the frontend and shows/hides the hints window.
/// Dynamically resizes and positions the window using compass direction.
fn emit_hints(hints: &[Shortcut]) {
    let hints_mode = HINTS_MODE.load(Ordering::Relaxed);

    let Some(app) = APP_HANDLE.get() else {
        return;
    };

    // If hints are disabled, always hide.
    let effective_hints = if hints_mode == 2 {
        &[] as &[Shortcut]
    } else {
        hints
    };

    // Per-app config: direction + offsets.
    let app_cfg = get_app_config();
    let has_app_direction = app_cfg.direction != "auto" && !app_cfg.direction.is_empty();

    // Effective mode: per-app direction forces caret mode (0), otherwise use global.
    let effective_mode = if has_app_direction { 0 } else { hints_mode };

    let caret_rect = if effective_hints.is_empty() || effective_mode == 1 {
        None
    } else {
        get_caret_position()
    };

    let selected = HINT_SELECTED.load(Ordering::Relaxed);

    let caret_arr = caret_rect.map(|r| [r.left, r.top, r.right, r.bottom]);
    let _ = app.emit(
        "expansion-hints",
        HintsPayload {
            hints: effective_hints.to_vec(),
            caret: caret_arr,
            selected,
        },
    );

    if let Some(win) = app.get_webview_window("hints") {
        if effective_hints.is_empty() {
            let _ = win.hide();
        } else {
            let n = effective_hints.len() as f64;
            let width = n.min(6.0) * 38.0 + 22.0;
            let height = 54.0_f64;

            let _ = win.set_size(tauri::LogicalSize::new(width, height));

            if effective_mode == 0 {
                if let Some(cr) = caret_rect {
                    let scale = win.scale_factor().unwrap_or(1.0);
                    let dir = if has_app_direction {
                        &app_cfg.direction
                    } else {
                        "SE"
                    };
                    let (lx, ly) =
                        compute_hints_pos(&cr, dir, &app_cfg.offset, width, height, scale);
                    let _ = win.set_position(tauri::LogicalPosition::new(lx, ly));
                } else {
                    position_corner(&win, width, height);
                }
            } else {
                position_corner(&win, width, height);
            }

            let _ = win.show();
        }
    }
}

/// Computes hints window position for a given compass direction and offsets.
fn compute_hints_pos(
    caret: &CaretRect,
    dir: &str,
    offset: &HintsOffset,
    w: f64,
    h: f64,
    scale: f64,
) -> (f64, f64) {
    let cl = caret.left as f64 / scale;
    let ct = caret.top as f64 / scale;
    let cb = caret.bottom as f64 / scale;
    let gap = 4.0;

    let (bx, by) = match dir {
        "NW" => (cl - w, ct - h - gap),
        "N" => (cl - w / 2.0, ct - h - gap),
        "NE" => (cl, ct - h - gap),
        "W" => (cl - w - gap, cb + gap),
        "E" => (cl + gap, cb + gap),
        "SW" => (cl - w, cb + gap),
        "S" => (cl - w / 2.0, cb + gap),
        _ => (cl, cb + gap), // "SE" = default
    };

    let dx = (offset.right - offset.left) as f64;
    let dy = (offset.bottom - offset.top) as f64;
    (bx + dx, by + dy)
}

/// Positions the hints window in the bottom-right corner.
fn position_corner(win: &tauri::WebviewWindow, width: f64, height: f64) {
    if let Ok(Some(monitor)) = win.current_monitor() {
        let scale = win.scale_factor().unwrap_or(1.0);
        let screen = monitor.size().to_logical::<f64>(scale);
        let x = screen.width - width - 20.0;
        let y = screen.height - height - 60.0;
        let _ = win.set_position(tauri::LogicalPosition::new(x, y));
    }
}

// ---------------------------------------------------------------------------
// Replacement logic
// ---------------------------------------------------------------------------

/// Deletes the trigger text and pastes the expansion.
///
/// On Windows: uses direct `SendInput` for everything (no rdev::simulate)
/// to avoid rdev's internal `ToUnicode` call that corrupts keyboard state
/// and produces phantom characters. Clipboard Ctrl+V is used for instant
/// single-shot paste instead of per-character KEYEVENTF_UNICODE.
fn perform_replacement(trigger_char_count: usize, expansion: &str) {
    // Small delay to let the final keystroke fully process.
    std::thread::sleep(Duration::from_millis(30));

    #[cfg(target_os = "windows")]
    {
        win_replace(trigger_char_count, expansion);
    }
    #[cfg(not(target_os = "windows"))]
    {
        mac_replace(trigger_char_count, expansion);
    }
}

// ---------------------------------------------------------------------------
// Windows: direct SendInput for everything
// ---------------------------------------------------------------------------
#[cfg(target_os = "windows")]
fn win_replace(trigger_char_count: usize, expansion: &str) {
    use std::mem;
    use windows_sys::Win32::UI::Input::KeyboardAndMouse::*;

    // Helper: build a keyboard INPUT for a virtual key.
    fn kb(vk: u16, flags: u32) -> INPUT {
        INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: unsafe {
                let mut u: INPUT_0 = mem::zeroed();
                u.ki = KEYBDINPUT {
                    wVk: vk,
                    wScan: 0,
                    dwFlags: flags,
                    time: 0,
                    dwExtraInfo: 0,
                };
                u
            },
        }
    }

    // 1. Release any modifier keys that the user might be holding.
    //    This prevents Ctrl/Shift/Alt from interfering with our Backspace
    //    and Ctrl+V simulation.
    let mods: &[u16] = &[VK_SHIFT, VK_CONTROL, VK_MENU, VK_LWIN, VK_RWIN];
    let mut mod_releases: Vec<INPUT> = Vec::new();
    for &vk in mods {
        let state = unsafe { GetKeyState(vk as i32) };
        if state < 0 {
            // Key is down — release it.
            mod_releases.push(kb(vk, KEYEVENTF_KEYUP));
        }
    }
    if !mod_releases.is_empty() {
        unsafe {
            SendInput(
                mod_releases.len() as u32,
                mod_releases.as_ptr(),
                mem::size_of::<INPUT>() as i32,
            );
        }
        std::thread::sleep(Duration::from_millis(10));
    }

    // 2. Send Backspace presses to delete the trigger text (batched).
    let mut bs_inputs: Vec<INPUT> = Vec::with_capacity(trigger_char_count * 2);
    for _ in 0..trigger_char_count {
        bs_inputs.push(kb(VK_BACK, 0));
        bs_inputs.push(kb(VK_BACK, KEYEVENTF_KEYUP));
    }
    unsafe {
        SendInput(
            bs_inputs.len() as u32,
            bs_inputs.as_ptr(),
            mem::size_of::<INPUT>() as i32,
        );
    }

    std::thread::sleep(Duration::from_millis(20));

    // 3. Save original clipboard, set expansion text, paste via Ctrl+V.
    if let Ok(mut clipboard) = arboard::Clipboard::new() {
        let original = clipboard.get_text().ok();
        if clipboard.set_text(expansion).is_ok() {
            std::thread::sleep(Duration::from_millis(10));

            // Ctrl down, V down, V up, Ctrl up — all in one SendInput call.
            let paste = [
                kb(VK_CONTROL, 0),
                kb(0x56 /* V */, 0),
                kb(0x56 /* V */, KEYEVENTF_KEYUP),
                kb(VK_CONTROL, KEYEVENTF_KEYUP),
            ];
            unsafe {
                SendInput(
                    paste.len() as u32,
                    paste.as_ptr(),
                    mem::size_of::<INPUT>() as i32,
                );
            }

            // Wait for the paste to be processed, then restore clipboard.
            std::thread::sleep(Duration::from_millis(100));
            if let Some(orig) = original {
                let _ = clipboard.set_text(&orig);
            }
        }
    }
}

// ---------------------------------------------------------------------------
// macOS / Linux fallback
// ---------------------------------------------------------------------------
#[cfg(not(target_os = "windows"))]
fn mac_replace(trigger_char_count: usize, expansion: &str) {
    let delay = Duration::from_millis(30);

    // Delete trigger via rdev (safe on macOS).
    for _ in 0..trigger_char_count {
        sim(EventType::KeyPress(Key::Backspace));
        sim(EventType::KeyRelease(Key::Backspace));
        std::thread::sleep(delay);
    }

    std::thread::sleep(Duration::from_millis(20));

    // Paste via clipboard.
    if let Ok(mut clipboard) = arboard::Clipboard::new() {
        let original = clipboard.get_text().ok();
        if clipboard.set_text(expansion).is_ok() {
            std::thread::sleep(delay);
            sim(EventType::KeyPress(Key::MetaLeft));
            sim(EventType::KeyPress(Key::KeyV));
            std::thread::sleep(delay);
            sim(EventType::KeyRelease(Key::KeyV));
            sim(EventType::KeyRelease(Key::MetaLeft));
            std::thread::sleep(Duration::from_millis(150));
            if let Some(orig) = original {
                let _ = clipboard.set_text(&orig);
            }
        }
    }
}

/// Helper – fire-and-forget key simulation (used on non-Windows platforms).
#[cfg(not(target_os = "windows"))]
fn sim(event: EventType) {
    let _ = rdev::simulate(&event);
}

// ---------------------------------------------------------------------------
// Resolve dropped file path to exe name
// ---------------------------------------------------------------------------

fn resolve_exe_path(path: &str) -> Option<String> {
    let p = std::path::Path::new(path);
    let ext = p.extension()?.to_str()?.to_lowercase();

    if ext == "exe" {
        return p
            .file_name()
            .and_then(|n| n.to_str())
            .map(|s| s.to_lowercase());
    }

    #[cfg(target_os = "windows")]
    if ext == "lnk" {
        return resolve_lnk(path);
    }

    // macOS .app bundle: /Applications/Safari.app → "safari"
    #[cfg(target_os = "macos")]
    if ext == "app" {
        return p
            .file_stem()
            .and_then(|n| n.to_str())
            .map(|s| s.to_lowercase());
    }

    None
}

/// Resolves a Windows .lnk shortcut to its target exe filename.
#[cfg(target_os = "windows")]
fn resolve_lnk(path: &str) -> Option<String> {
    let output = std::process::Command::new("powershell")
        .args([
            "-NoProfile",
            "-Command",
            &format!(
                "(New-Object -ComObject WScript.Shell).CreateShortcut('{}').TargetPath",
                path.replace('\'', "''")
            ),
        ])
        .output()
        .ok()?;

    let target = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if target.is_empty() {
        return None;
    }
    let tp = std::path::Path::new(&target);
    tp.file_name()
        .and_then(|n| n.to_str())
        .map(|s| s.to_lowercase())
}

// ---------------------------------------------------------------------------
// Running apps enumeration
// ---------------------------------------------------------------------------

/// A running application with a visible window.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RunningApp {
    pub exe: String,
    pub title: String,
}

#[cfg(target_os = "windows")]
fn list_running_apps() -> Vec<RunningApp> {
    use std::collections::HashSet;
    use windows_sys::Win32::Foundation::*;
    use windows_sys::Win32::System::Threading::*;
    use windows_sys::Win32::UI::WindowsAndMessaging::*;

    // Collect results via a callback using a raw pointer to a Vec.
    let mut results: Vec<RunningApp> = Vec::new();
    let ptr = &mut results as *mut Vec<RunningApp>;

    unsafe extern "system" fn enum_cb(hwnd: HWND, lparam: LPARAM) -> BOOL { unsafe {
        let results = &mut *(lparam as *mut Vec<RunningApp>);

        // Skip invisible windows.
        if IsWindowVisible(hwnd) == 0 {
            return 1; // TRUE — continue
        }

        // Get window title.
        let mut title_buf = [0u16; 512];
        let title_len = GetWindowTextW(hwnd, title_buf.as_mut_ptr(), title_buf.len() as i32);
        if title_len == 0 {
            return 1; // no title → skip (usually hidden helper windows)
        }
        let title = String::from_utf16_lossy(&title_buf[..title_len as usize]);

        // Get process exe.
        let mut pid: u32 = 0;
        GetWindowThreadProcessId(hwnd, &mut pid);
        if pid == 0 {
            return 1;
        }
        let handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, pid);
        if handle.is_null() {
            return 1;
        }
        let mut exe_buf = [0u16; 260];
        let mut exe_len = exe_buf.len() as u32;
        let ok = QueryFullProcessImageNameW(handle, 0, exe_buf.as_mut_ptr(), &mut exe_len);
        CloseHandle(handle);
        if ok == 0 || exe_len == 0 {
            return 1;
        }
        let path = String::from_utf16_lossy(&exe_buf[..exe_len as usize]);
        let exe = path.rsplit('\\').next().unwrap_or(&path).to_lowercase();

        results.push(RunningApp { exe, title });
        1 // TRUE — continue
    }}

    unsafe {
        EnumWindows(Some(enum_cb), ptr as LPARAM);
    }

    // Deduplicate by exe (keep first title per exe), filter out our own app.
    let mut seen = HashSet::new();
    let own_exe = std::env::current_exe()
        .ok()
        .and_then(|p| p.file_name().map(|n| n.to_string_lossy().to_lowercase()));

    results
        .into_iter()
        .filter(|app| {
            // Skip our own process.
            if let Some(ref own) = own_exe {
                if app.exe == *own {
                    return false;
                }
            }
            seen.insert(app.exe.clone())
        })
        .collect()
}

#[cfg(target_os = "macos")]
fn list_running_apps() -> Vec<RunningApp> {
    use objc2::rc::Retained;
    use objc2::runtime::AnyObject;
    use objc2::{class, msg_send};
    use objc2_foundation::NSString;
    use std::collections::HashSet;

    unsafe {
        let ws: Retained<AnyObject> = msg_send![class!(NSWorkspace), sharedWorkspace];
        let apps: Retained<AnyObject> = msg_send![&*ws, runningApplications];
        let count: usize = msg_send![&*apps, count];
        let own_pid = std::process::id() as i32;
        let mut seen = HashSet::new();
        let mut results = Vec::new();

        for i in 0..count {
            let app: Retained<AnyObject> = msg_send![&*apps, objectAtIndex: i];

            // NSApplicationActivationPolicy::Regular = 0 (GUI apps only)
            let policy: isize = msg_send![&*app, activationPolicy];
            if policy != 0 {
                continue;
            }

            let pid: i32 = msg_send![&*app, processIdentifier];
            if pid == own_pid {
                continue;
            }

            let name: Option<Retained<NSString>> = msg_send![&*app, localizedName];
            let Some(name) = name else { continue };
            let name_str = name.to_string();
            let name_lower = name_str.to_lowercase();

            if seen.insert(name_lower.clone()) {
                results.push(RunningApp {
                    exe: name_lower,
                    title: name_str,
                });
            }
        }

        results
    }
}

#[cfg(not(any(target_os = "windows", target_os = "macos")))]
fn list_running_apps() -> Vec<RunningApp> {
    vec![]
}

// ---------------------------------------------------------------------------
// Per-app stop-list helpers
// ---------------------------------------------------------------------------

/// Returns the full config for the current foreground app.
fn get_app_config() -> AppConfig {
    let exe = get_foreground_exe();
    if let Some(name) = exe {
        let map = STOP_LIST.lock().unwrap();
        if let Some(cfg) = map.get(&name) {
            return cfg.clone();
        }
    }
    AppConfig {
        expansion: true,
        hints: true,
        direction: "auto".to_string(),
        offset: HintsOffset::default(),
        autocorrect: true,
        autocorrect_rules: Vec::new(),
        plugin_overrides: HashMap::new(),
    }
}

/// Returns the lowercased exe filename of the foreground window (e.g. `"notepad.exe"`).
#[cfg(target_os = "windows")]
fn get_foreground_exe() -> Option<String> {
    use windows_sys::Win32::Foundation::CloseHandle;
    use windows_sys::Win32::System::Threading::*;
    use windows_sys::Win32::UI::WindowsAndMessaging::*;

    unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd.is_null() {
            return None;
        }
        let mut pid: u32 = 0;
        GetWindowThreadProcessId(hwnd, &mut pid);
        if pid == 0 {
            return None;
        }

        let handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, pid);
        if handle.is_null() {
            return None;
        }

        let mut buf = [0u16; 260];
        let mut len = buf.len() as u32;
        let ok = QueryFullProcessImageNameW(handle, 0, buf.as_mut_ptr(), &mut len);
        CloseHandle(handle);

        if ok == 0 || len == 0 {
            return None;
        }

        let path = String::from_utf16_lossy(&buf[..len as usize]);
        let filename = path.rsplit('\\').next().unwrap_or(&path);
        Some(filename.to_lowercase())
    }
}

#[cfg(target_os = "macos")]
fn get_foreground_exe() -> Option<String> {
    use objc2::rc::Retained;
    use objc2::runtime::AnyObject;
    use objc2::{class, msg_send};
    use objc2_foundation::NSString;

    unsafe {
        let ws: Retained<AnyObject> = msg_send![class!(NSWorkspace), sharedWorkspace];
        let app: Option<Retained<AnyObject>> = msg_send![&*ws, frontmostApplication];
        let app = app?;
        let name: Option<Retained<NSString>> = msg_send![&*app, localizedName];
        let name = name?;
        Some(name.to_string().to_lowercase())
    }
}

#[cfg(not(any(target_os = "windows", target_os = "macos")))]
fn get_foreground_exe() -> Option<String> {
    None
}

// ---------------------------------------------------------------------------
// Windows: caret position for hints placement
// ---------------------------------------------------------------------------

/// Returns the screen-space caret rectangle of the foreground window.
///
/// Tries two strategies in order:
/// 1. **Win32 `GetGUIThreadInfo`** — fast, works for classic Win32 text controls.
/// 2. **UI Automation `ITextPattern2::GetCaretRange`** — slower (COM cross-process),
///    but works for Chrome, Firefox, Electron, UWP, and other accessibility-aware apps.
///
/// Returns `None` if neither method succeeds (hints fall back to corner mode).
#[cfg(target_os = "windows")]
pub fn get_caret_position() -> Option<CaretRect> {
    get_caret_position_win32().or_else(get_caret_position_uia)
}

/// Fast path: Win32 `GetGUIThreadInfo` for classic text controls.
#[cfg(target_os = "windows")]
fn get_caret_position_win32() -> Option<CaretRect> {
    use windows_sys::Win32::Foundation::POINT;
    use windows_sys::Win32::Graphics::Gdi::ClientToScreen;
    use windows_sys::Win32::UI::WindowsAndMessaging::*;

    unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd.is_null() {
            return None;
        }
        let tid = GetWindowThreadProcessId(hwnd, std::ptr::null_mut());
        if tid == 0 {
            return None;
        }

        let mut gui_info: GUITHREADINFO = std::mem::zeroed();
        gui_info.cbSize = std::mem::size_of::<GUITHREADINFO>() as u32;

        if GetGUIThreadInfo(tid, &mut gui_info) == 0 {
            return None;
        }

        let rc = &gui_info.rcCaret;
        if rc.left == 0 && rc.top == 0 && rc.right == 0 && rc.bottom == 0 {
            return None;
        }

        let focus_hwnd = if !gui_info.hwndFocus.is_null() {
            gui_info.hwndFocus
        } else {
            hwnd
        };

        let mut pt_tl = POINT {
            x: rc.left,
            y: rc.top,
        };
        let mut pt_br = POINT {
            x: rc.right,
            y: rc.bottom,
        };

        if ClientToScreen(focus_hwnd, &mut pt_tl) == 0 {
            return None;
        }
        if ClientToScreen(focus_hwnd, &mut pt_br) == 0 {
            return None;
        }

        Some(CaretRect {
            left: pt_tl.x,
            top: pt_tl.y,
            right: pt_br.x,
            bottom: pt_br.y,
        })
    }
}

/// Slow path: UI Automation for browsers, Electron, UWP, and similar apps.
#[cfg(target_os = "windows")]
fn get_caret_position_uia() -> Option<CaretRect> {
    use windows::Win32::System::Com::*;
    use windows::Win32::UI::Accessibility::*;

    thread_local! {
        static UIA: Option<IUIAutomation> = unsafe {
            CoCreateInstance(&CUIAutomation, None, CLSCTX_ALL).ok()
        };
    }

    UIA.with(|uia| {
        let uia = uia.as_ref()?;

        unsafe {
            let element = uia.GetFocusedElement().ok()?;

            // --- Strategy A: TextPattern2 → exact caret rectangle -----------
            if let Ok(pattern) =
                element.GetCurrentPatternAs::<IUIAutomationTextPattern2>(UIA_TextPattern2Id)
            {
                let mut is_active = windows::core::BOOL(0);
                if let Ok(range) = pattern.GetCaretRange(&mut is_active) {
                    if let Ok(rects_ptr) = range.GetBoundingRectangles() {
                        let pos = parse_safearray_rect(rects_ptr);
                        if !rects_ptr.is_null() {
                            let _ = windows::Win32::System::Ole::SafeArrayDestroy(rects_ptr);
                        }
                        if pos.is_some() {
                            return pos;
                        }
                    }
                }
            }

            // --- Strategy B: focused element bounding rect (coarse) ---------
            let rect = element.CurrentBoundingRectangle().ok()?;
            if rect.right > rect.left && rect.bottom > rect.top {
                Some(CaretRect {
                    left: rect.left,
                    top: rect.top,
                    right: rect.right,
                    bottom: rect.bottom,
                })
            } else {
                None
            }
        }
    })
}

/// Parses the first bounding rectangle from a SAFEARRAY of f64.
#[cfg(target_os = "windows")]
unsafe fn parse_safearray_rect(
    sa_ptr: *mut windows::Win32::System::Com::SAFEARRAY,
) -> Option<CaretRect> { unsafe {
    if sa_ptr.is_null() {
        return None;
    }
    let sa = &*sa_ptr;
    let n = sa.rgsabound[0].cElements as usize;
    if n < 4 || sa.pvData.is_null() {
        return None;
    }
    let data = sa.pvData as *const f64;
    let x = *data as i32;
    let y = *data.add(1) as i32;
    let w = *data.add(2) as i32;
    let h = *data.add(3) as i32;
    Some(CaretRect {
        left: x,
        top: y,
        right: x + w,
        bottom: y + h,
    })
}}

/// macOS: uses the Accessibility API to get the caret position.
///
/// Tries two strategies:
/// 1. **AXSelectedTextRange + AXBoundsForRange** — precise caret rect, works in
///    most text editors, browsers, and accessibility-aware apps.
/// 2. **AXPosition + AXSize of the focused element** — coarser fallback.
///
/// Requires the user to grant Accessibility permission (System Settings →
/// Privacy & Security → Accessibility), which is already needed for `rdev::grab`.
#[cfg(target_os = "macos")]
pub fn get_caret_position() -> Option<CaretRect> {
    use std::ffi::c_void;

    type AXUIElementRef = *const c_void;
    type AXValueRef = *const c_void;
    type CFTypeRef = *const c_void;
    type CFStringRef = *const c_void;

    #[repr(C)]
    #[derive(Default, Copy, Clone)]
    struct CGPoint {
        x: f64,
        y: f64,
    }
    #[repr(C)]
    #[derive(Default, Copy, Clone)]
    struct CGSize {
        width: f64,
        height: f64,
    }
    #[repr(C)]
    #[derive(Default, Copy, Clone)]
    struct CGRect {
        origin: CGPoint,
        size: CGSize,
    }

    const AX_VALUE_TYPE_CG_POINT: i32 = 1;
    const AX_VALUE_TYPE_CG_SIZE: i32 = 2;
    const AX_VALUE_TYPE_CG_RECT: i32 = 3;

    #[link(name = "ApplicationServices", kind = "framework")]
    unsafe extern "C" {
        fn AXUIElementCreateSystemWide() -> AXUIElementRef;
        fn AXUIElementCopyAttributeValue(
            element: AXUIElementRef,
            attribute: CFStringRef,
            value: *mut CFTypeRef,
        ) -> i32;
        fn AXUIElementCopyParameterizedAttributeValue(
            element: AXUIElementRef,
            attr: CFStringRef,
            param: CFTypeRef,
            value: *mut CFTypeRef,
        ) -> i32;
        fn AXValueGetValue(value: AXValueRef, type_: i32, value_ptr: *mut c_void) -> bool;

    }

    #[link(name = "CoreFoundation", kind = "framework")]
    unsafe extern "C" {
        fn CFRelease(cf: *const c_void);
        fn CFStringCreateWithCString(
            alloc: *const c_void,
            c_str: *const u8,
            encoding: u32,
        ) -> CFStringRef;
    }

    const K_CF_STRING_ENCODING_UTF8: u32 = 0x0800_0100;

    /// Create a CFStringRef from a static byte literal (must be nul-terminated).
    unsafe fn cfstr(s: &[u8]) -> CFStringRef {
        unsafe { CFStringCreateWithCString(std::ptr::null(), s.as_ptr(), K_CF_STRING_ENCODING_UTF8) }
    }

    /// Wrapper to allow CFStringRef (raw pointer) in statics.
    struct SyncPtr(*const c_void);
    unsafe impl Send for SyncPtr {}
    unsafe impl Sync for SyncPtr {}

    unsafe {
        // Cache CFString constants to avoid re-creating on each call.
        static AX_STRS: OnceLock<[SyncPtr; 5]> = OnceLock::new();
        let ax = AX_STRS.get_or_init(|| {
            [
                SyncPtr(cfstr(b"AXFocusedUIElement\0")),
                SyncPtr(cfstr(b"AXSelectedTextRange\0")),
                SyncPtr(cfstr(b"AXBoundsForRange\0")),
                SyncPtr(cfstr(b"AXPosition\0")),
                SyncPtr(cfstr(b"AXSize\0")),
            ]
        });
        let kAXFocusedUIElementAttribute = ax[0].0;
        let kAXSelectedTextRangeAttribute = ax[1].0;
        let kAXBoundsForRangeParameterizedAttribute = ax[2].0;
        let kAXPositionAttribute = ax[3].0;
        let kAXSizeAttribute = ax[4].0;

        let system_wide = AXUIElementCreateSystemWide();
        if system_wide.is_null() {
            return None;
        }

        // 1. Get the focused UI element.
        let mut focused: CFTypeRef = std::ptr::null();
        let err =
            AXUIElementCopyAttributeValue(system_wide, kAXFocusedUIElementAttribute, &mut focused);
        CFRelease(system_wide);
        if err != 0 || focused.is_null() {
            return None;
        }

        // 2. Try AXSelectedTextRange + AXBoundsForRange (precise caret rect).
        let mut range_val: CFTypeRef = std::ptr::null();
        let range_err =
            AXUIElementCopyAttributeValue(focused, kAXSelectedTextRangeAttribute, &mut range_val);
        if range_err == 0 && !range_val.is_null() {
            let mut bounds_val: CFTypeRef = std::ptr::null();
            let bounds_err = AXUIElementCopyParameterizedAttributeValue(
                focused,
                kAXBoundsForRangeParameterizedAttribute,
                range_val,
                &mut bounds_val,
            );
            CFRelease(range_val);
            if bounds_err == 0 && !bounds_val.is_null() {
                let mut rect = CGRect::default();
                if AXValueGetValue(
                    bounds_val,
                    AX_VALUE_TYPE_CG_RECT,
                    &mut rect as *mut _ as *mut c_void,
                ) {
                    CFRelease(bounds_val);
                    CFRelease(focused);
                    return Some(CaretRect {
                        left: rect.origin.x as i32,
                        top: rect.origin.y as i32,
                        right: (rect.origin.x + rect.size.width) as i32,
                        bottom: (rect.origin.y + rect.size.height) as i32,
                    });
                }
                CFRelease(bounds_val);
            }
        } else if !range_val.is_null() {
            CFRelease(range_val);
        }

        // 3. Fallback: focused element AXPosition + AXSize (coarse).
        let mut pos_val: CFTypeRef = std::ptr::null();
        let mut size_val: CFTypeRef = std::ptr::null();
        let pos_err = AXUIElementCopyAttributeValue(focused, kAXPositionAttribute, &mut pos_val);
        let size_err = AXUIElementCopyAttributeValue(focused, kAXSizeAttribute, &mut size_val);
        CFRelease(focused);

        if pos_err == 0 && size_err == 0 && !pos_val.is_null() && !size_val.is_null() {
            let mut pos = CGPoint::default();
            let mut size = CGSize::default();
            let pos_ok = AXValueGetValue(
                pos_val,
                AX_VALUE_TYPE_CG_POINT,
                &mut pos as *mut _ as *mut c_void,
            );
            let size_ok = AXValueGetValue(
                size_val,
                AX_VALUE_TYPE_CG_SIZE,
                &mut size as *mut _ as *mut c_void,
            );
            CFRelease(pos_val);
            CFRelease(size_val);
            if pos_ok && size_ok {
                return Some(CaretRect {
                    left: pos.x as i32,
                    top: pos.y as i32,
                    right: (pos.x + size.width) as i32,
                    bottom: (pos.y + size.height) as i32,
                });
            }
        } else {
            if !pos_val.is_null() {
                CFRelease(pos_val);
            }
            if !size_val.is_null() {
                CFRelease(size_val);
            }
        }

        None
    }
}

#[cfg(not(any(target_os = "windows", target_os = "macos")))]
pub fn get_caret_position() -> Option<CaretRect> {
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_moment_to_strftime() {
        assert_eq!(moment_to_strftime("DD.MM.YYYY"), "%d.%m.%Y");
        assert_eq!(moment_to_strftime("DD-MM-YYYY"), "%d-%m-%Y");
        assert_eq!(moment_to_strftime("YYYY/MM/DD"), "%Y/%m/%d");
        assert_eq!(moment_to_strftime("D.M.YYYY"), "%-d.%-m.%Y");
        assert_eq!(moment_to_strftime("HH:mm:ss"), "%H:%M:%S");
        assert_eq!(moment_to_strftime("hh:mm A"), "%I:%M %p");
        assert_eq!(moment_to_strftime("DD MMMM YYYY"), "%d %B %Y");
    }

    #[test]
    fn test_resolve_date_formats() {
        // These must not panic.
        let r = resolve_date("date");
        assert!(!r.is_empty());

        let r = resolve_date("date:DD.MM.YYYY");
        assert!(!r.is_empty());
        // Should be like "06.03.2026"
        assert_eq!(r.len(), 10);

        let r = resolve_date("date:YYYY-MM-DD");
        assert!(!r.is_empty());
    }

    #[test]
    fn test_resolve_time_formats() {
        let r = resolve_time("time");
        assert!(!r.is_empty());

        let r = resolve_time("time:HH:mm:ss");
        assert!(!r.is_empty());
    }

    #[test]
    fn test_split_format() {
        assert_eq!(split_format("date", "date"), ("date", None));
        assert_eq!(split_format("date:DD.MM", "date"), ("date", Some("DD.MM")));
        assert_eq!(split_format("date+7d", "date"), ("date+7d", None));
        assert_eq!(split_format("date+7d:DD.MM", "date"), ("date+7d", Some("DD.MM")));
    }
}
