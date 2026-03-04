import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { loadHintsPosition, saveHintsPosition, type HintsPosition } from '../../store';
import { useLanguage } from '../../i18n';
import styled from 'styled-components';

const Wrapper = styled.div`
	display: flex;
	gap: 4px;
	background: var(--fill);
	border-radius: 8px;
	padding: 2px;
`;

const Option = styled.button<{ $active: boolean }>`
	all: unset;
	font-size: 12px;
	padding: 4px 10px;
	border-radius: 6px;
	cursor: pointer;
	white-space: nowrap;
	color: ${(p) => (p.$active ? 'var(--text-primary)' : 'var(--text-secondary)')};
	background: ${(p) => (p.$active ? 'var(--glass-bg)' : 'transparent')};
	box-shadow: ${(p) => (p.$active ? '0 1px 3px rgba(0,0,0,.12)' : 'none')};
	transition: all 0.15s ease;

	&:hover {
		color: var(--text-primary);
	}
`;

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
