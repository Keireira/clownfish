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
	margin: -14px -14px 12px;
	padding: 12px 14px 8px;
	border-radius: 12px 12px 0 0;
`;

export const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, 38px);
	gap: 6px;
`;

export default styled.div`
	margin-bottom: 10px;
	background: var(--card-bg);
	border: 1px solid var(--border);
	border-radius: 12px;
	padding: 14px;
`;
