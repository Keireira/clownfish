import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { loadHintsPosition, saveHintsPosition, type HintsPosition } from '../../store';
import { useLanguage } from '../../i18n';
import { Wrapper, Option } from './hints-position.styles';

const options: { value: HintsPosition; key: string }[] = [
	{ value: 'caret', key: 'hints_caret' },
	{ value: 'corner', key: 'hints_corner' },
	{ value: 'off', key: 'hints_off' },
];

const HintsPositionPicker = () => {
	const t = useLanguage();
	const [pos, setPos] = useState<HintsPosition>('caret');

	useEffect(() => {
		loadHintsPosition().then(setPos);
	}, []);

	const handleChange = async (value: HintsPosition) => {
		setPos(value);
		await saveHintsPosition(value);
		await invoke('expansion_set_hints_mode', { mode: value });
	};

	return (
		<Wrapper>
			{options.map((o) => (
				<Option
					key={o.value}
					$active={pos === o.value}
					onClick={() => handleChange(o.value)}
				>
					{t(o.key)}
				</Option>
			))}
		</Wrapper>
	);
};

export default HintsPositionPicker;
