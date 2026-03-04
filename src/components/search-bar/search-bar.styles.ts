import styled from 'styled-components';

export const SearchIcon = styled.svg`
	position: absolute;
	left: 10px;
	top: 50%;
	transform: translateY(-50%);
	color: var(--text-placeholder);
	pointer-events: none;
`;

export const Input = styled.input`
	width: 100%;
	padding: 9px 12px 9px 34px;
	border: 1px solid var(--border-strong);
	border-radius: var(--radius-m);
	background: var(--fill);
	color: var(--text-primary);
	font-size: 13px;
	outline: none;
	transition: border-color 0.2s;

	&::placeholder {
		color: var(--text-placeholder);
	}

	&:focus {
		border-color: var(--accent-border);
	}
`;

export default styled.div`
	margin-bottom: 10px;
	position: relative;
`;
