//! System tray icon, context menu, and click-to-toggle logic.
//!
//! The tray icon is theme-aware (light/dark) and positions the popup
//! window relative to the icon on both macOS and Windows.

use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

use tauri::image::Image;
use tauri::menu::{CheckMenuItem, Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{App, AppHandle, Emitter, LogicalPosition, Manager, Theme};

use crate::window;

/// Grace period (ms) after opening the popup. Blur events within this
/// interval are ignored to prevent the "blink" where the popup shows and
/// immediately hides because the OS steals focus briefly.
const OPEN_GRACE_MS: u64 = 500;

/// Timestamp (ms since UNIX epoch) of the last tray-click that opened the popup.
static LAST_OPEN: AtomicU64 = AtomicU64::new(0);

/// Returns the current time in milliseconds since the UNIX epoch.
fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

/// Returns `true` if the popup was opened within the grace period.
pub fn within_grace_period() -> bool {
    now_ms() - LAST_OPEN.load(Ordering::Relaxed) <= OPEN_GRACE_MS
}

/// Records the current time as the moment the popup was opened.
fn mark_opened() {
    LAST_OPEN.store(now_ms(), Ordering::Relaxed);
}

/// Loads the tray icon matching the given theme.
///
/// Falls back to the app's default icon when the themed file is missing
/// or cannot be decoded.
pub fn icon_for_theme(app: &AppHandle, theme: Theme) -> Image<'static> {
    let fallback = app.default_window_icon().unwrap().clone().to_owned();

    let Some(resource_dir) = app.path().resource_dir().ok() else {
        return fallback;
    };

    let file = match theme {
        Theme::Dark => resource_dir.join("icons/tray-dark.png"),
        _ => resource_dir.join("icons/tray-light.png"),
    };

    std::fs::read(&file)
        .ok()
        .and_then(|bytes| Image::from_bytes(&bytes).ok())
        .unwrap_or(fallback)
}

/// Wrapper to store the expansion CheckMenuItem handle in Tauri managed state.
pub struct ExpansionCheckHandle(pub CheckMenuItem<tauri::Wry>);

/// Updates the tray "Text Expansion" check-mark to match the given state.
pub fn set_expansion_checked(app: &AppHandle, checked: bool) {
    if let Some(handle) = app.try_state::<ExpansionCheckHandle>() {
        let _ = handle.0.set_checked(checked);
    }
}

/// Computes the popup position relative to the tray icon rectangle.
///
/// - **macOS**: window opens *below* the menu bar.
/// - **Windows**: window opens *above* the taskbar tray area, or pins to
///   the bottom of the screen when the tray icon is in the overflow popup.
fn compute_popup_position(
    tray_x: f64,
    tray_y: f64,
    tray_w: f64,
    tray_h: f64,
    win_w: f64,
    win_h: f64,
    screen_h: f64,
) -> LogicalPosition<f64> {
    let x = tray_x - (win_w / 2.0) + (tray_w / 2.0);

    let y = if cfg!(target_os = "macos") {
        tray_y + tray_h
    } else if tray_y > screen_h * 0.7 {
        // Tray is near the bottom → open above it
        tray_y - win_h - 8.0
    } else {
        // Overflow popup area → pin to bottom with a taskbar offset
        screen_h - win_h - 52.0
    };

    LogicalPosition::new(x, y.max(0.0))
}

/// Builds and registers the system tray with a context menu and click handler.
pub fn build(app: &App) -> tauri::Result<()> {
    let expansion_item = CheckMenuItem::with_id(
        app,
        "expansion_toggle",
        "Text Expansion",
        true,
        crate::text_expand::is_enabled(),
        None::<&str>,
    )?;
    let settings_item = MenuItem::with_id(app, "settings", "Settings...", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    // Store handle so we can update the check-mark from settings sync
    app.manage(ExpansionCheckHandle(expansion_item.clone()));

    let menu = Menu::with_items(app, &[&expansion_item, &settings_item, &quit_item])?;

    let initial_theme = app
        .get_webview_window("main")
        .and_then(|w| w.theme().ok())
        .unwrap_or(Theme::Dark);

    let tray_builder = TrayIconBuilder::with_id("main-tray")
        .icon(icon_for_theme(app.handle(), initial_theme))
        .menu(&menu)
        .show_menu_on_left_click(false);

    // On macOS, mark as template so the OS handles light/dark tinting automatically.
    #[cfg(target_os = "macos")]
    let tray_builder = tray_builder.icon_as_template(true);

    tray_builder
        .on_menu_event(|app, event| match event.id.as_ref() {
            "expansion_toggle" => {
                let new_state = !crate::text_expand::is_enabled();
                crate::text_expand::set_enabled(new_state);
                // Notify frontend so the settings toggle stays in sync
                let _ = app.emit("expansion-toggled", new_state);
            }
            "settings" => window::open_settings(app),
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(handle_tray_click)
        .build(app)?;

    Ok(())
}

/// Handles a left-click on the tray icon: toggles the popup window.
fn handle_tray_click(tray: &tauri::tray::TrayIcon, event: TrayIconEvent) {
    let TrayIconEvent::Click {
        button: MouseButton::Left,
        button_state: MouseButtonState::Up,
        rect,
        ..
    } = event
    else {
        return;
    };

    let app = tray.app_handle();
    let Some(win) = app.get_webview_window("main") else {
        return;
    };

    if win.is_visible().unwrap_or(false) {
        let _ = win.hide();
        return;
    }

    let scale = win.scale_factor().unwrap_or(1.0);
    let tray_pos = rect.position.to_logical::<f64>(scale);
    let tray_size = rect.size.to_logical::<f64>(scale);

    let win_h = win
        .inner_size()
        .map(|s| s.to_logical::<f64>(scale).height)
        .unwrap_or(window::MAIN_HEIGHT);

    let screen_h = win
        .current_monitor()
        .ok()
        .flatten()
        .map(|m| m.size().to_logical::<f64>(scale).height)
        .unwrap_or(1080.0);

    let pos = compute_popup_position(
        tray_pos.x,
        tray_pos.y,
        tray_size.width,
        tray_size.height,
        window::MAIN_WIDTH,
        win_h,
        screen_h,
    );

    mark_opened();

    let _ = win.set_position(pos);
    let _ = win.show();
    let _ = win.set_focus();
}
