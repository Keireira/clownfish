import { useState, useEffect } from 'react';
import ToggleRoot, { Knob } from '../autostart-toggle/autostart-toggle.styles';
import { invoke } from '@tauri-apps/api/core';
import { saveUnicodeHints } from '../../store';

const UnicodeHintsToggle = () => {
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		invoke<boolean>('expansion_is_unicode_hints')
			.then(setEnabled)
			.catch(() => {});
	}, []);

	const handleToggle = async () => {
		const newVal = !enabled;
		await invoke('expansion_set_unicode_hints', { enabled: newVal });
		setEnabled(newVal);
		await saveUnicodeHints(newVal);
	};

	return (
		<ToggleRoot $active={enabled} onClick={handleToggle} role="switch" aria-checked={enabled}>
			<Knob $active={enabled} />
		</ToggleRoot>
	);
};

export default UnicodeHintsToggle;
