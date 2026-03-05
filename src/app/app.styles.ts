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
	margin: 0 -8px;
	padding: 0 8px;

	&::-webkit-scrollbar {
		width: 7px;
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

export const SettingsBtn = styled.button<{ $focused?: boolean }>`
	display: flex;
	align-items: center;
	gap: 5px;
	background: ${(p) => (p.$focused ? 'var(--fill)' : 'none')};
	border: none;
	color: ${(p) => (p.$focused ? 'var(--text-bright)' : 'var(--text-faint)')};
	font-size: 11px;
	cursor: pointer;
	padding: 4px 8px;
	border-radius: 8px;
	transition:
		color 0.15s,
		background 0.15s;
	${(p) =>
		p.$focused &&
		`
		outline: 2px solid var(--accent);
		outline-offset: -2px;
	`}

	&:hover {
		color: var(--text-bright);
		background: var(--fill);
	}

	svg {
		flex-shrink: 0;
	}
`;

export const BtnGroup = styled.div`
	display: flex;
	align-items: center;
	gap: 2px;
`;

export const MultiSelectBar = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 10px;
	margin-bottom: 6px;
	background: var(--accent-bg);
	border: 1px solid var(--accent-border);
	border-radius: var(--radius-s);
	min-height: 36px;
	flex-shrink: 0;
`;

export const MultiSelectPreview = styled.span`
	flex: 1;
	font-size: 14px;
	letter-spacing: 1px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const MultiSelectCount = styled.span`
	font-size: 11px;
	color: var(--text-muted);
	flex-shrink: 0;
`;

export const MultiSelectBtn = styled.button<{ $primary?: boolean }>`
	padding: 4px 10px;
	border: none;
	border-radius: 8px;
	font-size: 11px;
	font-weight: 500;
	cursor: pointer;
	flex-shrink: 0;
	background: ${(p) => (p.$primary ? 'var(--accent)' : 'var(--fill)')};
	color: ${(p) => (p.$primary ? '#fff' : 'var(--text-tertiary)')};
	&:hover {
		background: ${(p) => (p.$primary ? 'var(--accent-hover)' : 'var(--fill-hover)')};
	}
`;

export default styled.div`
	background: var(--glass-bg);
	border: 1px solid var(--border-strong);
	border-radius: var(--radius-l);
	box-shadow: var(--glass-shadow);
	padding: 14px;
	width: 100%;
	height: 100%;
	overflow: hidden;
	color: var(--text-primary);
	display: flex;
	flex-direction: column;
`;
