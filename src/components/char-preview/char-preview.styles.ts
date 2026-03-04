import styled from 'styled-components';

export const Char = styled.span`
	font-size: 24px;
	line-height: 1;
`;

export const Name = styled.span`
	font-size: 11px;
	font-weight: 500;
	color: var(--text-secondary);
	white-space: nowrap;
`;

export default styled.div<{ $x: number; $y: number }>`
	position: fixed;
	left: ${(p) => p.$x}px;
	top: ${(p) => p.$y}px;
	transform: translateX(-50%) translateY(-100%);
	background: var(--tooltip-bg);
	border: 1px solid var(--border-strong);
	border-radius: 8px;
	padding: 6px 10px;
	display: flex;
	align-items: center;
	gap: 8px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
	pointer-events: none;
	z-index: 100;
	animation: tooltipIn 0.1s ease-out;

	@keyframes tooltipIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
`;
