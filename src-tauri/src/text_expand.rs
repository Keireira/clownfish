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
}

/// Per-application override: which features are disabled.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct StopListEntry {
    pub exe: String,
    /// If `false`, expansion is disabled for this app.
    pub expansion: bool,
    /// If `false`, hints are disabled for this app.
    pub hints: bool,
}

/// Internal state shared between the listener thread and Tauri commands.
struct ExpanderState {
    /// Ring buffer of recently typed characters.
    buffer: String,
    /// Maximum buffer capacity.
    max_buffer: usize,
    /// Active shortcuts keyed by trigger for fast lookup.
    shortcuts: HashMap<String, String>,
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

/// Currently visible hints (stored so keyboard navigation can reference them).
static ACTIVE_HINTS: LazyLock<Mutex<Vec<Shortcut>>> = LazyLock::new(|| Mutex::new(Vec::new()));

/// Selected hint index (-1 = none).
static HINT_SELECTED: std::sync::atomic::AtomicI8 = std::sync::atomic::AtomicI8::new(-1);

/// Per-app stop-list: exe name (lowercase) → (expansion_enabled, hints_enabled).
static STOP_LIST: LazyLock<Mutex<HashMap<String, (bool, bool)>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

static STATE: LazyLock<Mutex<ExpanderState>> = LazyLock::new(|| {
    Mutex::new(ExpanderState {
        buffer: String::with_capacity(128),
        max_buffer: 100,
        shortcuts: HashMap::new(),
    })
});

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
        state.shortcuts.insert(s.trigger, s.expansion);
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

/// Updates the per-app stop-list.
#[tauri::command]
pub fn expansion_update_stoplist(entries: Vec<StopListEntry>) {
    let mut map = STOP_LIST.lock().unwrap();
    map.clear();
    for e in entries {
        map.insert(e.exe.to_lowercase(), (e.expansion, e.hints));
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
pub fn expansion_apply_hint(expansion: String) {
    let mut state = STATE.lock().unwrap();
    // Find the partial prefix length (`:xxx` without closing `:`).
    let prefix_len = if let Some(colon_pos) = state.buffer.rfind(':') {
        state.buffer[colon_pos..].chars().count()
    } else {
        0
    };
    state.buffer.clear();
    drop(state);

    if prefix_len == 0 {
        return;
    }

    clear_hints();

    SUPPRESSING.store(true, Ordering::SeqCst);
    std::thread::spawn(move || {
        perform_replacement(prefix_len, &expansion);
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
    let (app_expansion, app_hints) = get_app_permissions();
    if !app_expansion && !app_hints {
        return Some(event);
    }

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
                    let next = if sel < 0 || sel >= count - 1 { 0 } else { sel + 1 };
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
                            let expansion = hint.expansion.clone();
                            drop(hints);
                            let mut state = STATE.lock().unwrap();
                            let prefix_len =
                                if let Some(colon_pos) = state.buffer.rfind(':') {
                                    state.buffer[colon_pos..].chars().count()
                                } else {
                                    0
                                };
                            state.buffer.clear();
                            drop(state);
                            clear_hints();
                            if prefix_len > 0 {
                                SUPPRESSING.store(true, Ordering::SeqCst);
                                std::thread::spawn(move || {
                                    perform_replacement(prefix_len, &expansion);
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

        if is_buffer_reset_key(key) {
            let mut state = STATE.lock().unwrap();
            state.buffer.clear();
            drop(state);
            clear_hints();
        } else if let Some(ch) = event_to_char(&event) {
            let mut state = STATE.lock().unwrap();
            state.buffer.push(ch);

            if state.buffer.len() > state.max_buffer {
                let excess = state.buffer.len() - state.max_buffer;
                state.buffer.drain(..excess);
            }

            if app_expansion {
                if let Some((trigger_len, expansion)) = find_match(&state) {
                    let expansion = expansion.clone();
                    state.buffer.clear();
                    drop(state);
                    clear_hints();

                    SUPPRESSING.store(true, Ordering::SeqCst);
                    std::thread::spawn(move || {
                        perform_replacement(trigger_len, &expansion);
                        SUPPRESSING.store(false, Ordering::SeqCst);
                    });
                    return Some(event);
                }
            }

            if app_hints {
                let hints = find_hints(&state);
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
        Key::Backspace
            | Key::Return
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

/// Returns `(trigger_char_count, expansion)` if the buffer ends with a trigger.
fn find_match(state: &ExpanderState) -> Option<(usize, &String)> {
    if state.buffer.len() < 3 {
        return None;
    }
    for (trigger, expansion) in &state.shortcuts {
        if state.buffer.ends_with(trigger) {
            return Some((trigger.chars().count(), expansion));
        }
    }
    None
}

// ---------------------------------------------------------------------------
// Windows: custom WH_KEYBOARD_LL hook (replaces rdev to avoid ToUnicode corruption)
// ---------------------------------------------------------------------------

#[cfg(target_os = "windows")]
unsafe fn run_win_hook() {
    use windows_sys::Win32::System::LibraryLoader::GetModuleHandleW;
    use windows_sys::Win32::UI::WindowsAndMessaging::*;

    let hmod = GetModuleHandleW(std::ptr::null());
    let hook = SetWindowsHookExW(
        WH_KEYBOARD_LL,
        Some(ll_keyboard_proc),
        hmod,
        0,
    );
    if hook.is_null() {
        eprintln!("[text_expand] failed to install keyboard hook");
        return;
    }
    // The hook needs a message loop on this thread.
    let mut msg: MSG = std::mem::zeroed();
    while GetMessageW(&mut msg, std::ptr::null_mut(), 0, 0) > 0 {}
    UnhookWindowsHookEx(hook);
}

#[cfg(target_os = "windows")]
unsafe extern "system" fn ll_keyboard_proc(
    code: i32,
    wparam: usize,
    lparam: isize,
) -> isize {
    use windows_sys::Win32::UI::WindowsAndMessaging::*;

    if code >= 0 {
        let is_keydown =
            wparam == WM_KEYDOWN as usize || wparam == WM_SYSKEYDOWN as usize;
        if is_keydown {
            let kb = &*(lparam as *const KBDLLHOOKSTRUCT);
            if on_win_key_down(kb.vkCode as u16, kb.scanCode) {
                return 1; // consume — don't pass to the application
            }
        }
    }
    CallNextHookEx(std::ptr::null_mut(), code, wparam, lparam)
}

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

    let (app_expansion, app_hints) = get_app_permissions();
    if !app_expansion && !app_hints {
        return false;
    }

    let hints_active = { !ACTIVE_HINTS.lock().unwrap().is_empty() };

    // Hint navigation — consume these keys.
    if hints_active {
        match vk {
            VK_RIGHT | VK_DOWN => {
                let count = ACTIVE_HINTS.lock().unwrap().len() as i8;
                let sel = HINT_SELECTED.load(Ordering::Relaxed);
                let next = if sel < 0 || sel >= count - 1 { 0 } else { sel + 1 };
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
                        let expansion = hint.expansion.clone();
                        drop(hints);
                        let mut state = STATE.lock().unwrap();
                        let prefix_len =
                            if let Some(colon_pos) = state.buffer.rfind(':') {
                                state.buffer[colon_pos..].chars().count()
                            } else {
                                0
                            };
                        state.buffer.clear();
                        drop(state);
                        clear_hints();
                        if prefix_len > 0 {
                            SUPPRESSING.store(true, Ordering::SeqCst);
                            std::thread::spawn(move || {
                                perform_replacement(prefix_len, &expansion);
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

        if state.buffer.len() > state.max_buffer {
            let excess = state.buffer.len() - state.max_buffer;
            state.buffer.drain(..excess);
        }

        if app_expansion {
            if let Some((trigger_len, expansion)) = find_match(&state) {
                let expansion = expansion.clone();
                state.buffer.clear();
                drop(state);
                clear_hints();
                SUPPRESSING.store(true, Ordering::SeqCst);
                std::thread::spawn(move || {
                    perform_replacement(trigger_len, &expansion);
                    SUPPRESSING.store(false, Ordering::SeqCst);
                });
                return false; // don't consume the triggering character
            }
        }

        if app_hints {
            let hints = find_hints(&state);
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
        VK_BACK
            | VK_RETURN
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
            VK_SHIFT, VK_LSHIFT, VK_RSHIFT,
            VK_CONTROL, VK_LCONTROL, VK_RCONTROL,
            VK_MENU, VK_LMENU, VK_RMENU,
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

/// Finds shortcuts whose trigger starts with the current open prefix.
/// An "open prefix" is `:` followed by 1+ chars without a closing `:`.
fn find_hints(state: &ExpanderState) -> Vec<Shortcut> {
    // Find the last `:` in the buffer.
    let Some(colon_pos) = state.buffer.rfind(':') else {
        return vec![];
    };
    let prefix = &state.buffer[colon_pos..];
    // Need at least `:` + 1 char, and must NOT end with `:` (that would be a completed trigger).
    if prefix.len() < 2 || prefix.ends_with(':') && prefix.len() > 1 {
        return vec![];
    }
    // Don't show hints if the prefix itself ends with `:` (completed).
    if prefix.len() > 1 && prefix[1..].contains(':') {
        return vec![];
    }

    let mut hints: Vec<Shortcut> = state
        .shortcuts
        .iter()
        .filter(|(trigger, _)| trigger.starts_with(prefix))
        .take(6)
        .map(|(trigger, expansion)| Shortcut {
            trigger: trigger.clone(),
            expansion: expansion.clone(),
        })
        .collect();
    hints.sort_by(|a, b| a.trigger.len().cmp(&b.trigger.len()));
    hints
}

/// Payload emitted to the hints frontend.
#[derive(Clone, Serialize)]
struct HintsPayload {
    hints: Vec<Shortcut>,
    /// Screen-space caret position (if available).
    caret: Option<(i32, i32)>,
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
    let _ = app.emit("expansion-hints", HintsPayload {
        hints,
        caret: None,
        selected,
    });
}

/// Emits hints to the frontend and shows/hides the hints window.
/// Dynamically resizes and positions the window near the caret.
fn emit_hints(hints: &[Shortcut]) {
    let hints_mode = HINTS_MODE.load(Ordering::Relaxed);

    let Some(app) = APP_HANDLE.get() else {
        return;
    };

    // If hints are disabled, always hide.
    let effective_hints = if hints_mode == 2 { &[] as &[Shortcut] } else { hints };

    let caret = if effective_hints.is_empty() || hints_mode == 1 {
        None
    } else {
        get_caret_position()
    };

    let selected = HINT_SELECTED.load(Ordering::Relaxed);

    let _ = app.emit("expansion-hints", HintsPayload {
        hints: effective_hints.to_vec(),
        caret,
        selected,
    });

    if let Some(win) = app.get_webview_window("hints") {
        if effective_hints.is_empty() {
            let _ = win.hide();
        } else {
            // 32px cell + 6px gap; pad 8+18 / 8+12; border 1×2
            // W = N×38 − 6 + 28 = N×38 + 22; H = 32 + 22 = 54
            let n = effective_hints.len() as f64;
            let width = n * 38.0 + 22.0;
            let height = 54.0_f64;

            let _ = win.set_size(tauri::LogicalSize::new(width, height));

            if hints_mode == 0 {
                // "caret" mode: position near the text cursor.
                if let Some((cx, cy)) = caret {
                    let scale = win.scale_factor().unwrap_or(1.0);
                    let lx = cx as f64 / scale;
                    let ly = cy as f64 / scale + 4.0;
                    let _ = win.set_position(tauri::LogicalPosition::new(lx, ly));
                } else {
                    // Caret not available — fall back to corner.
                    position_corner(&win, width, height);
                }
            } else {
                // "corner" mode.
                position_corner(&win, width, height);
            }

            let _ = win.show();
        }
    }
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

    // 2. Send Backspace presses to delete the trigger text.
    for _ in 0..trigger_char_count {
        let bs = [
            kb(VK_BACK, 0),
            kb(VK_BACK, KEYEVENTF_KEYUP),
        ];
        unsafe {
            SendInput(
                bs.len() as u32,
                bs.as_ptr(),
                mem::size_of::<INPUT>() as i32,
            );
        }
        std::thread::sleep(Duration::from_millis(20));
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
// Windows: caret position for hints placement
// ---------------------------------------------------------------------------

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

    unsafe extern "system" fn enum_cb(hwnd: HWND, lparam: LPARAM) -> BOOL {
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
    }

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

#[cfg(not(target_os = "windows"))]
fn list_running_apps() -> Vec<RunningApp> {
    vec![]
}

// ---------------------------------------------------------------------------
// Per-app stop-list helpers
// ---------------------------------------------------------------------------

/// Returns (expansion_enabled, hints_enabled) for the current foreground app.
fn get_app_permissions() -> (bool, bool) {
    let exe = get_foreground_exe();
    if let Some(name) = exe {
        let map = STOP_LIST.lock().unwrap();
        if let Some(&(exp, hints)) = map.get(&name) {
            return (exp, hints);
        }
    }
    (true, true) // default: everything enabled
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

#[cfg(not(target_os = "windows"))]
fn get_foreground_exe() -> Option<String> {
    None
}

// ---------------------------------------------------------------------------
// Windows: caret position for hints placement
// ---------------------------------------------------------------------------

/// Returns the screen-space caret (x, y) position of the foreground window,
/// or `None` if unavailable.
#[cfg(target_os = "windows")]
pub fn get_caret_position() -> Option<(i32, i32)> {
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

        // If rcCaret is all zeros the app doesn't expose caret info
        // (browsers, Electron apps, etc.). Return None so we fall back
        // to corner positioning instead of showing at the window origin.
        let rc = &gui_info.rcCaret;
        if rc.left == 0 && rc.top == 0 && rc.right == 0 && rc.bottom == 0 {
            return None;
        }

        let focus_hwnd = if !gui_info.hwndFocus.is_null() {
            gui_info.hwndFocus
        } else {
            hwnd
        };

        let mut pt = POINT {
            x: rc.left,
            y: rc.bottom,
        };

        if ClientToScreen(focus_hwnd, &mut pt) == 0 {
            return None;
        }

        Some((pt.x, pt.y))
    }
}

#[cfg(not(target_os = "windows"))]
pub fn get_caret_position() -> Option<(i32, i32)> {
    None
}
