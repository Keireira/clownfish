import { useRef, useEffect } from 'react';
import Root, { Chip } from './category-chips.styles';
import { translateCategoryName } from '../../i18n';

import type { Props } from './category-chips.d';

const CategoryChips = ({ categories, active, onSelect }: Props) => {
	const activeRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
	}, [active]);

	return (
		<Root>
			{categories.map((name) => (
				<Chip
					key={name}
					ref={name === active ? activeRef : undefined}
					$active={name === active}
					onClick={() => onSelect(name)}
				>
					{translateCategoryName(name)}
				</Chip>
			))}
		</Root>
	);
};

export default CategoryChips;
