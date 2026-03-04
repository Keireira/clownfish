//! Autostart / login-item management.
//!
//! On macOS, uses `SMAppService` for native login-item registration.
//! On other platforms, delegates to `tauri-plugin-autostart`.

#[cfg(target_os = "macos")]
mod login_item {
    use objc2_service_management::SMAppService;

    /// Checks whether the app is registered as a login item.
    pub fn is_enabled() -> bool {
        // SAFETY: `mainAppService` returns a shared singleton; `status()` is a
        // read-only query with no side effects.
        let service = unsafe { SMAppService::mainAppService() };
        unsafe { service.status() }.0 == 1
    }

    /// Registers or unregisters the app as a login item.
    pub fn set_enabled(enable: bool) -> Result<(), String> {
        // SAFETY: register/unregister are safe to call from the main thread
        // and return a descriptive `NSError` on failure.
        let service = unsafe { SMAppService::mainAppService() };
        if enable {
            unsafe { service.registerAndReturnError() }.map_err(|e| format!("{e}"))
        } else {
            unsafe { service.unregisterAndReturnError() }.map_err(|e| format!("{e}"))
        }
    }
}

/// Checks whether autostart is currently enabled.
#[cfg(target_os = "macos")]
#[tauri::command]
pub fn autostart_is_enabled() -> bool {
    login_item::is_enabled()
}

/// Enables autostart.
#[cfg(target_os = "macos")]
#[tauri::command]
pub fn autostart_enable() -> Result<(), String> {
    login_item::set_enabled(true)
}

/// Disables autostart.
#[cfg(target_os = "macos")]
#[tauri::command]
pub fn autostart_disable() -> Result<(), String> {
    login_item::set_enabled(false)
}

/// Checks whether autostart is currently enabled.
#[cfg(not(target_os = "macos"))]
#[tauri::command]
pub fn autostart_is_enabled(app: tauri::AppHandle) -> bool {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch().is_enabled().unwrap_or(false)
}

/// Enables autostart.
#[cfg(not(target_os = "macos"))]
#[tauri::command]
pub fn autostart_enable(app: tauri::AppHandle) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch().enable().map_err(|e| format!("{e}"))
}

/// Disables autostart.
#[cfg(not(target_os = "macos"))]
#[tauri::command]
pub fn autostart_disable(app: tauri::AppHandle) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch().disable().map_err(|e| format!("{e}"))
}
