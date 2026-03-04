import styled from 'styled-components';

export const Chip = styled.button<{ $active?: boolean }>`
	flex-shrink: 0;
	padding: 4px 12px;
	border: none;
	border-radius: 999px;
	background: ${(p) => (p.$active ? 'var(--accent-bg)' : 'var(--fill)')};
	color: ${(p) => (p.$active ? 'var(--accent)' : 'var(--text-muted)')};
	font-size: 11px;
	font-weight: 500;
	cursor: pointer;
	white-space: nowrap;
	transition:
		background 0.15s,
		color 0.15s;

	&:hover {
		background: ${(p) => (p.$active ? 'var(--accent-bg)' : 'var(--fill-active)')};
	}
`;

export default styled.div`
	display: flex;
	gap: 6px;
	overflow-x: auto;
	margin-bottom: 10px;
	padding-bottom: 2px;

	&::-webkit-scrollbar {
		display: none;
	}
`;
