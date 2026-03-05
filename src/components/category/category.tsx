import Root, { Label, Grid } from './category.styles';
import CharButton from '../char-button';
import { translateCategoryName } from '../../i18n';

import type { Props } from './category.d';

const Category = ({ category, onCopy, onAddShortcut, existingExpansions, focusedStart = 0, focusedIndex = -1, selectedChars, onCharModifiedClick }: Props) => {
	const expansionSet = new Set(existingExpansions);
	return (
		<Root>
			<Label>{translateCategoryName(category.name)}</Label>
			<Grid data-category-grid>
				{category.chars.map(([char, name], i) => (
					<CharButton
						key={char}
						char={char}
						name={name}
						focused={focusedStart + i === focusedIndex}
						onCopy={onCopy}
						onAddShortcut={expansionSet.has(char) ? undefined : onAddShortcut}
						selected={selectedChars?.has(char) ?? false}
						onModifiedClick={onCharModifiedClick ? (e) => onCharModifiedClick(char, focusedStart + i, e) : undefined}
					/>
				))}
			</Grid>
		</Root>
	);
};

export default Category;
