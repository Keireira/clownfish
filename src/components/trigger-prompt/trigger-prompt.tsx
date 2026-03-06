import { useState, useEffect, useMemo } from 'react';
import Root, {
	Picker,
	Header,
	CloseBtn,
	Body,
	CharDisplay,
	CharName,
	Input,
	Preview,
	ErrorText,
	Footer,
	BtnSecondary,
	BtnPrimary
} from './trigger-prompt.styles';
import { useLanguage } from '../../i18n';
import { loadTriggerChar } from '../../store';

import { displayChar } from '../../types';
import type { Props } from './trigger-prompt.d';

/** "Left Arrow" → "left_arrow", strip non-alphanum */
function toKeyword(name: string): string {
	return name
		.toLowerCase()
		.replace(/[\s\-]+/g, '_')
		.replace(/[^a-z0-9_]/g, '')
		.replace(/^_+|_+$/g, '');
}

/** Return a unique keyword given existing triggers and trigger char */
function uniqueKeyword(base: string, tc: string, existing: string[]): string {
	if (base.length === 0) return '';
	const set = new Set(existing);
	if (!set.has(tc + base)) return base;
	for (let i = 2; ; i++) {
		const candidate = `${base}_${i}`;
		if (!set.has(tc + candidate)) return candidate;
	}
}

const TriggerPrompt = ({ char, name, existingTriggers, onAdd, onClose }: Props) => {
	const t = useLanguage();
	const [tc, setTc] = useState('\\');
	const [tcLoaded, setTcLoaded] = useState(false);

	useEffect(() => {
		loadTriggerChar().then((ch) => {
			setTc(ch);
			setTcLoaded(true);
		});
	}, []);

	const defaultKeyword = useMemo(
		() => (tcLoaded ? uniqueKeyword(toKeyword(name), tc, existingTriggers) : ''),
		[name, tc, existingTriggers, tcLoaded]
	);

	const [keyword, setKeyword] = useState<string | null>(null);
	const current = keyword ?? defaultKeyword;

	const trimmed = current.trim();
	const fullTrigger = tc + trimmed;
	const duplicate = trimmed.length > 0 && existingTriggers.includes(fullTrigger);
	const canAdd = trimmed.length > 0 && !duplicate;

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && canAdd) onAdd(trimmed);
		if (e.key === 'Escape') onClose();
	};

	return (
		<Root>
			<Picker>
				<Header>
					<h3>{t('enter_trigger')}</h3>
					<CloseBtn onClick={onClose}>&times;</CloseBtn>
				</Header>

				<Body>
					<CharDisplay>{displayChar(char)}</CharDisplay>
					<CharName>{name}</CharName>
					<Input
						type="text"
						value={current}
						onChange={(e) => setKeyword(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={t('trigger_keyword_placeholder') as string}
						autoFocus
						spellCheck={false}
						autoCorrect="off"
						autoComplete="off"
					/>
					{trimmed.length > 0 && (
						<Preview>
							{fullTrigger} → {char}
						</Preview>
					)}
					{duplicate && <ErrorText>{t('trigger_exists')}</ErrorText>}
				</Body>

				<Footer>
					<BtnSecondary onClick={onClose}>{t('cancel')}</BtnSecondary>
					<BtnPrimary onClick={() => onAdd(trimmed)} disabled={!canAdd}>
						{t('add')}
					</BtnPrimary>
				</Footer>
			</Picker>
		</Root>
	);
};

export default TriggerPrompt;
