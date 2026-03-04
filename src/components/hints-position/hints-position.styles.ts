import styled from 'styled-components';

export const Wrapper = styled.div`
	display: flex;
	gap: 4px;
	background: var(--fill);
	border-radius: 10px;
	padding: 3px;
`;

export const Option = styled.button<{ $active: boolean }>`
	all: unset;
	font-size: 12px;
	padding: 5px 12px;
	border-radius: 8px;
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
