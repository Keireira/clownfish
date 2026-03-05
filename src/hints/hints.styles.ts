import styled, { css, createGlobalStyle } from 'styled-components';

export const HintsGlobalStyle = createGlobalStyle`
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	html, body, #root {
		background: transparent;
		margin: 0; padding: 0; height: 100%;
		overflow: hidden;
		user-select: none;
		-webkit-user-select: none;
	}
`;

const selectedCell = css`
	background: var(--accent);
	color: #fff;
	border-radius: 8px;
`;

const hoverCell = css`
	background: var(--fill);
`;

export const Cell = styled.div<{ $is_selected: boolean; $is_hovered: boolean }>`
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 8px;
	cursor: pointer;
	fontsize: 17px;
	flex-shrink: 0;
	transition: background 0.1s;

	${({ $is_selected }) => $is_selected && selectedCell}
	${({ $is_selected, $is_hovered }) => !$is_selected && $is_hovered && hoverCell}
`;

export default styled.div`
	background: var(--glass-bg);
	border: 1px solid var(--border-strong);
	border-radius: 12px;
	box-shadow:
		0 4px 20px rgba(0, 0, 0, 0.14),
		0 1px 4px rgba(0, 0, 0, 0.06);
	padding: 8px 18px 12px 8px;
	display: inline-flex;
	gap: 6px;
	overflow-x: auto;
	max-width: 100vw;
	scrollbar-width: none;
	&::-webkit-scrollbar { display: none; }
	font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
	color: var(--text-primary);
`;
