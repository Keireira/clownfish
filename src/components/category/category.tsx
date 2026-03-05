import Root, { Label, Grid } from './category.styles';
import CharButton from '../char-button';
import { translateCategoryName } from '../../i18n';

import type { Props } from './category.d';

const Category = ({ category, onCopy, onAddShortcut, existingExpansions }: Props) => {
	const expansionSet = new Set(existingExpansions);
	return (
		<Root>
			<Label>{translateCategoryName(category.name)}</Label>
			<Grid>
				{category.chars.map(([char, name]) => (
					<CharButton
						key={char}
						char={char}
						name={name}
						onCopy={onCopy}
						onAddShortcut={expansionSet.has(char) ? undefined : onAddShortcut}
					/>
				))}
			</Grid>
		</Root>
	);
};

export default Category;
