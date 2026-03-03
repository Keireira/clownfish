import { useState, useEffect } from 'react';
import Root, { Options, Option, OptionLabel, OptionDesc } from './theme-picker.styles';
import { getThemeChoice, setThemeChoice } from '../../theme';
import { useLanguage } from '../../i18n';

import type { ThemeChoice } from '../../types';

const OPTIONS: ThemeChoice[] = ['auto', 'light', 'dark'];
const LABEL_KEYS: Record<ThemeChoice, string> = { auto: 'theme_auto', light: 'theme_light', dark: 'theme_dark' };
const DESC_KEYS: Record<ThemeChoice, string> = {
	auto: 'theme_auto_desc',
	light: 'theme_light_desc',
	dark: 'theme_dark_desc'
};

const ThemePicker = () => {
	const t = useLanguage();
	const [choice, setChoice] = useState<ThemeChoice>('auto');

	useEffect(() => {
		getThemeChoice().then(setChoice);
	}, []);

	const handleChange = (value: ThemeChoice) => {
		setChoice(value);
		setThemeChoice(value);
	};

	return (
		<Root>
			<label className="theme-section-label">{t('theme_label')}</label>

			<Options>
				{OPTIONS.map((opt) => (
					<Option key={opt} $active={choice === opt} onClick={() => handleChange(opt)}>
						<OptionLabel $active={choice === opt}>{t(LABEL_KEYS[opt])}</OptionLabel>
						<OptionDesc>{t(DESC_KEYS[opt])}</OptionDesc>
					</Option>
				))}
			</Options>
		</Root>
	);
};

export default ThemePicker;
