import Root, { SearchIcon, Input } from './search-bar.styles';
import { useLanguage } from '../../i18n';

import type { Props } from './search-bar.d';

const SearchBar = ({ value, onChange }: Props) => {
	const t = useLanguage();

	return (
		<Root>
			<SearchIcon width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
				/>
			</SearchIcon>
			<Input
				type="text"
				placeholder={t('search_placeholder')}
				autoFocus
				data-search-input
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
		</Root>
	);
};

export default SearchBar;
