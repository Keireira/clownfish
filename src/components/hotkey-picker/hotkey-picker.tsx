import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { loadHotkey, saveHotkey } from '../../store';
import { useLanguage } from '../../i18n';
import { Wrapper, HotkeyDisplay, RecordingInput, Btn, ClearBtn } from './hotkey-picker.styles';

/** Returns true when the key event is modifier-only (no "real" key yet). */
function isModifierOnly(e: KeyboardEvent): boolean {
	return e.key === 'Control' || e.key === 'Shift' || e.key === 'Alt' || e.key === 'Meta';
}

/**
 * Builds a Tauri shortcut string from a keyboard event using the *physical*
 * key code (`e.code`), so the shortcut works on every keyboard layout.
 *
 * Examples: `"Ctrl+Shift+KeyA"`, `"Ctrl+Space"`, `"Alt+F1"`
 */
function formatShortcut(e: KeyboardEvent): string | null {
	if (isModifierOnly(e)) return null;

	const code = e.code;
	if (!code || code === 'Unidentified') return null;

	const parts: string[] = [];
	if (e.ctrlKey) parts.push('Ctrl');
	if (e.altKey) parts.push('Alt');
	if (e.shiftKey) parts.push('Shift');
	if (e.metaKey) parts.push('Super');

	// Require at least one modifier to avoid hijacking normal typing
	if (parts.length === 0) return null;

	parts.push(code);
	return parts.join('+');
}

/** Turns a Tauri shortcut string into a human-readable label. */
function displayShortcut(shortcut: string): string {
	return shortcut
		.replace(/Key([A-Z])/g, '$1')
		.replace(/Digit(\d)/g, '$1')
		.replace(/Numpad(\d)/g, 'Num$1')
		.replace('NumpadAdd', 'Num+')
		.replace('NumpadSubtract', 'Num-')
		.replace('NumpadMultiply', 'Num*')
		.replace('NumpadDivide', 'Num/')
		.replace('NumpadDecimal', 'Num.')
		.replace('NumpadEnter', 'NumEnter');
}

const HotkeyPicker = () => {
	const t = useLanguage();
	const [hotkey, setHotkey] = useState<string | null>(null);
	const [recording, setRecording] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		invoke<string | null>('get_global_hotkey')
			.then(setHotkey)
			.catch(() => {
				loadHotkey().then(setHotkey);
			});
	}, []);

	useEffect(() => {
		if (recording && inputRef.current) {
			inputRef.current.focus();
		}
	}, [recording]);

	const handleKeyDown = async (e: React.KeyboardEvent) => {
		e.preventDefault();
		e.stopPropagation();

		const shortcut = formatShortcut(e.nativeEvent);
		if (!shortcut) return;

		try {
			await invoke('set_global_hotkey', { shortcut });
			setHotkey(shortcut);
			await saveHotkey(shortcut);
		} catch (err) {
			console.error('Failed to set hotkey:', err);
		}
		setRecording(false);
	};

	const handleClear = async () => {
		try {
			await invoke('set_global_hotkey', { shortcut: null });
			setHotkey(null);
			await saveHotkey(null);
		} catch (err) {
			console.error('Failed to clear hotkey:', err);
		}
		setRecording(false);
	};

	const handleBlur = () => {
		setRecording(false);
	};

	if (recording) {
		return (
			<Wrapper>
				<RecordingInput
					ref={inputRef}
					readOnly
					placeholder={t('hotkey_recording') as string}
					onKeyDown={handleKeyDown}
					onBlur={handleBlur}
				/>
			</Wrapper>
		);
	}

	return (
		<Wrapper>
			{hotkey ? (
				<>
					<HotkeyDisplay>{displayShortcut(hotkey)}</HotkeyDisplay>
					<ClearBtn onClick={handleClear} title={t('hotkey_clear') as string}>
						&times;
					</ClearBtn>
				</>
			) : (
				<HotkeyDisplay style={{ color: 'var(--text-secondary)' }}>
					{t('hotkey_not_set')}
				</HotkeyDisplay>
			)}
			<Btn onClick={() => setRecording(true)}>{t('hotkey_record')}</Btn>
		</Wrapper>
	);
};

export default HotkeyPicker;
