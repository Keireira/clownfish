import Root, { Label, Grid } from './category.styles';
import CharButton from '../char-button';
import { translateCategoryName } from '../../i18n';

import type { Props } from './category.d';

const Category = ({ category, onCopy }: Props) => {
	return (
		<Root>
			<Label>{translateCategoryName(category.name)}</Label>
			<Grid>
				{category.chars.map(([char, name]) => (
					<CharButton key={char} char={char} name={name} onCopy={onCopy} />
				))}
			</Grid>
		</Root>
	);
};

export default Category;
