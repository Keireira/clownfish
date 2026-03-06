import { useState, useEffect } from 'react';
import ToggleRoot, { Knob } from '../autostart-toggle/autostart-toggle.styles';
import { invoke } from '@tauri-apps/api/core';
import { saveVariablesEnabled } from '../../store';

const VariablesToggle = () => {
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		invoke<boolean>('expansion_is_variables_enabled')
			.then(setEnabled)
			.catch(() => {});
	}, []);

	const handleToggle = async () => {
		const newVal = !enabled;
		await invoke('expansion_set_variables_enabled', { enabled: newVal });
		setEnabled(newVal);
		await saveVariablesEnabled(newVal);
	};

	return (
		<ToggleRoot $active={enabled} onClick={handleToggle} role="switch" aria-checked={enabled}>
			<Knob $active={enabled} />
		</ToggleRoot>
	);
};

export default VariablesToggle;
