import { useState, useRef, useEffect } from 'react';
import Root, {
	Grid,
	Card,
	CardChar,
	CardTrigger,
	CardDelete,
	EditRow,
	EditTriggerInput,
	EditExpansionInput,
	AddRow,
	TriggerInput,
	ExpansionInput,
	SmallBtn,
	EmptyState
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

const ShortcutEditor = ({ shortcuts, onChange, onDelete, filterQuery }: Props) => {
	const t = useLanguage();
	const [newTrigger, setNewTrigger] = useState('');
	const [newExpansion, setNewExpansion] = useState('');
	const [editIdx, setEditIdx] = useState<number | null>(null);
	const [editTrigger, setEditTrigger] = useState('');
	const [editExpansion, setEditExpansion] = useState('');
	const [tc, setTc] = useState(':');
	const editRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		loadTriggerChar().then(setTc);
	}, []);

	/** Strip trigger chars from both ends of a trigger string. */
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
		if (e.key === 'Enter') handleAdd();
	};

	const startEdit = (idx: number) => {
		setEditIdx(idx);
		setEditTrigger(stripTc(shortcuts[idx].trigger));
		setEditExpansion(shortcuts[idx].expansion);
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

		// Check for duplicate trigger (except self)
		if (shortcuts.some((s, i) => i !== editIdx && s.trigger === trigger)) {
			setEditIdx(null);
			return;
		}

		onChange(shortcuts.map((s, i) => (i === editIdx ? { trigger, expansion } : s)));
		setEditIdx(null);
	};

	const handleEditKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') commitEdit();
		if (e.key === 'Escape') setEditIdx(null);
	};

	// Close edit on outside click
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

	return (
		<Root>
			<AddRow>
				<TriggerInput
					value={newTrigger}
					onChange={(e) => setNewTrigger(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={t('shortcut_trigger_placeholder') as string}
				/>
				<ExpansionInput
					value={newExpansion}
					onChange={(e) => setNewExpansion(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={t('shortcut_expansion_placeholder') as string}
				/>
				<SmallBtn onClick={handleAdd}>{t('add')}</SmallBtn>
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
							<EditTriggerInput
								value={editTrigger}
								onChange={(e) => setEditTrigger(e.target.value)}
								onKeyDown={handleEditKeyDown}
								autoFocus
							/>
							<EditExpansionInput
								value={editExpansion}
								onChange={(e) => setEditExpansion(e.target.value)}
								onKeyDown={handleEditKeyDown}
							/>
						</EditRow>
					) : (
						<Card key={s.trigger} onClick={() => startEdit(idx)}>
							<CardChar>{s.expansion}</CardChar>
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
