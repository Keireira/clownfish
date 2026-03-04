import styled from 'styled-components';

export const Picker = styled.div`
	background: var(--bg-elevated);
	border: 1px solid var(--border-medium);
	border-radius: 14px;
	width: 520px;
	max-height: 440px;
	display: flex;
	flex-direction: column;

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

	h3 {
		font-size: 14px;
		font-weight: 600;
	}
`;

export const CloseBtn = styled.button`
	background: none;
	border: none;
	color: var(--text-faint);
	font-size: 20px;
	cursor: pointer;
	padding: 0 4px;

	&:hover {
		color: var(--text-primary);
	}
`;

export const Body = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: 12px 16px;
`;

export const PresetCategory = styled.div`
	margin-bottom: 10px;
`;

export const PresetCatLabel = styled.span`
	font-size: 10px;
	font-weight: 600;
	color: var(--text-faint);
	text-transform: uppercase;
	letter-spacing: 0.5px;
	display: block;
	margin-bottom: 6px;
`;

export const PresetGrid = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
`;

export const PresetCharBtn = styled.button<{ $selected?: boolean; $exists?: boolean }>`
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid ${(p) => (p.$selected ? 'var(--accent-border-strong)' : 'var(--border)')};
	border-radius: 8px;
	background: ${(p) => (p.$selected ? 'var(--accent-bg-strong)' : 'var(--fill-light)')};
	color: ${(p) => (p.$selected ? '#fff' : 'var(--text-secondary)')};
	font-size: 16px;
	cursor: ${(p) => (p.$exists ? 'default' : 'pointer')};
	opacity: ${(p) => (p.$exists ? 0.3 : 1)};
	transition:
		background 0.12s,
		border-color 0.12s;

	&:hover:not(:disabled) {
		background: ${(p) => (p.$selected ? 'var(--accent-bg-strong)' : 'var(--fill-hover)')};
	}
`;

export const Footer = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 12px 16px;
	border-top: 1px solid var(--border);
`;

export const PresetCount = styled.span`
	flex: 1;
	font-size: 11px;
	color: var(--text-faint);
`;

const Btn = styled.button`
	padding: 6px 14px;
	border: none;
	border-radius: 8px;
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition:
		background 0.15s,
		opacity 0.15s;

	&:disabled {
		opacity: 0.5;
		cursor: default;
	}
`;

export const BtnSecondary = styled(Btn)`
	background: var(--fill);
	color: var(--text-tertiary);

	&:hover:not(:disabled) {
		background: var(--fill-hover);
	}
`;

export const BtnPrimary = styled(Btn)`
	background: var(--accent);
	color: #fff;

	&:hover:not(:disabled) {
		background: var(--accent-hover);
	}
`;

export default styled.div`
	position: fixed;
	inset: 0;
	background: var(--overlay);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 100;

	html.glass & {
		-webkit-backdrop-filter: blur(4px);
		backdrop-filter: blur(4px);
	}
`;
