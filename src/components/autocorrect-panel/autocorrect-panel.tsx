import { useState } from 'react';
import { useLanguage } from '../../i18n';
import type { AutoCorrectRule } from '../../types';
import {
	RuleRow,
	RulePattern,
	RuleArrow,
	RuleReplacement,
	RuleDeleteBtn,
	AddRow,
	AddInput,
	AddBtn,
	EmptyState
} from './autocorrect-panel.styles';

type Props = {
	rules: AutoCorrectRule[];
	onChange: (rules: AutoCorrectRule[]) => void;
	onDelete?: (idx: number) => void;
};

const AutocorrectPanel = ({ rules, onChange, onDelete }: Props) => {
	const t = useLanguage();
	const [newPattern, setNewPattern] = useState('');
	const [newReplacement, setNewReplacement] = useState('');

	const handleAdd = () => {
		const pattern = newPattern.trim();
		const replacement = newReplacement.trim();
		if (!pattern || !replacement) return;
		if (rules.some((r) => r.pattern === pattern)) return;
		onChange([...rules, { pattern, replacement }]);
		setNewPattern('');
		setNewReplacement('');
	};

	const handleDelete = (idx: number) => {
		if (onDelete) {
			onDelete(idx);
		} else {
			onChange(rules.filter((_, i) => i !== idx));
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') handleAdd();
	};

	return (
		<>
			<AddRow>
				<AddInput
					value={newPattern}
					onChange={(e) => setNewPattern(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={t('autocorrect_pattern_placeholder') as string}
				/>
				<AddInput
					value={newReplacement}
					onChange={(e) => setNewReplacement(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={t('autocorrect_replacement_placeholder') as string}
				/>
				<AddBtn onClick={handleAdd} disabled={!newPattern.trim() || !newReplacement.trim()}>
					{t('add')}
				</AddBtn>
			</AddRow>

			{rules.length === 0 && <EmptyState>{t('autocorrect_empty')}</EmptyState>}

			{rules.map((rule, idx) => (
				<RuleRow key={`${rule.pattern}-${idx}`}>
					<RulePattern>{rule.pattern}</RulePattern>
					<RuleArrow>&rarr;</RuleArrow>
					<RuleReplacement>{rule.replacement}</RuleReplacement>
					<RuleDeleteBtn onClick={() => handleDelete(idx)}>&times;</RuleDeleteBtn>
				</RuleRow>
			))}
		</>
	);
};

export default AutocorrectPanel;
