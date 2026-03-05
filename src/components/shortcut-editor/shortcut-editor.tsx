import { useState, useRef, useEffect } from 'react';
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

const ShortcutEditor = ({ shortcuts, onChange, onDelete, filterQuery }: Props) => {
	const t = useLanguage();
	const [newTrigger, setNewTrigger] = useState('');
	const [newExpansion, setNewExpansion] = useState('');
	const [editIdx, setEditIdx] = useState<number | null>(null);
	const [editTrigger, setEditTrigger] = useState('');
	const [editExpansion, setEditExpansion] = useState('');
	const [editVars, setEditVars] = useState<[string, string][]>([]);
	const [tc, setTc] = useState(':');
	const editRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		loadTriggerChar().then(setTc);
	}, []);

	const stripTc = (s: string) => {
		let r = s;
		if (r.startsWith(tc)) r = r.slice(1);
		if (r.endsWith(tc)) r = r.slice(0, -1);
		return r;
	};

	const handleAdd = () => {
		const keyword = newTrigger.trim().replace(new RegExp(`^\\${tc}|\\${tc}$`, 'g'), '');
		const expansion = newExpansion.trim();
		if (!keyword || !expansion) return;

		const trigger = tc + keyword + tc;
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
		if (e.key === 'Enter' && !e.shiftKey) handleAdd();
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
		const keyword = editTrigger.trim().replace(new RegExp(`^\\${tc}|\\${tc}$`, 'g'), '');
		const expansion = editExpansion.trim();
		if (!keyword || !expansion) {
			setEditIdx(null);
			return;
		}
		const trigger = tc + keyword + tc;

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
		if (e.key === 'Enter' && !e.shiftKey) commitEdit();
		if (e.key === 'Escape') setEditIdx(null);
	};

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
								<EditExpansionTextarea
									value={editExpansion}
									onChange={(e) => setEditExpansion(e.target.value)}
									onKeyDown={handleEditKeyDown}
									rows={1}
								/>
							</EditTopRow>

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
