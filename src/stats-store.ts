import { invoke } from '@tauri-apps/api/core';

export interface StatsData {
	char_usage: Record<string, number>;
	expansion_usage: Record<string, number>;
	daily: Record<string, { copies: number; expansions: number }>;
}

export async function loadStats(): Promise<StatsData> {
	try {
		return await invoke<StatsData>('stats_load');
	} catch (e) {
		console.error('Failed to load stats:', e);
	}
	return { char_usage: {}, expansion_usage: {}, daily: {} };
}

export async function recordCharCopy(char: string): Promise<void> {
	await invoke('stats_record_char', { ch: char });
}

export async function resetStats(): Promise<void> {
	await invoke('stats_reset');
}
