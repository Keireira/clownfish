import styled from 'styled-components';

export const Label = styled.span`
	font-size: 11px;
	font-weight: 600;
	color: var(--text-muted);
	text-transform: uppercase;
	letter-spacing: 0.5px;
	padding: 4px 4px 4px;
	display: block;
`;

export const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, 38px);
	gap: 4px;
`;

export default styled.div`
	margin-bottom: 8px;
`;
