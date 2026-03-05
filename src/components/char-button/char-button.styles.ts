import styled from 'styled-components';

export default styled.button<{ $copied?: boolean; $focused?: boolean; $selected?: boolean }>`
	min-width: 40px;
	min-height: 40px;
	max-width: 100%;
	padding: 4px 6px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	border-radius: var(--radius-s);
	background: ${(p) => (p.$copied ? 'var(--green-bg)' : p.$selected ? 'var(--accent-bg)' : p.$focused ? 'var(--fill-active)' : 'var(--fill-medium)')};
	color: ${(p) => (p.$copied ? 'var(--green)' : 'var(--text-primary)')};
	font-size: 18px;
	cursor: pointer;
	transition:
		background 0.15s,
		transform 0.1s;
	position: relative;

	& > span {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 100%;
	}

	${(p) =>
		p.$selected &&
		!p.$copied &&
		`
		outline: 2px solid var(--accent-border);
		outline-offset: -2px;
	`}
	${(p) =>
		p.$focused &&
		`
		outline: 2px solid var(--accent);
		outline-offset: -2px;
		transform: scale(1.08);
	`}

	&:hover {
		background: var(--fill-active);
		transform: scale(1.08);
	}

	&:active {
		transform: scale(0.95);
	}

	&:drag,
	&[dragging] {
		opacity: 0.5;
	}
`;
