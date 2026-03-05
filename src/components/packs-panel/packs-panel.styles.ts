import styled from 'styled-components';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

export const PackCard = styled.div`
	background: var(--card-bg);
	border: 1px solid var(--border);
	border-radius: var(--radius-l);
	padding: 16px 18px;
	display: flex;
	align-items: center;
	gap: 14px;
`;

export const PackInfo = styled.div`
	flex: 1;
	min-width: 0;
`;

export const PackName = styled.div`
	font-size: 14px;
	font-weight: 600;
	color: var(--text-primary);
`;

export const PackPreview = styled.div`
	font-size: 16px;
	margin-top: 4px;
	color: var(--text-secondary);
	letter-spacing: 2px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const InstallBtn = styled.button`
	padding: 6px 16px;
	border: none;
	border-radius: 8px;
	background: var(--accent);
	color: #fff;
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: background 0.15s;
	white-space: nowrap;
	flex-shrink: 0;

	&:hover:not(:disabled) {
		background: var(--accent-hover);
	}

	&:disabled {
		opacity: 0.5;
		cursor: default;
	}
`;

export const UninstallBtn = styled.button`
	padding: 6px 16px;
	border: 1px solid var(--red, #e53e3e);
	border-radius: 8px;
	background: transparent;
	color: var(--red, #e53e3e);
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition:
		background 0.15s,
		color 0.15s;
	white-space: nowrap;
	flex-shrink: 0;

	&:hover:not(:disabled) {
		background: var(--red, #e53e3e);
		color: #fff;
	}

	&:disabled {
		opacity: 0.5;
		cursor: default;
	}
`;
