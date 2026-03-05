import styled from 'styled-components';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

export const PluginCard = styled.div<{ $builtin?: boolean }>`
	background: var(--card-bg);
	border: 1px solid var(--border);
	border-radius: var(--radius-l);
	padding: 16px 18px;
	display: flex;
	align-items: center;
	gap: 14px;
`;

export const PluginInfo = styled.div`
	flex: 1;
	min-width: 0;
`;

export const PluginName = styled.div`
	font-size: 14px;
	font-weight: 600;
	color: var(--text-primary);
	display: flex;
	align-items: center;
	gap: 6px;
`;

export const PluginMeta = styled.div`
	font-size: 11px;
	color: var(--text-faint);
	margin-top: 2px;
`;

export const PluginActions = styled.div`
	display: flex;
	gap: 6px;
	flex-shrink: 0;
`;

export const ActionBtn = styled.button`
	padding: 5px 12px;
	border: 1px solid var(--border);
	border-radius: 8px;
	background: var(--fill);
	color: var(--text-tertiary);
	font-size: 11px;
	cursor: pointer;
	transition:
		background 0.15s,
		color 0.15s;

	&:hover:not(:disabled) {
		background: var(--fill-hover);
		color: var(--text-bright);
	}

	&:disabled {
		opacity: 0.4;
		cursor: default;
	}
`;

export const DeleteBtn = styled(ActionBtn)`
	border-color: var(--red, #e53e3e);
	color: var(--red, #e53e3e);

	&:hover:not(:disabled) {
		background: var(--red, #e53e3e);
		color: #fff;
	}
`;

export const LockIcon = styled.span`
	font-size: 12px;
	color: var(--text-hint);
`;

export const ToggleSwitch = styled.input`
	width: 34px;
	height: 20px;
	appearance: none;
	background: var(--fill);
	border-radius: 10px;
	position: relative;
	cursor: pointer;
	transition: background 0.2s;
	flex-shrink: 0;

	&::after {
		content: '';
		position: absolute;
		top: 3px;
		left: 3px;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--text-hint);
		transition:
			transform 0.2s,
			background 0.2s;
	}

	&:checked {
		background: var(--accent);
	}

	&:checked::after {
		transform: translateX(14px);
		background: #fff;
	}
`;

export const ToolbarRow = styled.div`
	display: flex;
	gap: 8px;
`;

export const CreateInput = styled.input`
	flex: 1;
	padding: 8px 12px;
	border: 1px solid var(--border);
	border-radius: 8px;
	background: var(--fill);
	color: var(--text-primary);
	font-size: 13px;
	outline: none;

	&::placeholder {
		color: var(--text-placeholder);
	}

	&:focus {
		border-color: var(--accent-border);
	}
`;

export const CreateBtn = styled.button`
	padding: 8px 16px;
	border: none;
	border-radius: 8px;
	background: var(--accent);
	color: #fff;
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: background 0.15s;
	white-space: nowrap;

	&:hover:not(:disabled) {
		background: var(--accent-hover);
	}

	&:disabled {
		opacity: 0.5;
		cursor: default;
	}
`;
