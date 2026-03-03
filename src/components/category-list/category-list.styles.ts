import styled from 'styled-components';

export const Items = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: 8px;
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

export const Item = styled.div<{ $active: boolean; $dragging: boolean }>`
	display: flex;
	align-items: center;
	padding: 8px 12px;
	border-radius: var(--radius-s);
	cursor: pointer;
	gap: 6px;
	transition:
		background 0.12s,
		opacity 0.12s;
	background: ${(p) => (p.$active ? 'var(--accent-bg-strong)' : 'transparent')};
	opacity: ${(p) => (p.$dragging ? 0.4 : 1)};
	user-select: none;

	&:hover {
		background: ${(p) => (p.$active ? 'var(--accent-bg-strong)' : 'var(--fill-light)')};
	}
`;

export const GripHandle = styled.span`
	font-size: 11px;
	color: var(--text-hint);
	cursor: grab;
	visibility: hidden;
	user-select: none;
	line-height: 1;
	flex-shrink: 0;

	${Item}:hover & {
		visibility: visible;
	}

	&:active {
		cursor: grabbing;
	}
`;

export const Name = styled.span`
	flex: 1;
	font-size: 13px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const Count = styled.span`
	font-size: 10px;
	color: var(--text-placeholder);
	min-width: 16px;
	text-align: right;
`;

export const DeleteBtn = styled.button`
	background: none;
	border: none;
	color: var(--text-hint);
	font-size: 16px;
	cursor: pointer;
	padding: 0 2px;
	line-height: 1;
	visibility: hidden;

	${Item}:hover & {
		visibility: visible;
	}

	&:hover {
		color: var(--red);
	}
`;

export const Placeholder = styled.div`
	border-radius: var(--radius-s);
	border: 1.5px dashed var(--border-medium);
	background: var(--fill-subtle);
	padding: 8px 12px 8px 26px;
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
	padding: 8px 12px;
	border-radius: var(--radius-s);
	background: var(--sidebar-bg);
	border: 1px solid var(--border);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	font-size: 13px;
	color: var(--text-secondary);
	opacity: 0.85;
	white-space: nowrap;
	max-width: 180px;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const AddBtn = styled.button`
	margin: 8px;
	padding: 8px;
	background: var(--fill-subtle);
	border: 1px dashed var(--border-medium);
	border-radius: 6px;
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

export default styled.div`
	width: 200px;
	min-width: 200px;
	border-right: 1px solid var(--border);
	background: var(--sidebar-bg);
	display: flex;
	flex-direction: column;
`;
