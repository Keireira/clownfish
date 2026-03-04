import styled from 'styled-components';

export default styled.div`
	width: 200px;
	min-width: 200px;
	border-right: 1px solid var(--border);
	background: var(--sidebar-bg);
	display: flex;
	flex-direction: column;
`;

export const SectionItems = styled.div`
	padding: 8px;
	display: flex;
	flex-direction: column;
	gap: 2px;
`;

export const SectionItem = styled.div<{ $active: boolean }>`
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 9px 14px;
	border-radius: var(--radius-s);
	cursor: pointer;
	transition: background 0.12s;
	background: ${(p) => (p.$active ? 'var(--accent-bg-strong)' : 'transparent')};

	&:hover {
		background: ${(p) => (p.$active ? 'var(--accent-bg-strong)' : 'var(--fill-light)')};
	}
`;

export const SectionLabel = styled.span`
	font-size: 13px;
	flex: 1;
`;

export const Divider = styled.div`
	border-top: 1px solid var(--border);
	margin: 4px 8px;
`;

export const GroupHeader = styled.div`
	font-size: 10px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.4px;
	color: var(--text-label);
	padding: 8px 12px 4px;
`;

export const AppItems = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: 4px 8px 8px;
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

export const AppItem = styled.div<{ $active: boolean }>`
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 8px 12px;
	border-radius: var(--radius-s);
	cursor: pointer;
	font-size: 12px;
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	color: var(--text-primary);
	transition: background 0.12s;
	background: ${(p) => (p.$active ? 'var(--accent-bg-strong)' : 'transparent')};

	&:hover {
		background: ${(p) => (p.$active ? 'var(--accent-bg-strong)' : 'var(--fill-light)')};
	}
`;

export const EmptyApps = styled.p`
	font-size: 11px;
	color: var(--text-disabled);
	text-align: center;
	padding: 12px 8px;
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

export const AddBtn = styled.button`
	margin: 8px;
	padding: 8px;
	background: var(--fill-subtle);
	border: 1px dashed var(--border-medium);
	border-radius: 8px;
	color: var(--text-faint);
	font-size: 12px;
	cursor: pointer;
	transition:
		background 0.15s,
		color 0.15s;

	&:hover {
		background: var(--fill);
		color: var(--text-bright);
	}
`;

export const DropdownWrap = styled.div`
	position: relative;
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
