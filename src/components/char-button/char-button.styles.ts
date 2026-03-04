import styled from 'styled-components';

export default styled.button<{ $copied?: boolean }>`
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	border-radius: var(--radius-s);
	background: ${(p) => (p.$copied ? 'var(--green-bg)' : 'var(--fill-medium)')};
	color: ${(p) => (p.$copied ? 'var(--green)' : 'var(--text-primary)')};
	font-size: 18px;
	cursor: pointer;
	transition:
		background 0.15s,
		transform 0.1s;
	position: relative;

	&:hover {
		background: var(--fill-active);
		transform: scale(1.08);
	}

	&:active {
		transform: scale(0.95);
	}
`;
