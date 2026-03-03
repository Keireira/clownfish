#[cfg(target_os = "macos")]
mod login_item {
    use objc2_service_management::SMAppService;

    pub fn is_enabled() -> bool {
        let service = unsafe { SMAppService::mainAppService() };
        unsafe { service.status() }.0 == 1 // SMAppServiceStatusEnabled
    }

    pub fn set_enabled(enable: bool) -> Result<(), String> {
        let service = unsafe { SMAppService::mainAppService() };
        if enable {
            unsafe { service.registerAndReturnError() }.map_err(|e| format!("{e}"))
        } else {
            unsafe { service.unregisterAndReturnError() }.map_err(|e| format!("{e}"))
        }
    }
}

use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    window::{Effect, EffectState, EffectsBuilder},
    AppHandle, LogicalPosition, Manager, WebviewUrl, WebviewWindowBuilder,
};

/// Timestamp (millis) of the last tray-click that opened the window.
/// The blur handler ignores focus-loss within a short grace period after opening,
/// preventing the "blink" where the window shows and immediately hides.
static LAST_OPEN: AtomicU64 = AtomicU64::new(0);

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}

fn open_settings(app: &AppHandle) {
    if let Some(win) = app.get_webview_window("settings") {
        let _ = win.show();
        let _ = win.set_focus();
    } else {
        let effects = EffectsBuilder::new()
            .effects(vec![
                // macOS: standard window vibrancy
                Effect::WindowBackground,
                // Windows 11/10 fallbacks
                Effect::Mica,
                Effect::Acrylic,
            ])
            .state(EffectState::Active)
            .build();

        let _ = WebviewWindowBuilder::new(app, "settings", WebviewUrl::default())
            .title("Hot Symbols Settings")
            .inner_size(660.0, 520.0)
            .min_inner_size(550.0, 400.0)
            .transparent(true)
            .effects(effects)
            .center()
            .build();
    }
}

#[tauri::command]
fn open_settings_cmd(app: AppHandle) {
    open_settings(&app);
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn autostart_is_enabled() -> bool {
    login_item::is_enabled()
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn autostart_enable() -> Result<(), String> {
    login_item::set_enabled(true)
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn autostart_disable() -> Result<(), String> {
    login_item::set_enabled(false)
}

#[cfg(not(target_os = "macos"))]
#[tauri::command]
fn autostart_is_enabled() -> bool {
    false
}

#[cfg(not(target_os = "macos"))]
#[tauri::command]
fn autostart_enable() -> Result<(), String> {
    Ok(())
}

#[cfg(not(target_os = "macos"))]
#[tauri::command]
fn autostart_disable() -> Result<(), String> {
    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            open_settings_cmd,
            autostart_is_enabled,
            autostart_enable,
            autostart_disable,
        ])
        .setup(|app| {
            // Hide dock icon on macOS
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            // Build glass effects per-platform
            let effects = EffectsBuilder::new()
                .effects(vec![
                    // macOS: dark HUD vibrancy (darker than Popover)
                    Effect::HudWindow,
                    // Windows 11: Mica, falls back to Acrylic on Windows 10
                    Effect::Mica,
                    Effect::Acrylic,
                ])
                .state(EffectState::Active)
                .radius(12.0)
                .build();

            // Create the main window (hidden by default)
            let _window = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                .title("Hot Symbols")
                .inner_size(420.0, 520.0)
                .decorations(false)
                .transparent(true)
                .visible(false)
                .always_on_top(true)
                .skip_taskbar(true)
                .focused(false)
                .resizable(false)
                .effects(effects)
                .build()?;

            // Build right-click context menu
            let settings_item =
                MenuItem::with_id(app, "settings", "Settings...", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&settings_item, &quit_item])?;

            // Build tray icon
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "settings" => {
                        open_settings(app);
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        rect,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                // Get the monitor scale factor for correct positioning
                                let scale = window.scale_factor().unwrap_or(1.0);
                                let tray_pos = rect.position.to_logical::<f64>(scale);
                                let tray_size = rect.size.to_logical::<f64>(scale);

                                let window_width = 420.0_f64;
                                let x = tray_pos.x - (window_width / 2.0) + (tray_size.width / 2.0);
                                let y = tray_pos.y + tray_size.height;

                                // Record open time so blur handler won't immediately hide
                                LAST_OPEN.store(now_ms(), Ordering::Relaxed);

                                let _ = window.set_position(LogicalPosition::new(x, y));
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;

            // Hide window when it loses focus, but not right after opening
            let win = app.get_webview_window("main").unwrap();
            let win_clone = win.clone();
            win.on_window_event(move |event| {
                if let tauri::WindowEvent::Focused(false) = event {
                    let elapsed = now_ms() - LAST_OPEN.load(Ordering::Relaxed);
                    if elapsed > 500 {
                        let _ = win_clone.hide();
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
