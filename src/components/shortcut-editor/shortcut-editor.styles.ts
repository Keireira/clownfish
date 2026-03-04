import styled from 'styled-components';

export const Grid = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
`;

export const Card = styled.div`
	position: relative;
	width: 72px;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 8px 4px 6px;
	border-radius: 8px;
	background: var(--fill);
	cursor: default;

	&:hover button {
		display: flex;
	}
`;

export const CardChar = styled.span`
	font-size: 22px;
	line-height: 1.2;
`;

export const CardTrigger = styled.span`
	font-size: 9px;
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	color: var(--text-tertiary);
	margin-top: 3px;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const CardDelete = styled.button`
	position: absolute;
	top: -4px;
	right: -4px;
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background: var(--red);
	color: #fff;
	border: none;
	font-size: 11px;
	line-height: 1;
	cursor: pointer;
	display: none;
	align-items: center;
	justify-content: center;
`;

export const AddRow = styled.div`
	display: flex;
	gap: 6px;
	align-items: center;
`;

const AddInput = styled.input`
	padding: 7px 10px;
	border: 1px solid var(--border-medium);
	border-radius: 6px;
	background: var(--fill-light);
	color: var(--text-secondary);
	font-size: 13px;
	outline: none;

	&:focus {
		border-color: var(--accent-border);
	}
`;

export const TriggerInput = styled(AddInput)`
	width: 120px;
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	font-size: 12px;
`;

export const ExpansionInput = styled(AddInput)`
	flex: 1;
`;

export const SmallBtn = styled.button`
	padding: 7px 12px;
	font-size: 12px;
	background: var(--fill);
	color: var(--text-tertiary);
	border: 1px solid var(--border-medium);
	border-radius: 6px;
	cursor: pointer;
	font-weight: 500;

	&:hover {
		background: var(--fill-hover);
	}
`;

export const SectionLabel = styled.label`
	display: block;
	font-size: 11px;
	font-weight: 600;
	color: var(--text-label);
	text-transform: uppercase;
	letter-spacing: 0.5px;
	margin-bottom: 6px;
`;

export const EmptyState = styled.p`
	font-size: 13px;
	color: var(--text-tertiary);
	text-align: center;
	padding: 24px 0;
`;

export default styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;
