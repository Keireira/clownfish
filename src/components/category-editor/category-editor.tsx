import { useState } from 'react';
import Root, {
	SectionLabel,
	NameInput,
	CharsHeader,
	CharGrid,
	CharItem,
	CharDelete,
	CharShortcutBadge,
	EmptyChars,
	AddRow,
	AddCharInput,
	AddNameInput,
	SmallBtn
} from './category-editor.styles';
import { useLanguage } from '../../i18n';

import { displayChar } from '../../types';
import type { Props } from './category-editor.d';

const CategoryEditor = ({ category, onChange, onOpenPresets, onDeleteChar, onAddShortcut, existingExpansions }: Props) => {
	const expansionSet = new Set(existingExpansions);
	const t = useLanguage();
	const [newChar, setNewChar] = useState('');
	const [newName, setNewName] = useState('');

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange({ ...category, name: e.target.value });
	};

	const handleAddChar = () => {
		const char = newChar.trim();
		const name = newName.trim() || char;
		if (!char) return;
		if (category.chars.some(([ch]) => ch === char)) return;
		onChange({ ...category, chars: [...category.chars, [char, name]] });
		setNewChar('');
		setNewName('');
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') handleAddChar();
	};

	const handleDeleteChar = (charIdx: number) => {
		if (onDeleteChar) {
			onDeleteChar(charIdx);
		} else {
			onChange({
				...category,
				chars: category.chars.filter((_, i) => i !== charIdx)
			});
		}
	};

	return (
		<Root>
			<div>
				<SectionLabel>{t('category_name_label')}</SectionLabel>
				<NameInput
					type="text"
					value={category.name}
					onChange={handleNameChange}
					placeholder={t('placeholder_category_name')}
				/>
			</div>

			<div>
				<CharsHeader>
					<SectionLabel>{t('characters_count', category.chars.length)}</SectionLabel>
					<SmallBtn onClick={onOpenPresets}>{t('from_presets')}</SmallBtn>
				</CharsHeader>

				{category.chars.length === 0 && <EmptyChars>{t('no_characters')}</EmptyChars>}

				<CharGrid>
					{category.chars.map(([char, name], idx) => {
						const alreadyShortcut = expansionSet.has(char);
						return (
							<CharItem
								key={idx}
								title={name}
								onContextMenu={(e) => {
									if (!onAddShortcut || alreadyShortcut) return;
									e.preventDefault();
									onAddShortcut(char, name);
								}}
							>
								<span style={{ pointerEvents: 'none' }}>{displayChar(char)}</span>
								<CharDelete onClick={() => handleDeleteChar(idx)}>&times;</CharDelete>
								{onAddShortcut && !alreadyShortcut && (
									<CharShortcutBadge
										onClick={(e) => {
											e.stopPropagation();
											onAddShortcut(char, name);
										}}
										title={t('right_click_shortcut') as string}
									>
										⚡
									</CharShortcutBadge>
								)}
							</CharItem>
						);
					})}
				</CharGrid>
			</div>

			<AddRow>
				<AddCharInput
					type="text"
					value={newChar}
					onChange={(e) => setNewChar(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={t('placeholder_symbol')}
					maxLength={2}
				/>
				<AddNameInput
					type="text"
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={t('placeholder_name_optional')}
				/>
				<SmallBtn onClick={handleAddChar}>{t('add')}</SmallBtn>
			</AddRow>
		</Root>
	);
};

export default CategoryEditor;
