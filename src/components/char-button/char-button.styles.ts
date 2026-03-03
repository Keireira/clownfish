import styled from 'styled-components';

export default styled.button<{ $copied?: boolean }>`
	width: 38px;
	height: 38px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--border);
	border-radius: var(--radius-s);
	background: ${(p) => (p.$copied ? 'var(--green-bg)' : 'var(--fill-medium)')};
	color: ${(p) => (p.$copied ? 'var(--green)' : 'var(--text-primary)')};
	font-size: 18px;
	cursor: pointer;
	transition:
		background 0.15s,
		transform 0.1s,
		border-color 0.15s;
	position: relative;

	&:hover {
		background: var(--fill-active);
		border-color: var(--border-hover);
		transform: scale(1.05);
	}

	&:active {
		transform: scale(0.95);
	}
`;
