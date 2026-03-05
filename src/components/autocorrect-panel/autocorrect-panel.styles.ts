import styled from 'styled-components';

export const RuleRow = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 5px 16px;
`;

export const RulePattern = styled.span`
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	font-size: 13px;
	color: var(--text-primary);
	min-width: 36px;
	text-align: right;
	flex-shrink: 0;
`;

export const RuleArrow = styled.span`
	font-size: 11px;
	color: var(--text-faint);
	flex-shrink: 0;
`;

export const RuleReplacement = styled.span`
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	font-size: 15px;
	color: var(--text-primary);
	flex: 1;
`;

export const RuleDeleteBtn = styled.button`
	all: unset;
	font-size: 14px;
	color: var(--text-faint);
	cursor: pointer;
	padding: 0 4px;
	border-radius: 4px;
	line-height: 1;
	opacity: 0;
	transition: opacity 0.15s;

	${RuleRow}:hover & {
		opacity: 1;
	}

	&:hover {
		color: var(--text-primary);
		background: var(--fill-hover);
	}
`;

export const AddRow = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 8px 16px;
	border-top: 1px solid var(--border);
`;

export const AddInput = styled.input`
	flex: 1;
	min-width: 0;
	padding: 4px 8px;
	border: 1px solid var(--border);
	border-radius: 6px;
	background: var(--fill-light);
	color: var(--text-primary);
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	font-size: 12px;
	outline: none;
	transition: border-color 0.15s;

	&:focus {
		border-color: var(--accent);
	}

	&::placeholder {
		color: var(--text-faint);
	}
`;

export const AddBtn = styled.button`
	all: unset;
	font-size: 11px;
	font-weight: 600;
	color: var(--accent);
	cursor: pointer;
	padding: 4px 10px;
	border-radius: 6px;
	white-space: nowrap;

	&:hover {
		background: var(--fill-light);
	}

	&:disabled {
		opacity: 0.35;
		cursor: default;
	}
`;

export const EmptyState = styled.div`
	padding: 24px 16px;
	text-align: center;
	color: var(--text-faint);
	font-size: 12px;
`;
