import { useState } from 'react';
import Root, {
	Picker,
	Header,
	CloseBtn,
	Body,
	PresetCategory,
	PresetCatLabel,
	PresetGrid,
	PresetCharBtn,
	Footer,
	PresetCount,
	BtnSecondary,
	BtnPrimary
} from './preset-picker.styles';
import { PRESET_CATEGORIES } from '../../data/presets';
import { useLanguage, translateCategoryName } from '../../i18n';

import { displayChar, type CharEntry } from '../../types';
import type { Props } from './preset-picker.d';

const PresetPicker = ({ onAdd, onClose, existingChars }: Props) => {
	const t = useLanguage();
	const [selected, setSelected] = useState<Set<string>>(new Set());

	const toggle = (char: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(char)) {
				next.delete(char);
			} else {
				next.add(char);
			}
			return next;
		});
	};

	const handleAdd = () => {
		const chars: CharEntry[] = [];
		for (const cat of PRESET_CATEGORIES) {
			for (const entry of cat.chars) {
				if (selected.has(entry[0])) {
					chars.push(entry);
				}
			}
		}
		onAdd(chars);
	};

	const existingSet = new Set(existingChars);

	return (
		<Root>
			<Picker>
				<Header>
					<h3>{t('add_from_presets')}</h3>
					<CloseBtn onClick={onClose}>&times;</CloseBtn>
				</Header>

				<Body>
					{PRESET_CATEGORIES.map((cat) => (
						<PresetCategory key={cat.name}>
							<PresetCatLabel>{translateCategoryName(cat.name)}</PresetCatLabel>
							<PresetGrid>
								{cat.chars.map(([char, name]) => {
									const alreadyAdded = existingSet.has(char);
									const isSelected = selected.has(char);
									return (
										<PresetCharBtn
											key={char}
											$selected={isSelected}
											$exists={alreadyAdded}
											title={alreadyAdded ? `${char} ${name} (${t('already_added')})` : `${char} ${name}`}
											onClick={() => !alreadyAdded && toggle(char)}
											disabled={alreadyAdded}
										>
											{displayChar(char)}
										</PresetCharBtn>
									);
								})}
							</PresetGrid>
						</PresetCategory>
					))}
				</Body>

				<Footer>
					<PresetCount>{t('n_selected', selected.size)}</PresetCount>
					<BtnSecondary onClick={onClose}>{t('cancel')}</BtnSecondary>
					<BtnPrimary onClick={handleAdd} disabled={selected.size === 0}>
						{t('add_selected')}
					</BtnPrimary>
				</Footer>
			</Picker>
		</Root>
	);
};

export default PresetPicker;
