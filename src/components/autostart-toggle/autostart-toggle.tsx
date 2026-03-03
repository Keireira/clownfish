import { useState, useEffect } from 'react';
import Root, { Knob } from './autostart-toggle.styles';
import { invoke } from '@tauri-apps/api/core';

const AutostartToggle = () => {
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		invoke<boolean>('autostart_is_enabled').then(setEnabled);
	}, []);

	const handleToggle = async () => {
		try {
			if (enabled) {
				await invoke('autostart_disable');
				setEnabled(false);
			} else {
				await invoke('autostart_enable');
				setEnabled(true);
			}
		} catch (e) {
			console.error('Autostart toggle failed:', e);
		}
	};

	return (
		<Root $active={enabled} onClick={handleToggle} role="switch" aria-checked={enabled}>
			<Knob $active={enabled} />
		</Root>
	);
};

export default AutostartToggle;
