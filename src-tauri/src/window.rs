//! Window creation, glass effects, and navigation commands.

use tauri::window::{Effect, EffectState, EffectsBuilder};
use tauri::{App, AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

/// Main popup window width in logical pixels.
pub const MAIN_WIDTH: f64 = 420.0;

/// Main popup window height in logical pixels.
pub const MAIN_HEIGHT: f64 = 520.0;

/// Settings window default dimensions.
const SETTINGS_WIDTH: f64 = 780.0;
const SETTINGS_HEIGHT: f64 = 600.0;

/// Settings window minimum dimensions.
const SETTINGS_MIN_WIDTH: f64 = 650.0;
const SETTINGS_MIN_HEIGHT: f64 = 480.0;

/// Creates the main popup window (hidden, always-on-top, no decorations).
///
/// Also wires up focus-loss and theme-change event handlers:
/// - **blur**: hides the window (respecting the tray grace period)
/// - **theme change**: updates the tray icon to match the new theme
pub fn build_main(app: &App) -> tauri::Result<()> {
    // Platform-specific glass/vibrancy effects:
    // macOS → HudWindow, Windows 11 → Mica, Windows 10 → Acrylic fallback
    let effects = EffectsBuilder::new()
        .effects(vec![Effect::HudWindow, Effect::Mica, Effect::Acrylic])
        .state(EffectState::Active)
        .radius(14.0)
        .build();

    let win = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
        .title("Hot Symbols")
        .inner_size(MAIN_WIDTH, MAIN_HEIGHT)
        .decorations(false)
        .transparent(true)
        .visible(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .focused(false)
        .resizable(false)
        .effects(effects)
        .build()?;

    let win_clone = win.clone();
    let app_handle = app.handle().clone();

    win.on_window_event(move |event| match event {
        tauri::WindowEvent::Focused(false) => {
            if !crate::tray::within_grace_period() {
                let _ = win_clone.hide();
            }
        }
        tauri::WindowEvent::ThemeChanged(theme) => {
            if let Some(tray) = app_handle.tray_by_id("main-tray") {
                let _ = tray.set_icon(Some(crate::tray::icon_for_theme(&app_handle, *theme)));
            }
        }
        _ => {}
    });

    Ok(())
}

/// Creates the settings window (hidden until needed).
///
/// The close button is intercepted so the window hides instead of
/// being destroyed, keeping the WebView2 runtime warm for instant re-show.
pub fn build_settings(app: &App) -> tauri::Result<()> {
    let win = WebviewWindowBuilder::new(app, "settings", WebviewUrl::default())
        .title("Hot Symbols Settings")
        .initialization_script("window.__IS_SETTINGS_WINDOW__=true;")
        .inner_size(SETTINGS_WIDTH, SETTINGS_HEIGHT)
        .min_inner_size(SETTINGS_MIN_WIDTH, SETTINGS_MIN_HEIGHT)
        .center()
        .visible(false)
        .build()?;

    let handle = win.clone();
    win.on_window_event(move |event| {
        if let tauri::WindowEvent::CloseRequested { api, .. } = event {
            api.prevent_close();
            let _ = handle.hide();
        }
    });

    Ok(())
}

/// Creates a small hints popup for text expansion autocomplete.
pub fn build_hints(app: &App) -> tauri::Result<()> {
    let effects = EffectsBuilder::new()
        .effects(vec![Effect::HudWindow, Effect::Mica, Effect::Acrylic])
        .state(EffectState::Active)
        .radius(10.0)
        .build();

    let win = WebviewWindowBuilder::new(app, "hints", WebviewUrl::default())
        .title("Hints")
        .initialization_script("window.__IS_HINTS_WINDOW__=true;")
        .inner_size(260.0, 54.0)
        .decorations(false)
        .transparent(true)
        .visible(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .focused(false)
        .resizable(false)
        .effects(effects)
        .build()?;

    // Position near bottom-right of screen.
    if let Ok(Some(monitor)) = win.current_monitor() {
        let scale = win.scale_factor().unwrap_or(1.0);
        let screen = monitor.size().to_logical::<f64>(scale);
        let x = screen.width - 240.0;
        let y = screen.height - 240.0;
        let _ = win.set_position(tauri::LogicalPosition::new(x, y));
    }

    Ok(())
}

/// Shows the settings window, hiding the main popup first so it
/// doesn't obscure the settings with its always-on-top flag.
pub fn open_settings(app: &AppHandle) {
    if let Some(main_win) = app.get_webview_window("main") {
        let _ = main_win.hide();
    }
    if let Some(win) = app.get_webview_window("settings") {
        let _ = win.show();
        let _ = win.set_focus();
    }
}

/// Tauri command: opens the settings window.
#[tauri::command]
pub fn open_settings_cmd(app: AppHandle) {
    open_settings(&app);
}

/// Tauri command: opens a URL in the default browser.
#[tauri::command]
pub fn open_url_cmd(url: String) {
    let _ = open::that(url);
}
