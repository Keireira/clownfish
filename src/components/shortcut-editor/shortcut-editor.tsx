import { useState } from 'react';
import Root, {
	Grid,
	Card,
	CardChar,
	CardTrigger,
	CardDelete,
	AddRow,
	TriggerInput,
	ExpansionInput,
	SmallBtn,
	SectionLabel,
	EmptyState
} from './shortcut-editor.styles';
import { useLanguage } from '../../i18n';
import type { Shortcut } from '../../types';

type Props = {
	shortcuts: Shortcut[];
	onChange: (shortcuts: Shortcut[]) => void;
};

const ShortcutEditor = ({ shortcuts, onChange }: Props) => {
	const t = useLanguage();
	const [newTrigger, setNewTrigger] = useState('');
	const [newExpansion, setNewExpansion] = useState('');

	const handleAdd = () => {
		let trigger = newTrigger.trim();
		const expansion = newExpansion.trim();
		if (!trigger || !expansion) return;

		if (!trigger.startsWith(':')) trigger = ':' + trigger;
		if (!trigger.endsWith(':')) trigger = trigger + ':';

		if (shortcuts.some((s) => s.trigger === trigger)) return;

		onChange([...shortcuts, { trigger, expansion }]);
		setNewTrigger('');
		setNewExpansion('');
	};

	const handleDelete = (idx: number) => {
		onChange(shortcuts.filter((_, i) => i !== idx));
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') handleAdd();
	};

	return (
		<Root>
			<SectionLabel>{t('shortcuts_count', shortcuts.length)}</SectionLabel>

			{shortcuts.length === 0 && <EmptyState>{t('no_shortcuts')}</EmptyState>}

			<Grid>
				{shortcuts.map((s, idx) => (
					<Card key={s.trigger} title={`${s.trigger}  ${s.expansion}`}>
						<CardChar>{s.expansion}</CardChar>
						<CardTrigger>{s.trigger}</CardTrigger>
						<CardDelete onClick={() => handleDelete(idx)}>&times;</CardDelete>
					</Card>
				))}
			</Grid>

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
		</Root>
	);
};

export default ShortcutEditor;
