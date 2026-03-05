import styled from 'styled-components';

export const Picker = styled.div`
	background: var(--bg-elevated);
	border: 1px solid var(--border-medium);
	border-radius: 14px;
	width: 320px;
	display: flex;
	flex-direction: column;

	html.glass & {
		background: rgba(18, 20, 30, 0.97);
		-webkit-backdrop-filter: saturate(180%) blur(20px);
		backdrop-filter: saturate(180%) blur(20px);
	}

	html.glass[data-theme='light'] & {
		background: rgba(255, 255, 255, 0.97);
	}
`;

export const Header = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 16px;
	border-bottom: 1px solid var(--border);

	h3 {
		font-size: 14px;
		font-weight: 600;
	}
`;

export const CloseBtn = styled.button`
	background: none;
	border: none;
	color: var(--text-faint);
	font-size: 20px;
	cursor: pointer;
	padding: 0 4px;

	&:hover {
		color: var(--text-primary);
	}
`;

export const Body = styled.div`
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

export const CharDisplay = styled.div`
	font-size: 36px;
	text-align: center;
	line-height: 1;
`;

export const CharName = styled.div`
	font-size: 11px;
	color: var(--text-faint);
	text-align: center;
`;

export const Input = styled.input`
	width: 100%;
	padding: 8px 10px;
	border: 1px solid var(--border);
	border-radius: 8px;
	background: var(--fill-light);
	color: var(--text-primary);
	font-size: 13px;
	outline: none;
	box-sizing: border-box;

	&:focus {
		border-color: var(--accent);
	}
`;

export const Preview = styled.div`
	font-size: 12px;
	color: var(--text-tertiary);
	text-align: center;
`;

export const ErrorText = styled.div`
	font-size: 11px;
	color: var(--danger, #e53935);
	text-align: center;
`;

export const Footer = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 8px;
	padding: 12px 16px;
	border-top: 1px solid var(--border);
`;

const Btn = styled.button`
	padding: 6px 14px;
	border: none;
	border-radius: 8px;
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition:
		background 0.15s,
		opacity 0.15s;

	&:disabled {
		opacity: 0.5;
		cursor: default;
	}
`;

export const BtnSecondary = styled(Btn)`
	background: var(--fill);
	color: var(--text-tertiary);

	&:hover:not(:disabled) {
		background: var(--fill-hover);
	}
`;

export const BtnPrimary = styled(Btn)`
	background: var(--accent);
	color: #fff;

	&:hover:not(:disabled) {
		background: var(--accent-hover);
	}
`;

export default styled.div`
	position: fixed;
	inset: 0;
	background: var(--overlay);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 100;

	html.glass & {
		-webkit-backdrop-filter: blur(4px);
		backdrop-filter: blur(4px);
	}
`;
