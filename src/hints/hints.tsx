import { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import type { Shortcut } from '../types';

interface HintsPayload {
	hints: Shortcut[];
	caret: [number, number] | null;
	selected: number;
}

const styles = {
	root: {
		background: 'var(--glass-bg)',
		border: '1px solid var(--border-strong)',
		borderRadius: '12px',
		boxShadow: '0 4px 20px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06)',
		padding: '8px 18px 12px 8px',
		display: 'inline-flex',
		gap: '6px',
		fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
		color: 'var(--text-primary)',
	} as const,
	cell: {
		width: '32px',
		height: '32px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: '8px',
		cursor: 'pointer',
		fontSize: '17px',
		flexShrink: 0,
		transition: 'background 0.1s',
	} as const,
	cellSelected: {
		background: 'var(--accent)',
		color: '#fff',
		borderRadius: '8px',
	} as const,
	cellHover: {
		background: 'var(--fill)',
	} as const,
};

const globalCss = `
	* { margin: 0; padding: 0; box-sizing: border-box; }
	html, body, #root {
		background: transparent;
		margin: 0; padding: 0; height: 100%;
		overflow: hidden;
		user-select: none;
		-webkit-user-select: none;
	}
`;

const HintCell = ({
	hint,
	selected,
	onApply,
}: {
	hint: Shortcut;
	selected: boolean;
	onApply: () => void;
}) => {
	const [hovered, setHovered] = useState(false);

	const style = {
		...styles.cell,
		...(selected ? styles.cellSelected : hovered ? styles.cellHover : {}),
	};

	return (
		<div
			style={style}
			title={hint.trigger}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onClick={onApply}
		>
			{hint.expansion}
		</div>
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
		return () => { unlisten.then((fn) => fn()); };
	}, []);

	const handleApply = (expansion: string) => {
		invoke('expansion_apply_hint', { expansion }).catch(() => {});
	};

	if (hints.length === 0) return null;

	return (
		<>
			<style>{globalCss}</style>
			<div style={styles.root}>
				{hints.map((h, i) => (
					<HintCell
						key={h.trigger}
						hint={h}
						selected={i === selected}
						onApply={() => handleApply(h.expansion)}
					/>
				))}
			</div>
		</>
	);
};

export default Hints;
