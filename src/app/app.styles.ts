import styled, { createGlobalStyle } from 'styled-components';

export const AppGlobalStyle = createGlobalStyle`
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	html, body, #root {
		background: transparent;
		font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
		user-select: none;
		-webkit-user-select: none;
		margin: 0;
		padding: 0;
		height: 100%;
		overflow: hidden;
	}
`;

export const GridArea = styled.div`
	flex: 1;
	overflow-y: auto;
	min-height: 0;

	&::-webkit-scrollbar {
		width: 6px;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background: var(--scrollbar-thumb);
		border-radius: 3px;
	}
`;

export const NoResults = styled.div`
	text-align: center;
	padding: 24px 0;
	color: var(--text-disabled);
	font-size: 13px;
`;

export const SettingsBtn = styled.button`
	display: flex;
	align-items: center;
	gap: 5px;
	background: none;
	border: none;
	color: var(--text-faint);
	font-size: 11px;
	cursor: pointer;
	padding: 4px 8px;
	border-radius: 6px;
	transition:
		color 0.15s,
		background 0.15s;

	&:hover {
		color: var(--text-bright);
		background: var(--fill);
	}

	svg {
		flex-shrink: 0;
	}
`;

export default styled.div`
	background: var(--glass-bg);
	border: 1px solid var(--border-strong);
	border-radius: var(--radius-l);
	box-shadow: var(--glass-shadow);
	padding: 12px;
	width: 100%;
	height: 100%;
	overflow: hidden;
	color: var(--text-primary);
	display: flex;
	flex-direction: column;
`;
