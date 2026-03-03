import { useState, useEffect } from 'react';
import Root from './language-picker.styles';
import { getLanguageChoice, setLanguageChoice } from '../../i18n';
import type { LanguageChoice } from '../../types';

const OPTIONS: LanguageChoice[] = ['auto', 'en', 'ru', 'es', 'ja'];
const NATIVE_LABELS: Record<LanguageChoice, string> = {
	auto: 'Auto',
	en: 'English',
	ru: 'Русский',
	es: 'Español',
	ja: '日本語'
};

const LanguagePicker = () => {
	const [choice, setChoice] = useState<LanguageChoice>('auto');

	useEffect(() => {
		getLanguageChoice().then(setChoice);
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value as LanguageChoice;
		setChoice(value);
		setLanguageChoice(value);
	};

	return (
		<Root value={choice} onChange={handleChange}>
			{OPTIONS.map((opt) => (
				<option key={opt} value={opt}>
					{NATIVE_LABELS[opt]}
				</option>
			))}
		</Root>
	);
};

export default LanguagePicker;
