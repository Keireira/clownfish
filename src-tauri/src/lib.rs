#[cfg(target_os = "macos")]
mod login_item {
    use objc2_service_management::SMAppService;

    pub fn is_enabled() -> bool {
        let service = unsafe { SMAppService::mainAppService() };
        unsafe { service.status() }.0 == 1
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
    image::Image,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    window::{Effect, EffectState, EffectsBuilder},
    AppHandle, LogicalPosition, Manager, Theme, WebviewUrl, WebviewWindowBuilder,
};

fn tray_icon_for_theme(app: &AppHandle, theme: Theme) -> Image<'static> {
    let path = app
        .path()
        .resource_dir()
        .expect("failed to resolve resource dir");
    let file = match theme {
        Theme::Dark => path.join("icons/tray-dark.png"),
        Theme::Light | _ => path.join("icons/tray-light.png"),
    };
    let fallback = app.default_window_icon().unwrap().clone().to_owned();
    std::fs::read(&file)
        .ok()
        .and_then(|bytes| Image::from_bytes(&bytes).ok())
        .unwrap_or(fallback)
}

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
    // Hide main (always-on-top) so it doesn't cover the settings window.
    if let Some(main_win) = app.get_webview_window("main") {
        let _ = main_win.hide();
    }

    if let Some(win) = app.get_webview_window("settings") {
        let _ = win.show();
        let _ = win.set_focus();
    }
}

#[tauri::command]
fn open_settings_cmd(app: AppHandle) {
    open_settings(&app);
}

#[tauri::command]
fn open_url_cmd(url: String) {
    let _ = open::that(url);
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
fn autostart_is_enabled(app: AppHandle) -> bool {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch().is_enabled().unwrap_or(false)
}

#[cfg(not(target_os = "macos"))]
#[tauri::command]
fn autostart_enable(app: AppHandle) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch().enable().map_err(|e| format!("{e}"))
}

#[cfg(not(target_os = "macos"))]
#[tauri::command]
fn autostart_disable(app: AppHandle) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch().disable().map_err(|e| format!("{e}"))
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .invoke_handler(tauri::generate_handler![
            open_settings_cmd,
            open_url_cmd,
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
                .radius(14.0)
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

            // Pre-create the settings window (hidden) so WebView2 is fully
            // initialised before the user ever clicks "Settings".
            // We intercept CloseRequested to hide instead of destroy.
            let settings_win = WebviewWindowBuilder::new(app, "settings", WebviewUrl::default())
                .title("Hot Symbols Settings")
                .initialization_script("window.__IS_SETTINGS_WINDOW__=true;")
                .inner_size(660.0, 520.0)
                .min_inner_size(550.0, 400.0)
                .center()
                .visible(false)
                .build()?;

            let sw = settings_win.clone();
            settings_win.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = sw.hide();
                }
            });

            // Build right-click context menu
            let settings_item =
                MenuItem::with_id(app, "settings", "Settings...", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&settings_item, &quit_item])?;

            // Build tray icon with theme-aware icon
            let initial_theme = app
                .get_webview_window("main")
                .and_then(|w| w.theme().ok())
                .unwrap_or(Theme::Dark);
            let _tray = TrayIconBuilder::with_id("main-tray")
                .icon(tray_icon_for_theme(app.handle(), initial_theme))
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

                                let win_w = 420.0_f64;
                                let win_h = window
                                    .inner_size()
                                    .map(|s| s.to_logical::<f64>(scale).height)
                                    .unwrap_or(520.0);

                                let x = tray_pos.x - (win_w / 2.0) + (tray_size.width / 2.0);

                                let y = if cfg!(target_os = "macos") {
                                    // macOS: menu bar at top → open below tray
                                    tray_pos.y + tray_size.height
                                } else {
                                    // Windows: open above tray icon
                                    // Use monitor work area to handle overflow tray & edge cases
                                    let screen_h = window
                                        .current_monitor()
                                        .ok()
                                        .flatten()
                                        .map(|m| m.size().to_logical::<f64>(scale).height)
                                        .unwrap_or(1080.0);

                                    // If tray is near screen bottom, position above it;
                                    // otherwise (overflow popup), use screen bottom with taskbar offset
                                    if tray_pos.y > screen_h * 0.7 {
                                        tray_pos.y - win_h - 8.0
                                    } else {
                                        screen_h - win_h - 52.0
                                    }
                                };

                                // Clamp to screen bounds
                                let y = y.max(0.0);

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

            // Hide window when it loses focus; update tray icon on theme change
            let win = app.get_webview_window("main").unwrap();
            let win_clone = win.clone();
            let app_handle = app.handle().clone();
            win.on_window_event(move |event| match event {
                tauri::WindowEvent::Focused(false) => {
                    let elapsed = now_ms() - LAST_OPEN.load(Ordering::Relaxed);
                    if elapsed > 500 {
                        let _ = win_clone.hide();
                    }
                }
                tauri::WindowEvent::ThemeChanged(theme) => {
                    if let Some(tray) = app_handle.tray_by_id("main-tray") {
                        let _ = tray.set_icon(Some(tray_icon_for_theme(&app_handle, *theme)));
                    }
                }
                _ => {}
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
