import { useState, useEffect } from 'react';
import ToggleRoot, { Knob } from '../autostart-toggle/autostart-toggle.styles';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { saveExpansionEnabled } from '../../store';
import { emitEvent } from '../../events';

const ExpansionToggle = () => {
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		invoke<boolean>('expansion_is_enabled')
			.then(setEnabled)
			.catch(() => {});

		// Sync when toggled from tray
		const unlisten = listen<boolean>('expansion-toggled', ({ payload }) => {
			setEnabled(payload);
			saveExpansionEnabled(payload);
		});
		return () => {
			unlisten.then((fn) => fn());
		};
	}, []);

	const handleToggle = async () => {
		const newVal = !enabled;
		await invoke('expansion_set_enabled', { enabled: newVal });
		setEnabled(newVal);
		await saveExpansionEnabled(newVal);
		// Notify tray to update its check mark
		await emitEvent('expansion-toggled', newVal);
	};

	return (
		<ToggleRoot $active={enabled} onClick={handleToggle} role="switch" aria-checked={enabled}>
			<Knob $active={enabled} />
		</ToggleRoot>
	);
};

export default ExpansionToggle;
