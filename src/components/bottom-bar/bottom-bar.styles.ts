import styled from 'styled-components';

export const Info = styled.div`
	display: flex;
	align-items: center;
	gap: 4px;
`;

export const Link = styled.button`
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 10px;
	color: var(--text-faint);
	background: none;
	border: none;
	padding: 4px 6px;
	border-radius: 8px;
	transition:
		color 0.15s,
		background 0.15s;
	cursor: pointer;

	&:hover {
		color: var(--text-bright);
		background: var(--fill);
	}
`;

export default styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-shrink: 0;
	padding: 8px 0 0;
	margin-top: 8px;
	border-top: 1px solid var(--border);
`;
