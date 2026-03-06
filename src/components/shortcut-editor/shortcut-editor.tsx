import { useState, useRef, useEffect, useCallback } from 'react';
import Root, {
	Grid,
	Card,
	CardChar,
	CardTrigger,
	CardDelete,
	CardBadge,
	EditRow,
	EditTopRow,
	EditTriggerInput,
	EditExpansionTextarea,
	TextareaWrap,
	HighlightDiv,
	VarHighlight,
	AddRow,
	TriggerInput,
	ExpansionTextarea,
	SmallBtn,
	EmptyState,
	VarsSection,
	VarsSectionHeader,
	VarsSectionLabel,
	VarRow,
	VarKeyInput,
	VarArrow,
	VarValueInput,
	VarAddBtn,
	VarDeleteBtn,
	VarHint,
	VarInsertBtn,
	VarDropdownWrap,
	VarDropdown,
	VarDropdownItem,
	PreviewSection,
	PreviewLabel,
	PreviewText,
	CtrlEnterHint,
	HelpWrap,
	HelpBtn,
	HelpTooltip,
	HelpCode,
	HelpTitle,
	HelpRow,
	HelpDivider
} from './shortcut-editor.styles';
import { useLanguage } from '../../i18n';
import { loadTriggerChar } from '../../store';
import { charMatchesQuery } from '../../utils/char-match';
import type { Shortcut } from '../../types';

type Props = {
	shortcuts: Shortcut[];
	onChange: (shortcuts: Shortcut[]) => void;
	onDelete?: (idx: number) => void;
	filterQuery?: string;
};

/** Built-in variable names resolved by the Rust engine. */
const BUILTIN_VARS = new Set(['date', 'time']);
const BUILTIN_RE = /^random:\d+$/;

function isBuiltinVar(name: string): boolean {
	return BUILTIN_VARS.has(name) || BUILTIN_RE.test(name);
}

/** Extract user-defined {{...}} variable names from expansion text. */
function extractUserVarNames(expansion: string): string[] {
	const re = /\{\{(\w[\w:]*)\}\}/g;
	const names: string[] = [];
	let m: RegExpExecArray | null;
	while ((m = re.exec(expansion)) !== null) {
		if (!isBuiltinVar(m[1]) && !names.includes(m[1])) {
			names.push(m[1]);
		}
	}
	return names;
}

/** Check if expansion text contains any {{...}} patterns. */
function hasTemplates(expansion: string): boolean {
	return /\{\{.+?\}\}/.test(expansion);
}

/**
 * Format a Date using moment/Luxon-style tokens to match the Rust engine.
 * Tokens: YYYY, YY, MMMM, MMM, MM, M, DD, D, dddd, ddd, HH, H, hh, h, mm, m, ss, s, A, a
 */
function formatMoment(d: Date, fmt: string): string {
	const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	const DAYS_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
	const pad2 = (n: number) => String(n).padStart(2, '0');
	const h12 = (h: number) => h % 12 || 12;

	const tokens: [string, () => string][] = [
		['YYYY', () => String(d.getFullYear())],
		['yyyy', () => String(d.getFullYear())],
		['MMMM', () => MONTHS_FULL[d.getMonth()]],
		['EEEE', () => DAYS_FULL[d.getDay()]],
		['dddd', () => DAYS_FULL[d.getDay()]],
		['MMM',  () => MONTHS_SHORT[d.getMonth()]],
		['EEE',  () => DAYS_SHORT[d.getDay()]],
		['ddd',  () => DAYS_SHORT[d.getDay()]],
		['YY',   () => String(d.getFullYear()).slice(-2)],
		['yy',   () => String(d.getFullYear()).slice(-2)],
		['MM',   () => pad2(d.getMonth() + 1)],
		['DD',   () => pad2(d.getDate())],
		['dd',   () => pad2(d.getDate())],
		['HH',   () => pad2(d.getHours())],
		['hh',   () => pad2(h12(d.getHours()))],
		['mm',   () => pad2(d.getMinutes())],
		['ss',   () => pad2(d.getSeconds())],
		['M',    () => String(d.getMonth() + 1)],
		['D',    () => String(d.getDate())],
		['d',    () => String(d.getDate())],
		['H',    () => String(d.getHours())],
		['h',    () => String(h12(d.getHours()))],
		['m',    () => String(d.getMinutes())],
		['s',    () => String(d.getSeconds())],
		['A',    () => d.getHours() < 12 ? 'AM' : 'PM'],
		['a',    () => d.getHours() < 12 ? 'AM' : 'PM'],
	];

	let result = '';
	let i = 0;
	while (i < fmt.length) {
		if (fmt[i] === "'") {
			i++;
			while (i < fmt.length && fmt[i] !== "'") {
				result += fmt[i++];
			}
			if (i < fmt.length) i++; // skip closing '
			continue;
		}
		const rest = fmt.slice(i);
		let matched = false;
		for (const [tok, fn] of tokens) {
			if (rest.startsWith(tok)) {
				result += fn();
				i += tok.length;
				matched = true;
				break;
			}
		}
		if (!matched) result += fmt[i++];
	}
	return result;
}

/** Parse offset like "7d", "1m", "2w", "1y", "30s", "2h" → [number, unit] */
function parseOffset(s: string): [number, string] | null {
	const m = /^(\d+)([a-zA-Z])$/.exec(s);
	return m ? [parseInt(m[1]), m[2]] : null;
}

/** Split "date+7d:DD.MM.YYYY" → ["date+7d", "DD.MM.YYYY"] */
function splitKeyFormat(key: string, prefix: string): [string, string | null] {
	const after = key.slice(prefix.length);
	const colon = after.indexOf(':');
	if (colon >= 0) {
		return [key.slice(0, prefix.length + colon), after.slice(colon + 1)];
	}
	return [key, null];
}

/** Add months to a date, clamping day if needed. */
function addMonths(d: Date, months: number): Date {
	const r = new Date(d);
	const targetMonth = r.getMonth() + months;
	r.setMonth(targetMonth);
	// Clamp: if the month overshot (e.g. Jan 31 + 1m → Mar 3), step back
	if (r.getMonth() !== ((targetMonth % 12) + 12) % 12) {
		r.setDate(0); // last day of previous month
	}
	return r;
}

/** Resolve date/date+Nd/date:FMT/date+Nd:FMT — mirrors Rust resolve_date. */
function resolveDate(key: string): string {
	const [base, userFmt] = splitKeyFormat(key, 'date');
	// In date context, mm (minutes) doesn't make sense — treat as MM (month)
	const fmt = userFmt?.replace(/mm/g, 'MM') ?? 'YYYY-MM-DD';
	let d = new Date();

	if (base !== 'date') {
		const sign = base.startsWith('date+') ? 1 : -1;
		const rest = base.slice(5);
		const parsed = parseOffset(rest);
		if (parsed) {
			const [n, unit] = parsed;
			const delta = n * sign;
			if (unit === 'd') d.setDate(d.getDate() + delta);
			else if (unit === 'w') d.setDate(d.getDate() + delta * 7);
			else if (unit === 'm') d = addMonths(d, delta);
			else if (unit === 'y') d.setFullYear(d.getFullYear() + delta);
		}
	}
	return formatMoment(d, fmt);
}

/** Resolve time/time+1h/time:HH:mm:ss — mirrors Rust resolve_time. */
function resolveTime(key: string): string {
	const [base, userFmt] = splitKeyFormat(key, 'time');
	// In time context, MM (month) doesn't make sense — treat as mm (minutes)
	const fmt = userFmt?.replace(/MM/g, 'mm') ?? 'HH:mm';
	const d = new Date();

	if (base !== 'time') {
		const sign = base.startsWith('time+') ? 1 : -1;
		const rest = base.slice(5);
		const parsed = parseOffset(rest);
		if (parsed) {
			const [n, unit] = parsed;
			const delta = n * sign;
			if (unit === 'h') d.setHours(d.getHours() + delta);
			else if (unit === 'm') d.setMinutes(d.getMinutes() + delta);
			else if (unit === 's') d.setSeconds(d.getSeconds() + delta);
		}
	}
	return formatMoment(d, fmt);
}


const ShortcutEditor = ({ shortcuts, onChange, onDelete, filterQuery }: Props) => {
	const t = useLanguage();
	const [newTrigger, setNewTrigger] = useState('');
	const [newExpansion, setNewExpansion] = useState('');
	const [editIdx, setEditIdx] = useState<number | null>(null);
	const [editTrigger, setEditTrigger] = useState('');
	const [editExpansion, setEditExpansion] = useState('');
	const [editVars, setEditVars] = useState<[string, string][]>([]);
	const [showVarDropdown, setShowVarDropdown] = useState(false);
	const [tc, setTc] = useState('\\');
	const editRef = useRef<HTMLDivElement>(null);
	const editTextareaRef = useRef<HTMLTextAreaElement>(null);
	const highlightRef = useRef<HTMLDivElement>(null);
	const varDropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		loadTriggerChar().then(setTc);
	}, []);

	const stripTc = (s: string) => {
		let r = s;
		if (r.startsWith(tc)) r = r.slice(1);
		return r;
	};

	const handleAdd = () => {
		const keyword = newTrigger.trim().replace(new RegExp(`^\\${tc}`, 'g'), '');
		const expansion = newExpansion.trim();
		if (!keyword || !expansion) return;

		const trigger = tc + keyword;
		if (shortcuts.some((s) => s.trigger === trigger)) return;

		onChange([...shortcuts, { trigger, expansion }]);
		setNewTrigger('');
		setNewExpansion('');
	};

	const handleDelete = (idx: number) => {
		if (editIdx === idx) setEditIdx(null);
		if (onDelete) {
			onDelete(idx);
		} else {
			onChange(shortcuts.filter((_, i) => i !== idx));
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAdd();
	};

	const startEdit = (idx: number) => {
		setEditIdx(idx);
		setEditTrigger(stripTc(shortcuts[idx].trigger));
		setEditExpansion(shortcuts[idx].expansion);
		const vars = shortcuts[idx].variables ?? {};
		setEditVars(Object.entries(vars));
	};

	const commitEdit = () => {
		if (editIdx === null) return;
		const keyword = editTrigger.trim().replace(new RegExp(`^\\${tc}`, 'g'), '');
		const expansion = editExpansion.trim();
		if (!keyword || !expansion) {
			setEditIdx(null);
			return;
		}
		const trigger = tc + keyword;

		if (shortcuts.some((s, i) => i !== editIdx && s.trigger === trigger)) {
			setEditIdx(null);
			return;
		}

		const variables: Record<string, string> = {};
		for (const [k, v] of editVars) {
			const key = k.trim();
			if (key) variables[key] = v;
		}

		const hasVars = Object.keys(variables).length > 0;
		onChange(
			shortcuts.map((s, i) =>
				i === editIdx ? { trigger, expansion, ...(hasVars ? { variables } : {}) } : s
			)
		);
		setEditIdx(null);
	};

	const handleEditKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) commitEdit();
		if (e.key === 'Escape') setEditIdx(null);
	};

	const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			commitEdit();
			return;
		}
		if (e.key === 'Escape') {
			setEditIdx(null);
			return;
		}
		if (e.key === 'Tab') {
			e.preventDefault();
			const ta = e.currentTarget;
			const s = ta.selectionStart;
			const end = ta.selectionEnd;
			const val = ta.value;
			setEditExpansion(val.slice(0, s) + '\t' + val.slice(end));
			requestAnimationFrame(() => ta.setSelectionRange(s + 1, s + 1));
		}
	};

	const handleTextareaScroll = () => {
		if (editTextareaRef.current && highlightRef.current) {
			highlightRef.current.scrollTop = editTextareaRef.current.scrollTop;
		}
	};

	/** Available variables for the insertion dropdown. */
	const availableVars = useCallback(() => {
		const builtins = ['date', 'time', 'random:6', 'date:DD.MM.YYYY'];
		const userVars = editVars.map(([k]) => k).filter(Boolean);
		return [...builtins, ...userVars.filter((v) => !builtins.includes(v))];
	}, [editVars]);

	const insertVariable = (varName: string) => {
		const ta = editTextareaRef.current;
		if (!ta) return;
		const s = ta.selectionStart;
		const end = ta.selectionEnd;
		const insert = `{{${varName}}}`;
		setEditExpansion(ta.value.slice(0, s) + insert + ta.value.slice(end));
		setShowVarDropdown(false);
		requestAnimationFrame(() => {
			ta.focus();
			const pos = s + insert.length;
			ta.setSelectionRange(pos, pos);
		});
	};

	/** Client-side preview resolver. */
	const resolvePreview = (expansion: string, vars: [string, string][]): string =>
		expansion.replace(/\{\{([^}]+)\}\}/g, (m, key: string) => {
			if (key === 'date' || key.startsWith('date:') || key.startsWith('date+') || key.startsWith('date-'))
				return resolveDate(key);
			if (key === 'time' || key.startsWith('time:') || key.startsWith('time+') || key.startsWith('time-'))
				return resolveTime(key);
			if (key.startsWith('random:'))
				return 'a'.repeat(parseInt(key.slice(7)) || 6);
			const v = vars.find(([k]) => k === key);
			return v ? (v[1] || `[${key}]`) : m;
		});

	/** Close var dropdown on outside click. */
	useEffect(() => {
		if (!showVarDropdown) return;
		const handler = (e: MouseEvent) => {
			if (varDropdownRef.current && !varDropdownRef.current.contains(e.target as Node)) {
				setShowVarDropdown(false);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [showVarDropdown]);

	useEffect(() => {
		if (editIdx === null) return;
		const handler = (e: MouseEvent) => {
			if (editRef.current && !editRef.current.contains(e.target as Node)) {
				commitEdit();
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	});

	/** Auto-detect {{...}} and add missing variable rows. */
	useEffect(() => {
		if (editIdx === null) return;
		const needed = extractUserVarNames(editExpansion);
		const existing = new Set(editVars.map(([k]) => k));
		const missing = needed.filter((n) => !existing.has(n));
		if (missing.length > 0) {
			setEditVars((prev) => [...prev, ...missing.map((n): [string, string] => [n, ''])]);
		}
	}, [editExpansion]); // eslint-disable-line react-hooks/exhaustive-deps

	const updateVar = (i: number, field: 0 | 1, value: string) => {
		setEditVars((prev) =>
			prev.map((row, j) => {
				if (j !== i) return row;
				const copy: [string, string] = [row[0], row[1]];
				copy[field] = value;
				return copy;
			})
		);
	};

	const removeVar = (i: number) => {
		setEditVars((prev) => prev.filter((_, j) => j !== i));
	};

	const addVar = () => {
		setEditVars((prev) => [...prev, ['', '']]);
	};

	const handleCardKeyDown = (e: React.KeyboardEvent, dataIdx: number) => {
		const grid = (e.currentTarget as HTMLElement).parentElement;
		if (!grid) return;

		if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
			e.preventDefault();
			const items = Array.from(grid.querySelectorAll<HTMLElement>('[tabindex="0"]'));
			const domIdx = items.indexOf(e.currentTarget as HTMLElement);
			const cols = Math.max(1, Math.floor((grid.clientWidth + 4) / (76 + 4)));
			let next = domIdx;
			if (e.key === 'ArrowRight') next = Math.min(domIdx + 1, items.length - 1);
			else if (e.key === 'ArrowLeft') next = Math.max(domIdx - 1, 0);
			else if (e.key === 'ArrowDown') next = Math.min(domIdx + cols, items.length - 1);
			else if (e.key === 'ArrowUp') next = Math.max(domIdx - cols, 0);
			items[next]?.focus();
		} else if (e.key === 'Delete' || e.key === 'Backspace') {
			e.preventDefault();
			handleDelete(dataIdx);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			startEdit(dataIdx);
		}
	};

	/** Display-friendly expansion text for the card. */
	const displayExpansion = (expansion: string) => {
		const first = expansion.split('\n')[0];
		return first.length > 8 ? first.slice(0, 8) + '\u2026' : first;
	};

	/** Whether this shortcut is a template (has variables or {{...}} patterns). */
	const isTemplate = (s: Shortcut) =>
		(s.variables && Object.keys(s.variables).length > 0) || hasTemplates(s.expansion);

	/** Whether to show the full variables panel vs just the add button. */
	const hasVarsContent = editVars.length > 0 || hasTemplates(editExpansion);

	const HighlightOverlay = ({ text }: { text: string }) => {
		const parts = text.split(/(\{\{[^}]+\}\})/g);
		return (
			<HighlightDiv ref={highlightRef} aria-hidden="true">
				{parts.map((p, i) =>
					/^\{\{[^}]+\}\}$/.test(p) ? (
						<VarHighlight key={i}>{p}</VarHighlight>
					) : (
						<span key={i}>{p || '\u200b'}</span>
					)
				)}
			</HighlightDiv>
		);
	};

	return (
		<Root>
			<AddRow>
				<TriggerInput
					value={newTrigger}
					onChange={(e) => setNewTrigger(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={t('shortcut_trigger_placeholder') as string}
				/>
				<ExpansionTextarea
					value={newExpansion}
					onChange={(e) => setNewExpansion(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={t('shortcut_expansion_placeholder') as string}
					rows={1}
				/>
				<SmallBtn onClick={handleAdd}>{t('add')}</SmallBtn>
				<HelpWrap>
					<HelpBtn>?</HelpBtn>
					<HelpTooltip>
						<HelpTitle>{t('var_help_title')}</HelpTitle>
						<div>{t('var_help_body')}</div>
						<HelpDivider />
						<HelpRow><HelpCode>{'{{date}}'}</HelpCode> <span>{t('var_help_date')}</span></HelpRow>
						<HelpRow><HelpCode>{'{{time}}'}</HelpCode> <span>{t('var_help_time')}</span></HelpRow>
						<HelpRow><HelpCode>{'{{random:N}}'}</HelpCode> <span>{t('var_help_random')}</span></HelpRow>
						<HelpRow><HelpCode>{'{{name}}'}</HelpCode> <span>{t('var_help_custom')}</span></HelpRow>
					</HelpTooltip>
				</HelpWrap>
			</AddRow>

			{shortcuts.length === 0 && !filterQuery && <EmptyState>{t('no_shortcuts')}</EmptyState>}

			<Grid>
				{shortcuts.map((s, idx) => {
					if (filterQuery) {
						const fq = filterQuery.toLowerCase();
						const match =
							s.trigger.toLowerCase().includes(fq) ||
							s.expansion.toLowerCase().includes(fq) ||
							charMatchesQuery(s.expansion, '', filterQuery);
						if (!match) return null;
					}
					return editIdx === idx ? (
						<EditRow key={s.trigger} ref={editRef}>
							<EditTopRow>
								<EditTriggerInput
									value={editTrigger}
									onChange={(e) => setEditTrigger(e.target.value)}
									onKeyDown={handleEditKeyDown}
									autoFocus
								/>
								<TextareaWrap>
									<HighlightOverlay text={editExpansion} />
									<EditExpansionTextarea
										ref={editTextareaRef}
										value={editExpansion}
										onChange={(e) => setEditExpansion(e.target.value)}
										onKeyDown={handleTextareaKeyDown}
										onScroll={handleTextareaScroll}
									/>
								</TextareaWrap>
								<VarDropdownWrap ref={varDropdownRef}>
									<VarInsertBtn
										onClick={() => setShowVarDropdown((v) => !v)}
										title={t('insert_var') as string}
									>
										{'{{ }}'}
									</VarInsertBtn>
									{showVarDropdown && (
										<VarDropdown>
											{availableVars().map((v) => (
												<VarDropdownItem key={v} onClick={() => insertVariable(v)}>
													{`{{${v}}}`}
												</VarDropdownItem>
											))}
										</VarDropdown>
									)}
								</VarDropdownWrap>
								<CtrlEnterHint>{t('ctrl_enter_hint')}</CtrlEnterHint>
							</EditTopRow>

							{hasTemplates(editExpansion) && (
								<PreviewSection>
									<PreviewLabel>{t('compose_preview')}</PreviewLabel>
									<PreviewText>{resolvePreview(editExpansion, editVars)}</PreviewText>
								</PreviewSection>
							)}

							{hasVarsContent ? (
								<VarsSection>
									<VarsSectionHeader>
										<VarsSectionLabel>{t('var_section')}</VarsSectionLabel>
										<VarAddBtn onClick={addVar}>{t('var_add')}</VarAddBtn>
									</VarsSectionHeader>
									{editVars.map(([k, v], i) => (
										<VarRow key={i}>
											<VarKeyInput
												value={k}
												onChange={(e) => updateVar(i, 0, e.target.value)}
												placeholder={t('var_key_placeholder') as string}
											/>
											<VarArrow>&rarr;</VarArrow>
											<VarValueInput
												value={v}
												onChange={(e) => updateVar(i, 1, e.target.value)}
												placeholder={t('var_value_placeholder') as string}
											/>
											<VarDeleteBtn onClick={() => removeVar(i)}>
												&times;
											</VarDeleteBtn>
										</VarRow>
									))}
									<VarHint>{t('var_builtin_hint')}</VarHint>
								</VarsSection>
							) : (
								<VarAddBtn onClick={addVar}>{t('var_add')}</VarAddBtn>
							)}
						</EditRow>
					) : (
						<Card key={s.trigger} tabIndex={0} onKeyDown={(e) => handleCardKeyDown(e, idx)} onClick={() => startEdit(idx)}>
							{isTemplate(s) && <CardBadge />}
							<CardChar>{displayExpansion(s.expansion)}</CardChar>
							<CardTrigger>{s.trigger}</CardTrigger>
							<CardDelete
								onClick={(e) => {
									e.stopPropagation();
									handleDelete(idx);
								}}
							>
								&times;
							</CardDelete>
						</Card>
					);
				})}
			</Grid>

			{filterQuery &&
				shortcuts.length > 0 &&
				!shortcuts.some((s) => {
					const fq = filterQuery.toLowerCase();
					return (
						s.trigger.toLowerCase().includes(fq) ||
						s.expansion.toLowerCase().includes(fq) ||
						charMatchesQuery(s.expansion, '', filterQuery)
					);
				}) && <EmptyState>{t('nothing_found')}</EmptyState>}
		</Root>
	);
};

export default ShortcutEditor;
