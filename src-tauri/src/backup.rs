//! Simple file read/write commands for settings backup export/import.
//! Bypasses the fs plugin scope so the user can pick any path via the dialog.

#[tauri::command]
pub async fn backup_write_file(path: String, contents: String) -> Result<(), String> {
    std::fs::write(&path, &contents).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn backup_read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| e.to_string())
}
