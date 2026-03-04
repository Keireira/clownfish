/** Emits a Tauri event to all windows, swallowing errors gracefully. */
export async function emitEvent(name: string, payload?: unknown): Promise<void> {
	try {
		const { emit } = await import('@tauri-apps/api/event');
		await emit(name, payload);
	} catch (err) {
		console.error(`Failed to emit '${name}':`, err);
	}
}
