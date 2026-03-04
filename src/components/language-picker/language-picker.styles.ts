import styled from 'styled-components';

export default styled.select`
	appearance: none;
	-webkit-appearance: none;
	width: fit-content;
	min-width: 140px;
	padding: 8px 32px 8px 12px;
	font-size: 13px;
	font-family: inherit;
	color: var(--text-primary);
	background: var(--fill-light)
		url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
		no-repeat right 12px center;
	border: 1px solid var(--border-medium);
	border-radius: 10px;
	cursor: pointer;
	transition:
		border-color 0.15s,
		background 0.15s;

	&:hover {
		border-color: var(--border-strong);
		background-color: var(--fill);
	}

	&:focus {
		outline: none;
		border-color: var(--accent-border);
	}
`;
