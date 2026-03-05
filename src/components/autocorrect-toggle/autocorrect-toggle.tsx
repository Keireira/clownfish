import { useState, useEffect } from 'react';
import ToggleRoot, { Knob } from '../autostart-toggle/autostart-toggle.styles';
import { invoke } from '@tauri-apps/api/core';
import { saveAutocorrectEnabled } from '../../store';

const AutocorrectToggle = () => {
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		invoke<boolean>('autocorrect_is_enabled')
			.then(setEnabled)
			.catch(() => {});
	}, []);

	const handleToggle = async () => {
		const newVal = !enabled;
		await invoke('autocorrect_set_enabled', { enabled: newVal });
		setEnabled(newVal);
		await saveAutocorrectEnabled(newVal);
	};

	return (
		<ToggleRoot $active={enabled} onClick={handleToggle} role="switch" aria-checked={enabled}>
			<Knob $active={enabled} />
		</ToggleRoot>
	);
};

export default AutocorrectToggle;
