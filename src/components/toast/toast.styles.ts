import styled from 'styled-components';

export default styled.div<{ $show: boolean }>`
	position: fixed;
	bottom: 12px;
	left: 50%;
	transform: translateX(-50%) ${(p) => (p.$show ? 'translateY(0)' : 'translateY(40px)')};
	background: var(--green-toast);
	color: #fff;
	padding: 8px 18px;
	border-radius: var(--radius-m);
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
	font-size: 12px;
	font-weight: 500;
	pointer-events: none;
	opacity: ${(p) => (p.$show ? 1 : 0)};
	transition:
		opacity 0.2s,
		transform 0.2s;
`;
