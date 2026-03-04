import styled, { createGlobalStyle } from 'styled-components';

export const SettingsGlobalStyle = createGlobalStyle`
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	html, body, #root {
		background: var(--bg-solid);
		margin: 0;
		padding: 0;
		height: 100%;
	}

	.theme-section-label {
		display: block;
		font-size: 11px;
		font-weight: 600;
		color: var(--text-label);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	::-webkit-scrollbar {
		width: 6px;
	}
	::-webkit-scrollbar-track {
		background: transparent;
	}
	::-webkit-scrollbar-thumb {
		background: var(--scrollbar-thumb);
		border-radius: 3px;
	}
`;

export const GlassOverrides = createGlobalStyle`
	html.glass .settings-header,
	html.glass .settings-main {
		background: transparent;
	}

	html.glass[data-theme="light"] .settings-header,
	html.glass[data-theme="light"] .settings-main {
		background: transparent;
	}
`;

export const Header = styled.div.attrs({ className: 'settings-header' })`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 20px 14px 20px;
	border-bottom: 1px solid var(--border);
	-webkit-user-select: none;
	user-select: none;

	h1 {
		font-size: 14px;
		font-weight: 600;
	}

	html.macos & {
		padding-left: 78px;
		padding-top: 38px;
	}
`;

export const HeaderRight = styled.div`
	display: flex;
	gap: 8px;
`;

export const Body = styled.div`
	display: flex;
	flex: 1;
	overflow: hidden;
`;

export const Main = styled.div.attrs({ className: 'settings-main' })`
	flex: 1;
	overflow-y: auto;
	padding: 16px 20px;
	position: relative;
	display: flex;
	flex-direction: column;
	gap: 24px;
`;

export const Empty = styled.div`
	color: var(--text-disabled);
	text-align: center;
	padding-top: 80px;
	font-size: 13px;
`;

const Btn = styled.button`
	padding: 7px 16px;
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

export const BtnPrimary = styled(Btn)`
	background: var(--accent);
	color: #fff;

	&:hover:not(:disabled) {
		background: var(--accent-hover);
	}
`;

export const BtnSecondary = styled(Btn)`
	background: var(--fill);
	color: var(--text-tertiary);

	&:hover:not(:disabled) {
		background: var(--fill-hover);
	}
`;

export const SettingsGroup = styled.div`
	background: var(--card-bg);
	border: 1px solid var(--border);
	border-radius: var(--radius-l);
	padding: 4px 0;
	margin-bottom: 18px;
`;

export const SettingsRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 18px;

	& + & {
		border-top: 1px solid var(--border);
	}
`;

export const SettingsRowLabel = styled.span`
	font-size: 13px;
	color: var(--text-primary);
`;

export const Footer = styled.div`
	padding: 0 20px 12px;
`;

export const Copyright = styled.button`
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 10px;
	color: var(--text-faint);
	background: none;
	border: none;
	padding: 4px 6px;
	border-radius: 6px;
	cursor: pointer;
	transition:
		color 0.15s,
		background 0.15s;

	&:hover {
		color: var(--text-bright);
		background: var(--fill);
	}
`;

export default styled.div`
	background: var(--bg-solid);
	color: var(--text-secondary);
	height: 100vh;
	display: flex;
	flex-direction: column;
	font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
	overflow: hidden;
`;
