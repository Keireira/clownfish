//! Hot Symbols – a menu-bar Unicode symbol picker.
//!
//! This crate provides the Tauri backend: system tray integration,
//! window management, clipboard access, and platform-specific autostart.

mod autostart;
mod backup;
mod hotkey;
mod text_expand;
mod tray;
mod window;

/// Initializes plugins, creates windows, and starts the Tauri event loop.
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_global_shortcut::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            window::open_settings_cmd,
            window::open_url_cmd,
            autostart::autostart_is_enabled,
            autostart::autostart_enable,
            autostart::autostart_disable,
            text_expand::expansion_set_enabled,
            text_expand::expansion_is_enabled,
            text_expand::expansion_update_shortcuts,
            text_expand::expansion_apply_hint,
            text_expand::expansion_set_hints_mode,
            text_expand::expansion_update_stoplist,
            text_expand::expansion_list_running_apps,
            text_expand::expansion_resolve_exe,
            text_expand::expansion_set_trigger_char,
            text_expand::expansion_set_unicode_hints,
            text_expand::expansion_is_unicode_hints,
            hotkey::set_global_hotkey,
            hotkey::get_global_hotkey,
            backup::backup_write_file,
            backup::backup_read_file,
        ])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            window::build_main(app)?;
            window::build_settings(app)?;
            window::build_hints(app)?;
            tray::build(app)?;
            text_expand::start_listener(app.handle());
            hotkey::init(app.handle());

            // Sync tray check-mark when the frontend toggles expansion
            {
                use tauri::Listener;
                let handle = app.handle().clone();
                app.listen("expansion-toggled", move |event: tauri::Event| {
                    if let Ok(enabled) = serde_json::from_str::<bool>(event.payload()) {
                        tray::set_expansion_checked(&handle, enabled);
                    }
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
