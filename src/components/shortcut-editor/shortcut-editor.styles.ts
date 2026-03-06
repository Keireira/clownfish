import styled from 'styled-components';

export const Grid = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
`;

export const Card = styled.div`
	position: relative;
	width: 76px;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 8px 4px 6px;
	border-radius: 10px;
	background: var(--fill);
	cursor: pointer;
	transition: transform 0.1s;

	&:hover button {
		display: flex;
	}

	&:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: -2px;
		transform: scale(1.05);
	}

	&:focus-visible button {
		display: flex;
	}
`;

export const CardChar = styled.span`
	font-size: 22px;
	line-height: 1.2;
	max-width: 68px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	text-align: center;
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

/** Small badge indicating a template shortcut (has {{...}} variables). */
export const CardBadge = styled.span`
	position: absolute;
	top: 3px;
	left: 3px;
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: var(--accent);
	opacity: 0.6;
`;

// ---------------------------------------------------------------------------
// Edit mode (full-width panel that replaces the grid temporarily)
// ---------------------------------------------------------------------------

export const EditRow = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 10px 12px;
	border-radius: var(--radius-s);
	background: var(--card-bg);
	border: 1px solid var(--accent-border);
	width: 100%;
`;

export const EditTopRow = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 8px;
`;

const EditInput = styled.input`
	padding: 5px 8px;
	border: 1px solid var(--border);
	border-radius: 6px;
	background: var(--fill-light);
	color: var(--text-primary);
	font-size: 12px;
	outline: none;

	&:focus {
		border-color: var(--accent-border);
	}
`;

export const EditTriggerInput = styled(EditInput)`
	width: 80px;
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	font-size: 11px;
	flex-shrink: 0;
`;

export const EditExpansionInput = styled(EditInput)`
	width: 60px;
`;

export const TextareaWrap = styled.div`
	position: relative;
	flex: 1;
	background: var(--fill-light);
	border-radius: 6px;
`;

export const HighlightDiv = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 5px 8px;
	font-size: 12px;
	font-family: inherit;
	line-height: 1.4;
	color: transparent;
	pointer-events: none;
	white-space: pre-wrap;
	word-wrap: break-word;
	overflow: hidden;
`;

export const VarHighlight = styled.mark`
	background: rgba(88, 166, 255, 0.15);
	color: transparent;
	border-radius: 2px;
`;

export const EditExpansionTextarea = styled.textarea`
	width: 100%;
	padding: 5px 8px;
	border: 1px solid var(--border);
	border-radius: 6px;
	background: transparent;
	color: var(--text-primary);
	font-size: 12px;
	font-family: inherit;
	line-height: 1.4;
	outline: none;
	resize: none;
	min-height: 26px;
	max-height: 200px;
	overflow-y: auto;
	field-sizing: content;
	position: relative;
	z-index: 1;

	&:focus {
		border-color: var(--accent-border);
	}
`;

// ---------------------------------------------------------------------------
// Add row
// ---------------------------------------------------------------------------

export const AddRow = styled.div`
	display: flex;
	gap: 6px;
	align-items: flex-start;
`;

const AddInput = styled.input`
	padding: 7px 10px;
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

export const TriggerInput = styled(AddInput)`
	width: 120px;
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	font-size: 12px;
`;

export const ExpansionInput = styled(AddInput)`
	flex: 1;
`;

export const ExpansionTextarea = styled.textarea`
	flex: 1;
	padding: 7px 10px;
	border: 1px solid var(--border-medium);
	border-radius: 8px;
	background: var(--fill-light);
	color: var(--text-secondary);
	font-size: 13px;
	font-family: inherit;
	outline: none;
	resize: none;
	min-height: 32px;
	field-sizing: content;

	&:focus {
		border-color: var(--accent-border);
	}
`;

export const HelpWrap = styled.div`
	position: relative;
	display: flex;
	align-items: center;
`;

export const HelpBtn = styled.button`
	width: 20px;
	height: 20px;
	border-radius: 50%;
	border: 1px solid var(--border);
	background: none;
	color: var(--text-tertiary);
	font-size: 11px;
	line-height: 1;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;

	&:hover {
		background: var(--fill-hover);
		color: var(--text-secondary);
	}
`;

export const HelpTooltip = styled.div`
	display: none;
	position: absolute;
	top: calc(100% + 6px);
	right: 0;
	width: 260px;
	padding: 10px 12px;
	border-radius: 8px;
	background: var(--bg-elevated);
	border: 1px solid var(--border-medium);
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
	z-index: 100;
	font-size: 11px;
	line-height: 1.5;
	color: var(--text-secondary);

	${HelpWrap}:hover &,
	${HelpWrap}:focus-within & {
		display: block;
	}
`;

export const HelpCode = styled.code`
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	font-size: 10px;
	background: var(--fill);
	padding: 1px 4px;
	border-radius: 3px;
	color: var(--text-primary);
`;

export const HelpTitle = styled.div`
	font-weight: 600;
	font-size: 11px;
	color: var(--text-primary);
	margin-bottom: 6px;
`;

export const HelpRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 2px 0;
`;

export const HelpDivider = styled.hr`
	border: none;
	border-top: 1px solid var(--border);
	margin: 6px 0;
`;

export const SmallBtn = styled.button`
	padding: 7px 12px;
	font-size: 12px;
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

// ---------------------------------------------------------------------------
// Variables section (inside edit mode)
// ---------------------------------------------------------------------------

export const VarsSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 5px;
	padding: 8px 10px;
	border-radius: 8px;
	background: var(--fill-subtle);
	border: 1px solid var(--border);
`;

export const VarsSectionHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const VarsSectionLabel = styled.span`
	font-size: 10px;
	font-weight: 600;
	color: var(--text-label);
	text-transform: uppercase;
	letter-spacing: 0.4px;
`;

export const VarRow = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
`;

export const VarKeyInput = styled.input`
	width: 80px;
	padding: 4px 6px;
	border: 1px solid var(--border);
	border-radius: 6px;
	background: var(--fill-light);
	color: var(--text-primary);
	font-size: 11px;
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	outline: none;

	&:focus {
		border-color: var(--accent-border);
	}

	&:read-only {
		opacity: 0.6;
		cursor: default;
	}
`;

export const VarArrow = styled.span`
	color: var(--text-faint);
	font-size: 10px;
	flex-shrink: 0;
`;

export const VarValueInput = styled.input`
	flex: 1;
	padding: 4px 6px;
	border: 1px solid var(--border);
	border-radius: 6px;
	background: var(--fill-light);
	color: var(--text-primary);
	font-size: 11px;
	outline: none;

	&:focus {
		border-color: var(--accent-border);
	}
`;

export const VarAddBtn = styled.button`
	padding: 3px 8px;
	font-size: 10px;
	background: none;
	color: var(--text-tertiary);
	border: 1px dashed var(--border);
	border-radius: 6px;
	cursor: pointer;
	align-self: flex-start;

	&:hover {
		background: var(--fill-hover);
		color: var(--text-secondary);
	}
`;

export const VarDeleteBtn = styled.button`
	padding: 2px 4px;
	font-size: 12px;
	background: none;
	color: var(--text-faint);
	border: none;
	cursor: pointer;
	line-height: 1;
	flex-shrink: 0;

	&:hover {
		color: var(--red);
	}
`;

export const VarHint = styled.span`
	font-size: 10px;
	color: var(--text-hint);
	font-style: italic;
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

// ---------------------------------------------------------------------------
// Variable insertion dropdown
// ---------------------------------------------------------------------------

export const VarInsertBtn = styled.button`
	padding: 4px 8px;
	font-size: 11px;
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	background: var(--fill);
	color: var(--text-tertiary);
	border: 1px solid var(--border-medium);
	border-radius: 6px;
	cursor: pointer;
	white-space: nowrap;
	flex-shrink: 0;
	align-self: flex-start;

	&:hover {
		background: var(--fill-hover);
		color: var(--text-secondary);
	}
`;

export const VarDropdownWrap = styled.div`
	position: relative;
`;

export const VarDropdown = styled.div`
	position: absolute;
	top: calc(100% + 4px);
	right: 0;
	min-width: 160px;
	padding: 4px;
	border-radius: 8px;
	background: var(--bg-elevated);
	border: 1px solid var(--border-medium);
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
	z-index: 100;
	display: flex;
	flex-direction: column;
	gap: 1px;
`;

export const VarDropdownItem = styled.button`
	padding: 5px 8px;
	font-size: 11px;
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	background: none;
	color: var(--text-secondary);
	border: none;
	border-radius: 4px;
	cursor: pointer;
	text-align: left;

	&:hover {
		background: var(--fill-hover);
		color: var(--text-primary);
	}
`;

// ---------------------------------------------------------------------------
// Preview section
// ---------------------------------------------------------------------------

export const PreviewSection = styled.div`
	padding: 8px 10px;
	border-radius: 6px;
	background: var(--fill-subtle);
	border: 1px dashed var(--border);
`;

export const PreviewLabel = styled.div`
	font-size: 10px;
	font-weight: 600;
	color: var(--text-label);
	text-transform: uppercase;
	letter-spacing: 0.4px;
	margin-bottom: 4px;
`;

export const PreviewText = styled.div`
	font-size: 12px;
	color: var(--text-secondary);
	white-space: pre-wrap;
	word-wrap: break-word;
	line-height: 1.4;
`;

// ---------------------------------------------------------------------------
// Ctrl+Enter hint
// ---------------------------------------------------------------------------

export const CtrlEnterHint = styled.span`
	font-size: 10px;
	color: var(--text-hint);
	align-self: center;
	white-space: nowrap;
	flex-shrink: 0;
`;

export default styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;
