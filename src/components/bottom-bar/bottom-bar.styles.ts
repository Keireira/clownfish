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

export const HelpWrap = styled.div`
	position: relative;
`;

export const HelpBtn = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 10px;
	width: 18px;
	height: 18px;
	color: var(--text-faint);
	background: none;
	border: 1px solid var(--border);
	border-radius: 50%;
	cursor: pointer;
	transition:
		color 0.15s,
		border-color 0.15s;

	&:hover {
		color: var(--text-bright);
		border-color: var(--text-faint);
	}
`;

export const HelpPopover = styled.div`
	position: absolute;
	bottom: calc(100% + 6px);
	left: 0;
	background: var(--tooltip-bg);
	border: 1px solid var(--border-strong);
	border-radius: 8px;
	padding: 8px 10px;
	display: flex;
	flex-direction: column;
	gap: 4px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
	z-index: 50;
	white-space: nowrap;
	animation: helpIn 0.1s ease-out;

	@keyframes helpIn {
		from { opacity: 0; transform: translateY(4px); }
		to { opacity: 1; transform: translateY(0); }
	}
`;

export const HelpLine = styled.span`
	font-size: 11px;
	color: var(--text-secondary);

	kbd {
		display: inline-block;
		font-size: 10px;
		font-family: inherit;
		background: var(--fill);
		border: 1px solid var(--border);
		border-radius: 3px;
		padding: 0 4px;
		margin-right: 4px;
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
