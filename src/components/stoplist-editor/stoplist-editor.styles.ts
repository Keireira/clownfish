import styled from 'styled-components';

export const SettingRow = styled.div<{ $dimmed?: boolean }>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 16px;
	border-top: 1px solid var(--border);
	opacity: ${(p) => (p.$dimmed ? 0.4 : 1)};
	transition: opacity 0.2s;

	&:first-child {
		border-top: none;
	}
`;

export const SettingLabel = styled.span`
	font-size: 13px;
	color: var(--text-primary);
`;

export const ToggleGroup = styled.label<{ $dimmed?: boolean }>`
	display: flex;
	align-items: center;
	gap: 7px;
	cursor: ${(p) => (p.$dimmed ? 'default' : 'pointer')};
	opacity: ${(p) => (p.$dimmed ? 0.3 : 1)};
	transition: opacity 0.2s;
	pointer-events: ${(p) => (p.$dimmed ? 'none' : 'auto')};
`;

export const ToggleTrack = styled.span<{ $on: boolean }>`
	position: relative;
	display: inline-block;
	width: 34px;
	height: 20px;
	border-radius: 10px;
	background: ${(p) => (p.$on ? 'var(--accent)' : 'var(--fill-hover)')};
	transition: background 0.2s;
	flex-shrink: 0;
`;

export const ToggleKnob = styled.span<{ $on: boolean }>`
	position: absolute;
	top: 2px;
	left: 2px;
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background: #fff;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	transition: transform 0.2s;
	pointer-events: none;
	transform: ${(p) => (p.$on ? 'translateX(14px)' : 'translateX(0)')};
`;

export const DetailPanel = styled.div`
	padding: 14px 16px;
	border-top: 1px solid var(--border);
	display: flex;
	gap: 20px;
	align-items: flex-start;
`;

export const DetailSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

export const DetailLabel = styled.span`
	font-size: 10px;
	font-weight: 600;
	color: var(--text-label);
	text-transform: uppercase;
	letter-spacing: 0.4px;
	margin-bottom: 2px;
`;

export const CompassGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 26px);
	grid-template-rows: repeat(3, 22px);
	gap: 2px;
`;

export const CompassCell = styled.button<{ $active: boolean }>`
	all: unset;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 4px;
	font-size: 9px;
	font-weight: 600;
	cursor: pointer;
	background: ${(p) => (p.$active ? 'var(--accent)' : 'var(--fill-light)')};
	color: ${(p) => (p.$active ? '#fff' : 'var(--text-muted)')};
	border: 1px solid ${(p) => (p.$active ? 'var(--accent)' : 'var(--border)')};
	transition:
		background 0.15s,
		border-color 0.15s;

	&:hover {
		background: ${(p) => (p.$active ? 'var(--accent)' : 'var(--fill-hover)')};
	}
`;

export const OffsetGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 4px;
`;

export const OffsetCell = styled.label`
	display: flex;
	align-items: center;
	gap: 4px;
`;

export const OffsetCellLabel = styled.span`
	font-size: 9px;
	font-weight: 600;
	color: var(--text-faint);
	width: 30px;
	text-align: right;
`;

export const OffsetInput = styled.input`
	width: 40px;
	padding: 2px 4px;
	border: 1px solid var(--border);
	border-radius: 4px;
	background: var(--fill-light);
	color: var(--text-primary);
	font-size: 11px;
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	text-align: right;
	outline: none;
	transition: border-color 0.15s;

	&:focus {
		border-color: var(--accent);
	}

	&::-webkit-outer-spin-button,
	&::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
`;

// Per-app autocorrect rules

export const AcSection = styled.div`
	padding: 10px 16px;
	border-top: 1px solid var(--border);
`;

export const AcRow = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 3px 0;
`;

export const AcPattern = styled.span`
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	font-size: 12px;
	color: var(--text-primary);
	min-width: 32px;
	text-align: right;
	flex-shrink: 0;
`;

export const AcArrow = styled.span`
	font-size: 10px;
	color: var(--text-faint);
	flex-shrink: 0;
`;

export const AcReplacement = styled.span`
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	font-size: 14px;
	color: var(--text-primary);
	flex: 1;
`;

export const AcDeleteBtn = styled.button`
	all: unset;
	font-size: 13px;
	color: var(--text-faint);
	cursor: pointer;
	padding: 0 3px;
	border-radius: 3px;
	line-height: 1;
	opacity: 0;
	transition: opacity 0.15s;

	${AcRow}:hover & {
		opacity: 1;
	}

	&:hover {
		color: var(--text-primary);
		background: var(--fill-hover);
	}
`;

export const AcAddRow = styled.div`
	display: flex;
	align-items: center;
	gap: 4px;
	margin-top: 6px;
`;

export const AcInput = styled.input`
	flex: 1;
	min-width: 0;
	padding: 3px 6px;
	border: 1px solid var(--border);
	border-radius: 4px;
	background: var(--fill-light);
	color: var(--text-primary);
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	font-size: 11px;
	outline: none;
	transition: border-color 0.15s;

	&:focus {
		border-color: var(--accent);
	}

	&::placeholder {
		color: var(--text-faint);
	}
`;

export const AcAddBtn = styled.button`
	all: unset;
	font-size: 14px;
	font-weight: 600;
	color: var(--accent);
	cursor: pointer;
	padding: 2px 8px;
	border-radius: 4px;

	&:hover {
		background: var(--fill-light);
	}

	&:disabled {
		opacity: 0.3;
		cursor: default;
	}
`;

export const DropOverlay = styled.div`
	position: absolute;
	inset: 0;
	z-index: 50;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2px dashed var(--accent-border);
	border-radius: var(--radius-m);
	background: color-mix(in srgb, var(--accent) 8%, transparent);
	color: var(--accent);
	font-size: 12px;
	font-weight: 500;
	pointer-events: none;
`;
