import styled from 'styled-components';

export const Label = styled.span`
	font-size: 11px;
	font-weight: 600;
	color: var(--text-muted);
	text-transform: uppercase;
	letter-spacing: 0.5px;
	display: block;
	position: sticky;
	top: 0;
	z-index: 2;
	background: var(--card-bg);
	backdrop-filter: blur(12px);
	margin: -16px -16px 12px;
	padding: 14px 16px 8px;
	border-radius: 14px 14px 0 0;
`;

export const Grid = styled.div<{ $wide?: boolean }>`
	display: grid;
	grid-template-columns: ${(p) => (p.$wide ? 'repeat(auto-fill, minmax(140px, 1fr))' : 'repeat(auto-fill, 40px)')};
	gap: ${(p) => (p.$wide ? '5px' : '7px')};
`;

export default styled.div`
	margin-bottom: 10px;
	background: var(--card-bg);
	border: 1px solid var(--border);
	border-radius: 14px;
	padding: 16px;
`;
