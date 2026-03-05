import styled, { css } from 'styled-components';

const focusVisible = css`
	&:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: -2px;
	}
`;

export default styled.div`
	width: 200px;
	min-width: 200px;
	border-right: none;
	background: transparent;
	display: flex;
	flex-direction: column;
	padding: 6px 0;
	overflow-y: auto;
	overflow-x: hidden;
`;

export const SectionItems = styled.div`
	padding: 4px 10px;
	display: flex;
	flex-direction: column;
	gap: 2px;
`;

export const SectionItem = styled.div<{ $active: boolean }>`
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 16px;
	border-radius: 10px;
	cursor: pointer;
	transition:
		background 0.15s,
		color 0.15s;
	color: ${(p) => (p.$active ? 'var(--text-bright)' : 'var(--text-muted)')};
	background: transparent;
	position: relative;

	&::before {
		content: '';
		position: absolute;
		left: 0;
		top: 6px;
		bottom: 6px;
		width: 3px;
		border-radius: 2px;
		background: ${(p) => (p.$active ? 'var(--accent)' : 'transparent')};
		transition: background 0.15s;
	}

	&:hover {
		color: var(--text-bright);
		background: ${(p) => (p.$active ? 'transparent' : 'var(--fill-subtle)')};
	}

	${focusVisible}
`;

export const SectionLabel = styled.span`
	font-size: 13px;
	font-weight: 500;
	flex: 1;
`;

export const Divider = styled.div`
	border-top: 1px solid var(--border);
	margin: 8px 16px;
	opacity: 0.5;
`;

export const GroupChevron = styled.span<{ $open: boolean }>`
	font-size: 8px;
	transition: transform 0.15s;
	transform: rotate(${(p) => (p.$open ? '90deg' : '0deg')});
	color: var(--text-hint);
	line-height: 1;
`;

export const GroupHeader = styled.button<{ $open?: boolean }>`
	all: unset;
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 10px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	color: var(--text-hint);
	padding: 6px 16px 6px;
	cursor: pointer;
	user-select: none;
	transition: color 0.15s;
	border-radius: 6px;

	&:hover {
		color: var(--text-muted);
	}

	${focusVisible}
`;

export const Collapsible = styled.div<{ $open: boolean }>`
	display: grid;
	grid-template-rows: ${(p) => (p.$open ? '1fr' : '0fr')};
	transition: grid-template-rows 0.2s ease;

	& > div {
		overflow: hidden;
	}
`;

export const GroupItems = styled.div`
	overflow-y: auto;
	padding: 0 10px 2px;
	display: flex;
	flex-direction: column;
	gap: 1px;
`;

export const CatItem = styled.div<{ $active: boolean; $dragging: boolean }>`
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 9px 16px;
	border-radius: 10px;
	cursor: pointer;
	font-size: 13px;
	position: relative;
	transition:
		background 0.15s,
		color 0.15s,
		opacity 0.12s;
	color: ${(p) => (p.$active ? 'var(--text-bright)' : 'var(--text-muted)')};
	background: transparent;
	opacity: ${(p) => (p.$dragging ? 0.4 : 1)};
	user-select: none;

	&::before {
		content: '';
		position: absolute;
		left: 0;
		top: 6px;
		bottom: 6px;
		width: 3px;
		border-radius: 2px;
		background: ${(p) => (p.$active ? 'var(--accent)' : 'transparent')};
		transition: background 0.15s;
	}

	&:hover {
		color: var(--text-bright);
		background: ${(p) => (p.$active ? 'transparent' : 'var(--fill-subtle)')};
	}

	${focusVisible}
`;

export const CatGrip = styled.span`
	font-size: 11px;
	color: var(--text-hint);
	cursor: grab;
	visibility: hidden;
	user-select: none;
	line-height: 1;
	flex-shrink: 0;

	${CatItem}:hover & {
		visibility: visible;
	}

	&:active {
		cursor: grabbing;
	}
`;

export const CatName = styled.span`
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-weight: 500;
`;

export const CatCount = styled.span`
	font-size: 10px;
	color: var(--text-placeholder);
	min-width: 16px;
	text-align: right;
`;

export const CatDeleteBtn = styled.button`
	background: none;
	border: none;
	color: var(--text-hint);
	font-size: 16px;
	cursor: pointer;
	padding: 0 2px;
	line-height: 1;
	visibility: hidden;

	${CatItem}:hover & {
		visibility: visible;
	}

	&:hover {
		color: var(--red);
	}
`;

export const CatPlaceholder = styled.div`
	border-radius: 10px;
	border: 1.5px dashed var(--border-medium);
	background: var(--fill-subtle);
	padding: 8px 16px 8px 28px;
	box-sizing: border-box;
	font-size: 13px;
	color: var(--text-disabled);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const DragGhost = styled.div`
	position: fixed;
	pointer-events: none;
	z-index: 9999;
	padding: 8px 14px;
	border-radius: 10px;
	background: var(--sidebar-bg);
	border: 1px solid var(--border);
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
	font-size: 13px;
	color: var(--text-secondary);
	opacity: 0.9;
	white-space: nowrap;
	max-width: 180px;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const AppItem = styled.div<{ $active: boolean }>`
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 9px 16px;
	border-radius: 10px;
	cursor: pointer;
	font-size: 12px;
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	position: relative;
	transition:
		background 0.15s,
		color 0.15s;
	color: ${(p) => (p.$active ? 'var(--text-bright)' : 'var(--text-muted)')};
	background: transparent;

	&::before {
		content: '';
		position: absolute;
		left: 0;
		top: 6px;
		bottom: 6px;
		width: 3px;
		border-radius: 2px;
		background: ${(p) => (p.$active ? 'var(--accent)' : 'transparent')};
		transition: background 0.15s;
	}

	&:hover {
		color: var(--text-bright);
		background: ${(p) => (p.$active ? 'transparent' : 'var(--fill-subtle)')};
	}

	${focusVisible}
`;

export const AppDeleteBtn = styled.button`
	all: unset;
	cursor: pointer;
	color: var(--text-hint);
	font-size: 14px;
	line-height: 1;
	padding: 0 2px;
	visibility: hidden;

	${AppItem}:hover & {
		visibility: visible;
	}

	&:hover {
		color: var(--red);
	}
`;

export const EmptyApps = styled.p`
	font-size: 11px;
	color: var(--text-disabled);
	text-align: center;
	padding: 12px 8px;
`;

export const AddBtn = styled.button`
	margin: 4px 10px;
	padding: 8px;
	background: transparent;
	border: 1px dashed var(--border);
	border-radius: 10px;
	color: var(--text-hint);
	font-size: 12px;
	cursor: pointer;
	transition:
		background 0.15s,
		color 0.15s,
		border-color 0.15s;

	&:hover {
		background: var(--fill-subtle);
		color: var(--text-bright);
		border-color: var(--border-medium);
	}

	${focusVisible}
`;

export const DropdownWrap = styled.div`
	position: relative;
`;

export const Dropdown = styled.div`
	position: fixed;
	z-index: 100;
	width: min(340px, calc(100vw - 20px));
	max-height: min(260px, calc(100vh - 20px));
	overflow: hidden;
	background: var(--bg-elevated);
	border: 1px solid var(--border-medium);
	border-radius: 12px;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
	display: flex;
	flex-direction: column;
`;

export const SearchInput = styled.input`
	padding: 10px 12px;
	border: none;
	border-bottom: 1px solid var(--border);
	background: transparent;
	color: var(--text-primary);
	font-size: 12px;
	outline: none;
`;

export const DropAppList = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: 4px;
`;

export const DropAppRow = styled.button<{ $disabled?: boolean; $highlighted?: boolean }>`
	all: unset;
	display: flex;
	align-items: center;
	gap: 8px;
	width: 100%;
	box-sizing: border-box;
	padding: 7px 10px;
	border-radius: 8px;
	cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
	opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
	font-size: 12px;
	transition: background 0.1s;
	background: ${({ $disabled, $highlighted }) => (!$disabled && $highlighted ? 'var(--fill-hover)' : 'transparent')};

	&:hover {
		background: ${({ $disabled }) => ($disabled ? 'transparent' : 'var(--fill-hover)')};
	}
`;

export const DropAppExe = styled.span`
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	font-size: 11px;
	color: var(--text-primary);
	white-space: nowrap;
`;

export const DropAppTitle = styled.span`
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

export const BottomSpacer = styled.div`
	flex: 1;
`;

export const ShortcutsItem = styled.div<{ $active: boolean }>`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 9px 16px;
	border-radius: 10px;
	cursor: pointer;
	font-size: 13px;
	font-weight: 600;
	position: relative;
	transition:
		background 0.15s,
		color 0.15s;
	color: ${(p) => (p.$active ? 'var(--text-bright)' : 'var(--text-muted)')};
	background: transparent;
	user-select: none;

	&::before {
		content: '';
		position: absolute;
		left: 0;
		top: 6px;
		bottom: 6px;
		width: 3px;
		border-radius: 2px;
		background: ${(p) => (p.$active ? 'var(--accent)' : 'transparent')};
		transition: background 0.15s;
	}

	&:hover {
		color: var(--text-bright);
		background: ${(p) => (p.$active ? 'transparent' : 'var(--fill-subtle)')};
	}

	${focusVisible}
`;

export const ShortcutsIcon = styled.span`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 18px;
	height: 18px;
	border-radius: 5px;
	background: var(--fill);
	color: var(--text-hint);
	font-size: 10px;
	flex-shrink: 0;
	line-height: 1;
`;

export const CatSubLabel = styled.span`
	font-size: 9px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	color: var(--text-disabled);
	padding: 8px 16px 2px;
	user-select: none;
`;

export const PluginGroupHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 6px 16px 6px;
	user-select: none;
`;

export const PluginGroupName = styled.button`
	all: unset;
	flex: 1;
	font-size: 10px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	color: var(--text-hint);
	cursor: pointer;
	transition: color 0.15s;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	border-radius: 4px;

	&:hover {
		color: var(--text-muted);
	}

	${focusVisible}
`;

export const PluginGroupRight = styled.div`
	display: flex;
	align-items: center;
	gap: 4px;
	flex-shrink: 0;
`;

export const PluginToggle = styled.input`
	width: 28px;
	height: 16px;
	appearance: none;
	background: var(--fill);
	border-radius: 8px;
	position: relative;
	cursor: pointer;
	transition: background 0.2s;
	flex-shrink: 0;

	&::after {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--text-hint);
		transition:
			transform 0.2s,
			background 0.2s;
	}

	&:checked {
		background: var(--accent);
	}

	&:checked::after {
		transform: translateX(12px);
		background: #fff;
	}

	${focusVisible}
`;
