import styled from 'styled-components';

export const Knob = styled.span<{ $active: boolean }>`
	position: absolute;
	top: 3px;
	left: 3px;
	width: 18px;
	height: 18px;
	border-radius: 50%;
	background: #fff;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	transition: transform 0.2s;
	pointer-events: none;
	transform: ${(p) => (p.$active ? 'translateX(18px)' : 'translateX(0)')};
`;

export default styled.button<{ $active: boolean }>`
	position: relative;
	width: 42px;
	height: 24px;
	border: none;
	border-radius: 12px;
	background: ${(p) => (p.$active ? 'var(--accent)' : 'var(--fill-hover)')};
	cursor: pointer;
	padding: 0;
	transition: background 0.2s;
`;
