import styled from 'styled-components';

/* ---- Layout ---- */

export const Root = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	position: relative;
`;

export const Label = styled.label`
	display: block;
	font-size: 11px;
	font-weight: 600;
	color: var(--text-label);
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

export const Table = styled.div`
	display: flex;
	flex-direction: column;
	gap: 6px;
`;

/* ---- Card per app ---- */

export const Card = styled.div`
	background: var(--card-bg);
	border: 1px solid var(--border);
	border-radius: var(--radius-m);
	overflow: hidden;
	transition: border-color 0.15s;

	&:hover {
		border-color: var(--border-medium);
	}

	&:hover button[data-delete] {
		opacity: 1;
	}
`;

export const CardHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 12px 0;
`;

export const CardBody = styled.div`
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 8px 12px 10px 34px;
`;

export const ExpandBtn = styled.button`
	all: unset;
	cursor: pointer;
	color: var(--text-faint);
	font-size: 10px;
	line-height: 1;
	padding: 2px;
	width: 14px;
	text-align: center;
	border-radius: 4px;
	flex-shrink: 0;
	transition:
		background 0.15s,
		color 0.15s;

	&:hover {
		background: var(--fill-hover);
		color: var(--text-secondary);
	}
`;

export const Exe = styled.span`
	flex: 1;
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	font-size: 12px;
	font-weight: 500;
	color: var(--text-primary);
`;

export const DeleteBtn = styled.button`
	all: unset;
	cursor: pointer;
	color: var(--text-faint);
	font-size: 14px;
	line-height: 1;
	opacity: 0;
	transition:
		opacity 0.15s,
		color 0.15s;
	padding: 2px;
	border-radius: 4px;

	&:hover {
		color: var(--red);
	}
`;

/* ---- Toggle switch ---- */

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

export const ToggleText = styled.span`
	font-size: 11px;
	color: var(--text-muted);
	white-space: nowrap;
`;

/* ---- Drop overlay ---- */

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

export const AddBtn = styled.button`
	padding: 8px 14px;
	font-size: 12px;
	font-weight: 500;
	background: transparent;
	color: var(--text-faint);
	border: 1px dashed var(--border-medium);
	border-radius: var(--radius-s);
	cursor: pointer;
	align-self: flex-start;
	transition:
		background 0.15s,
		color 0.15s,
		border-color 0.15s;

	&:hover {
		background: var(--fill-light);
		color: var(--text-secondary);
		border-color: var(--border-hover);
	}
`;

export const EmptyState = styled.p`
	font-size: 12px;
	color: var(--text-disabled);
	text-align: center;
	padding: 20px 0;
`;

/* ---- Expandable detail panel ---- */

export const DetailPanel = styled.div`
	padding: 10px 12px 12px 34px;
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

/* ---- Compass grid ---- */

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

/* ---- Offset inputs ---- */

export const OffsetGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: 3px;
`;

export const OffsetRow = styled.label`
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 10px;
	color: var(--text-secondary);
`;

export const OffsetLabel = styled.span`
	width: 10px;
	font-weight: 600;
	font-size: 9px;
	text-transform: uppercase;
	color: var(--text-faint);
`;

export const OffsetInput = styled.input`
	width: 44px;
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

	/* Hide spin buttons */
	&::-webkit-outer-spin-button,
	&::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
`;

export const OffsetUnit = styled.span`
	font-size: 9px;
	color: var(--text-faint);
`;

/* ---- Dropdown ---- */

export const DropdownWrap = styled.div`
	position: relative;
	align-self: flex-start;
`;

export const Dropdown = styled.div`
	position: absolute;
	z-index: 100;
	bottom: calc(100% + 4px);
	left: 0;
	width: 340px;
	max-height: 260px;
	overflow: hidden;
	background: var(--bg-elevated);
	border: 1px solid var(--border-medium);
	border-radius: var(--radius-m);
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
	display: flex;
	flex-direction: column;
`;

export const SearchInput = styled.input`
	padding: 8px 10px;
	border: none;
	border-bottom: 1px solid var(--border);
	background: transparent;
	color: var(--text-primary);
	font-size: 12px;
	outline: none;
`;

export const AppList = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: 4px;
`;

export const AppRow = styled.button<{ $disabled?: boolean }>`
	all: unset;
	display: flex;
	align-items: center;
	gap: 8px;
	width: 100%;
	box-sizing: border-box;
	padding: 6px 8px;
	border-radius: 6px;
	cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
	opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
	font-size: 12px;
	transition: background 0.1s;

	&:hover {
		background: ${({ $disabled }) => ($disabled ? 'transparent' : 'var(--fill-hover)')};
	}
`;

export const AppExe = styled.span`
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	font-size: 11px;
	color: var(--text-primary);
	white-space: nowrap;
`;

export const AppTitle = styled.span`
	color: var(--text-faint);
	font-size: 11px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	flex: 1;
	min-width: 0;
`;

export const NoApps = styled.p`
	font-size: 12px;
	color: var(--text-disabled);
	text-align: center;
	padding: 16px 0;
`;
