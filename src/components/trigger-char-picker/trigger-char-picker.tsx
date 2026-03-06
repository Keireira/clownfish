import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { loadTriggerChar, saveTriggerChar } from '../../store';
import { Wrapper, Option, CustomInput, CustomInputActive, Preview } from './trigger-char-picker.styles';
import type { Shortcut } from '../../types';

const PRESETS = ['\\', '/', ';', '#', '~', '$'];

type Props = {
	shortcuts: Shortcut[];
	onShortcutsChange: (shortcuts: Shortcut[]) => void;
};

const TriggerCharPicker = ({ shortcuts, onShortcutsChange }: Props) => {
	const [ch, setCh] = useState('\\');

	useEffect(() => {
		loadTriggerChar().then(setCh);
	}, []);

	const applyChange = async (newCh: string) => {
		if (newCh.length !== 1 || newCh === ch) return;
		const oldCh = ch;
		setCh(newCh);
		await saveTriggerChar(newCh);
		await invoke('expansion_set_trigger_char', { ch: newCh });

		// Re-wrap all shortcut triggers: replace old prefix with new one
		const updated = shortcuts.map((s) => {
			let trigger = s.trigger;
			if (trigger.startsWith(oldCh)) {
				trigger = newCh + trigger.slice(oldCh.length);
			}
			return { ...s, trigger };
		});
		onShortcutsChange(updated);
	};

	const isPreset = PRESETS.includes(ch);
	const InputTag = isPreset ? CustomInput : CustomInputActive;

	return (
		<Wrapper>
			{PRESETS.map((p) => (
				<Option key={p} $active={ch === p} onClick={() => applyChange(p)}>
					{p}
				</Option>
			))}
			<InputTag
				maxLength={1}
				value={isPreset ? '' : ch}
				placeholder="..."
				onChange={(e) => {
					const val = e.target.value;
					if (val.length === 1) applyChange(val);
				}}
			/>
			<Preview>{ch}alpha → α</Preview>
		</Wrapper>
	);
};

export default TriggerCharPicker;
