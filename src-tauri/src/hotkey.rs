//! Global hotkey registration and window toggle.
//!
//! Uses `tauri-plugin-global-shortcut` to let users summon the popup
//! from any application via a configurable key combination.

use std::sync::Mutex;

use tauri::{AppHandle, LogicalPosition, Manager};
use tauri_plugin_global_shortcut::GlobalShortcutExt;

use crate::window;

/// Currently registered shortcut string (e.g. `"Ctrl+Shift+Space"`).
static CURRENT_SHORTCUT: Mutex<Option<String>> = Mutex::new(None);

/// Reads the persisted `global_hotkey` from the store and registers it.
/// Called once during `setup`.
pub fn init(app: &AppHandle) {
    if let Ok(store) =
        tauri_plugin_store::StoreBuilder::new(app, "settings.json").build()
    {
        if let Some(val) = store.get("global_hotkey") {
            if let Some(shortcut) = val.as_str() {
                if !shortcut.is_empty() {
                    let _ = register(app, shortcut);
                }
            }
        }
    }
}

/// Registers `shortcut` as the global hotkey, replacing any previous one.
fn register(app: &AppHandle, shortcut: &str) -> Result<(), String> {
    let parsed: tauri_plugin_global_shortcut::Shortcut = shortcut
        .parse()
        .map_err(|e| format!("invalid shortcut: {e}"))?;

    let handle = app.clone();
    app.global_shortcut()
        .on_shortcut(parsed, move |_app, _shortcut, event| {
            if let tauri_plugin_global_shortcut::ShortcutState::Pressed = event.state {
                toggle_main_window(&handle);
            }
        })
        .map_err(|e| format!("failed to register shortcut: {e}"))?;

    *CURRENT_SHORTCUT.lock().unwrap() = Some(shortcut.to_owned());
    Ok(())
}

/// Unregisters the currently active global hotkey, if any.
fn unregister(app: &AppHandle) {
    let mut current = CURRENT_SHORTCUT.lock().unwrap();
    if let Some(ref s) = *current {
        if let Ok(parsed) = s.parse::<tauri_plugin_global_shortcut::Shortcut>() {
            let _ = app.global_shortcut().unregister(parsed);
        }
    }
    *current = None;
}

// ---------------------------------------------------------------------------
// Cursor position (platform-specific)
// ---------------------------------------------------------------------------

/// Returns the current mouse-cursor position in logical pixels.
#[allow(unused_variables)]
fn cursor_position_logical(scale: f64) -> Option<(f64, f64)> {
    #[cfg(target_os = "windows")]
    {
        use windows_sys::Win32::Foundation::POINT;
        use windows_sys::Win32::UI::WindowsAndMessaging::GetCursorPos;
        let mut pt = POINT { x: 0, y: 0 };
        if unsafe { GetCursorPos(&mut pt) } != 0 {
            return Some((pt.x as f64 / scale, pt.y as f64 / scale));
        }
    }

    #[cfg(target_os = "macos")]
    {
        // CGEventGetLocation returns logical points (macOS Quartz coordinates).
        #[repr(C)]
        struct CGPoint {
            x: f64,
            y: f64,
        }
        extern "C" {
            fn CGEventCreate(source: *const std::ffi::c_void) -> *const std::ffi::c_void;
            fn CGEventGetLocation(event: *const std::ffi::c_void) -> CGPoint;
            fn CFRelease(cf: *const std::ffi::c_void);
        }
        unsafe {
            let event = CGEventCreate(std::ptr::null());
            if !event.is_null() {
                let loc = CGEventGetLocation(event);
                CFRelease(event);
                return Some((loc.x, loc.y));
            }
        }
    }

    None
}

/// Toggles the main popup window: hides it if visible, otherwise
/// positions it under the mouse cursor and shows it.
fn toggle_main_window(app: &AppHandle) {
    let Some(win) = app.get_webview_window("main") else {
        return;
    };

    if win.is_visible().unwrap_or(false) {
        let _ = win.hide();
        return;
    }

    let scale = win.scale_factor().unwrap_or(1.0);

    // Position under the mouse cursor (horizontally centred on it)
    if let Some((cx, cy)) = cursor_position_logical(scale) {
        let mut x = cx - window::MAIN_WIDTH / 2.0;
        let mut y = cy;

        // Clamp so the window stays on-screen
        if let Ok(Some(monitor)) = win.current_monitor() {
            let screen = monitor.size().to_logical::<f64>(scale);
            x = x.clamp(0.0, (screen.width - window::MAIN_WIDTH).max(0.0));
            y = y.clamp(0.0, (screen.height - window::MAIN_HEIGHT).max(0.0));
        }

        let _ = win.set_position(LogicalPosition::new(x, y));
    } else {
        // Fallback: centre on current monitor
        if let Ok(Some(monitor)) = win.current_monitor() {
            let screen = monitor.size().to_logical::<f64>(scale);
            let x = (screen.width - window::MAIN_WIDTH) / 2.0;
            let y = (screen.height - window::MAIN_HEIGHT) / 2.0;
            let _ = win.set_position(LogicalPosition::new(x, y));
        }
    }

    crate::tray::mark_opened();
    let _ = win.show();
    let _ = win.set_focus();
}

// ---------------------------------------------------------------------------
// Tauri commands
// ---------------------------------------------------------------------------

/// Sets (or clears) the global hotkey and persists the choice.
#[tauri::command]
pub fn set_global_hotkey(app: AppHandle, shortcut: Option<String>) -> Result<(), String> {
    unregister(&app);

    if let Some(ref s) = shortcut {
        register(&app, s)?;
    }

    // Persist to store
    if let Ok(store) =
        tauri_plugin_store::StoreBuilder::new(&app, "settings.json").build()
    {
        match &shortcut {
            Some(s) => {
                let _ = store.set("global_hotkey", serde_json::json!(s));
            }
            None => {
                let _ = store.delete("global_hotkey");
            }
        }
        let _ = store.save();
    }

    Ok(())
}

/// Returns the currently registered global hotkey string, if any.
#[tauri::command]
pub fn get_global_hotkey() -> Option<String> {
    CURRENT_SHORTCUT.lock().unwrap().clone()
}
