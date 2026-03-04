//! Hot Symbols – a menu-bar Unicode symbol picker.
//!
//! This crate provides the Tauri backend: system tray integration,
//! window management, clipboard access, and platform-specific autostart.

mod autostart;
mod tray;
mod window;

/// Initializes plugins, creates windows, and starts the Tauri event loop.
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .invoke_handler(tauri::generate_handler![
            window::open_settings_cmd,
            window::open_url_cmd,
            autostart::autostart_is_enabled,
            autostart::autostart_enable,
            autostart::autostart_disable,
        ])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            window::build_main(app)?;
            window::build_settings(app)?;
            tray::build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
