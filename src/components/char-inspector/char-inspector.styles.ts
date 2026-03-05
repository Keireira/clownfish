import styled from 'styled-components';

export default styled.div`
	position: fixed;
	inset: 0;
	background: var(--overlay);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 100;
	animation: inspectorFadeIn 0.1s ease-out;

	html.glass & {
		-webkit-backdrop-filter: blur(4px);
		backdrop-filter: blur(4px);
	}

	@keyframes inspectorFadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
`;

export const Card = styled.div`
	background: var(--bg-elevated);
	border: 1px solid var(--border-medium);
	border-radius: 14px;
	width: 340px;
	display: flex;
	flex-direction: column;
	overflow: hidden;

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
`;

export const CharDisplay = styled.div`
	font-size: 40px;
	line-height: 1;
`;

export const HeaderInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
	flex: 1;
	min-width: 0;
	margin-left: 14px;
`;

export const CharName = styled.div`
	font-size: 12px;
	font-weight: 600;
	color: var(--text-primary);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const BlockBadge = styled.span`
	font-size: 10px;
	color: var(--text-faint);
	background: var(--fill);
	padding: 2px 7px;
	border-radius: 4px;
	align-self: flex-start;
`;

export const Body = styled.div`
	padding: 8px 0;
	display: flex;
	flex-direction: column;
`;

export const Row = styled.div`
	display: flex;
	align-items: center;
	padding: 5px 16px;
	gap: 10px;

	&:hover {
		background: var(--fill-light);
	}
`;

export const Label = styled.span`
	font-size: 11px;
	color: var(--text-faint);
	width: 72px;
	flex-shrink: 0;
`;

export const Value = styled.span`
	font-size: 12px;
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	color: var(--text-primary);
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const CopyBtn = styled.button`
	background: none;
	border: none;
	color: var(--text-faint);
	font-size: 13px;
	cursor: pointer;
	padding: 2px 4px;
	flex-shrink: 0;
	border-radius: 4px;
	transition: color 0.15s, background 0.15s;

	&:hover {
		color: var(--text-primary);
		background: var(--fill);
	}
`;
