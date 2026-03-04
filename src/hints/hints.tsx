import { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

import Root, { Cell, HintsGlobalStyle } from './hints.styles';

import type { Shortcut } from '../types';
import type { HintsPayload } from './hints.d';

const HintCell = ({ hint, selected, onApply }: { hint: Shortcut; selected: boolean; onApply: () => void }) => {
	const [hovered, setHovered] = useState(false);

	return (
		<Cell
			$is_hovered={hovered}
			$is_selected={selected}
			title={hint.trigger}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onClick={onApply}
		>
			{hint.expansion}
		</Cell>
	);
};

const Hints = () => {
	const [hints, setHints] = useState<Shortcut[]>([]);
	const [selected, setSelected] = useState(-1);

	useEffect(() => {
		const unlisten = listen<HintsPayload>('expansion-hints', ({ payload }) => {
			setHints(payload.hints);
			setSelected(payload.selected);
		});
		return () => {
			unlisten.then((fn) => fn());
		};
	}, []);

	const handleApply = (expansion: string) => {
		invoke('expansion_apply_hint', { expansion }).catch(() => {});
	};

	if (!hints.length) {
		return null;
	}

	return (
		<>
			<HintsGlobalStyle />

			<Root>
				{hints.map((h, i) => (
					<HintCell key={h.trigger} hint={h} selected={i === selected} onApply={() => handleApply(h.expansion)} />
				))}
			</Root>
		</>
	);
};

export default Hints;
