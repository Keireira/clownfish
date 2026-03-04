import styled from 'styled-components';

export const Options = styled.div`
	display: flex;
	gap: 10px;
`;

export const Option = styled.button<{ $active: boolean }>`
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
	padding: 14px 10px;
	border: 1px solid ${(p) => (p.$active ? 'var(--accent-border)' : 'var(--border-medium)')};
	border-radius: 10px;
	background: ${(p) => (p.$active ? 'var(--accent-bg)' : 'var(--fill-light)')};
	cursor: pointer;
	transition:
		background 0.15s,
		border-color 0.15s;

	&:hover {
		background: ${(p) => (p.$active ? 'var(--accent-bg)' : 'var(--fill)')};
		border-color: ${(p) => (p.$active ? 'var(--accent-border)' : 'var(--border-strong)')};
	}
`;

export const OptionLabel = styled.span<{ $active: boolean }>`
	font-size: 12px;
	font-weight: 600;
	color: ${(p) => (p.$active ? 'var(--accent)' : 'var(--text-secondary)')};
`;

export const OptionDesc = styled.span`
	font-size: 10px;
	color: var(--text-faint);
`;

export default styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 14px 18px;
`;
