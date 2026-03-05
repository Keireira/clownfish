import styled from 'styled-components';

export const Wrapper = styled.div`
	display: flex;
	gap: 2px;
	background: var(--segmented-bg);
	border-radius: 10px;
	padding: 3px;
	margin-bottom: 8px;
	flex-shrink: 0;
`;

export const Tab = styled.button<{ $active: boolean }>`
	all: unset;
	flex: 1;
	text-align: center;
	font-size: 12px;
	padding: 5px 12px;
	border-radius: 8px;
	cursor: pointer;
	white-space: nowrap;
	color: ${(p) => (p.$active ? 'var(--text-primary)' : 'var(--text-secondary)')};
	background: ${(p) => (p.$active ? 'var(--segmented-active)' : 'transparent')};
	transition: all 0.15s ease;

	&:hover {
		color: var(--text-primary);
	}
`;
