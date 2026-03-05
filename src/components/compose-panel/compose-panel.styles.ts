import styled from 'styled-components';

export const PanelWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	flex: 1;
	min-height: 0;
	overflow-y: auto;
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

export const SectionLabel = styled.div`
	font-size: 11px;
	font-weight: 600;
	color: var(--text-muted);
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

export const BaseInput = styled.input`
	width: 100%;
	padding: 8px 10px;
	border: 1px solid var(--border);
	border-radius: var(--radius-s);
	background: var(--fill-subtle);
	color: var(--text-primary);
	font-size: 16px;
	outline: none;
	transition: border-color 0.15s;

	&::placeholder {
		color: var(--text-placeholder);
	}
	&:focus {
		border-color: var(--accent);
	}
`;

export const GroupLabel = styled.div`
	font-size: 10px;
	color: var(--text-faint);
	margin-top: 4px;
	margin-bottom: 2px;
`;

export const ModifierGrid = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
`;

export const ModifierBtn = styled.button<{ $active?: boolean; $focused?: boolean }>`
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid ${(p) => (p.$active ? 'var(--accent-border-strong)' : 'var(--border)')};
	border-radius: 8px;
	background: ${(p) => (p.$active ? 'var(--accent-bg)' : 'var(--fill-subtle)')};
	color: var(--text-primary);
	font-size: 16px;
	cursor: pointer;
	transition: all 0.12s;
	outline: ${(p) => (p.$focused ? '2px solid var(--accent)' : 'none')};
	outline-offset: -2px;

	&:hover {
		background: ${(p) => (p.$active ? 'var(--accent-bg-strong)' : 'var(--fill-hover)')};
		border-color: var(--border-hover);
	}
`;

export const ChipsRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	min-height: 24px;
`;

export const ModifierChip = styled.button`
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 2px 8px;
	border: 1px solid var(--accent-border);
	border-radius: 12px;
	background: var(--accent-bg);
	color: var(--text-primary);
	font-size: 13px;
	cursor: pointer;
	transition: all 0.12s;

	&:hover {
		background: var(--accent-bg-strong);
	}

	&::after {
		content: '×';
		font-size: 12px;
		color: var(--text-muted);
	}
`;

export const PreviewArea = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	padding: 16px;
	background: var(--fill-subtle);
	border: 1px solid var(--border);
	border-radius: var(--radius-s);
`;

export const PreviewChar = styled.div`
	font-size: 48px;
	line-height: 1.2;
	min-height: 58px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

export const PreviewEmpty = styled.div`
	font-size: 12px;
	color: var(--text-disabled);
	text-align: center;
`;

export const CopyBtn = styled.button`
	width: 100%;
	padding: 8px;
	border: none;
	border-radius: var(--radius-s);
	background: var(--accent);
	color: #fff;
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: background 0.15s;

	&:hover {
		background: var(--accent-hover);
	}

	&:disabled {
		opacity: 0.4;
		cursor: default;
	}
`;

export const NfcRow = styled.label`
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 12px;
	color: var(--text-secondary);
	cursor: pointer;
	user-select: none;
`;

export const NfcCheckbox = styled.input`
	accent-color: var(--accent);
`;
