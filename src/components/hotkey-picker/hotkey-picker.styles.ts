import styled from 'styled-components';

export const Wrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
`;

export const HotkeyDisplay = styled.span`
	font-size: 12px;
	color: var(--text-primary);
	padding: 5px 10px;
	background: var(--fill);
	border-radius: 8px;
	min-width: 80px;
	text-align: center;
`;

export const RecordingInput = styled.input`
	all: unset;
	font-size: 12px;
	padding: 5px 10px;
	border-radius: 8px;
	min-width: 140px;
	text-align: center;
	color: var(--text-secondary);
	background: var(--fill);
	border: 1px solid var(--accent, #007aff);
	animation: pulse 1.2s ease-in-out infinite;

	@keyframes pulse {
		0%,
		100% {
			border-color: var(--accent, #007aff);
		}
		50% {
			border-color: transparent;
		}
	}
`;

export const Btn = styled.button`
	all: unset;
	font-size: 11px;
	padding: 4px 10px;
	border-radius: 8px;
	cursor: pointer;
	color: var(--text-secondary);
	background: var(--fill);
	transition: all 0.15s ease;

	&:hover {
		color: var(--text-primary);
		background: var(--glass-bg);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
	}
`;

export const ClearBtn = styled(Btn)`
	padding: 4px 6px;
	font-size: 13px;
	line-height: 1;
`;
