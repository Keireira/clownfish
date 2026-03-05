import styled from 'styled-components';

export const SectionLabel = styled.label`
	display: block;
	font-size: 11px;
	font-weight: 600;
	color: var(--text-label);
	text-transform: uppercase;
	letter-spacing: 0.5px;
	margin-bottom: 6px;
`;

export const NameInput = styled.input`
	width: 100%;
	padding: 9px 14px;
	border: 1px solid var(--border-medium);
	border-radius: 8px;
	background: var(--fill-light);
	color: var(--text-secondary);
	font-size: 14px;
	outline: none;

	&:focus {
		border-color: var(--accent-border);
	}
`;

export const CharsHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;

	${SectionLabel} {
		margin-bottom: 0;
	}
`;

export const CharGrid = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	margin-top: 8px;
`;

export const CharItem = styled.div`
	position: relative;
	width: 42px;
	height: 42px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 8px;
	background: var(--fill);
	font-size: 18px;

	&:hover button {
		display: flex;
	}
`;

export const CharDelete = styled.button`
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

export const CharShortcutBadge = styled.button`
	position: absolute;
	top: -2px;
	left: -2px;
	width: 16px;
	height: 16px;
	background: none;
	border: none;
	font-size: 10px;
	line-height: 1;
	cursor: pointer;
	display: none;
	align-items: center;
	justify-content: center;
	padding: 0;
`;

export const AddRow = styled.div`
	display: flex;
	gap: 6px;
	align-items: center;
`;

const AddInput = styled.input`
	padding: 7px 12px;
	border: 1px solid var(--border-medium);
	border-radius: 8px;
	background: var(--fill-light);
	color: var(--text-secondary);
	font-size: 13px;
	outline: none;

	&:focus {
		border-color: var(--accent-border);
	}
`;

export const AddCharInput = styled(AddInput)`
	width: 72px;
	text-align: center;
`;

export const AddNameInput = styled(AddInput)`
	flex: 1;
`;

export const SmallBtn = styled.button`
	padding: 6px 10px;
	font-size: 11px;
	background: var(--fill);
	color: var(--text-tertiary);
	border: 1px solid var(--border-medium);
	border-radius: 8px;
	cursor: pointer;
	font-weight: 500;

	&:hover {
		background: var(--fill-hover);
	}
`;

export default styled.div`
	display: flex;
	flex-direction: column;
	gap: 18px;
`;
