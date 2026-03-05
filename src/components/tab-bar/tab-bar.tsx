import { useLanguage } from '../../i18n';
import { Wrapper, Tab } from './tab-bar.styles';
import type { Props, TabId } from './tab-bar.d';

const tabs: { id: TabId; key: string }[] = [
	{ id: 'chars', key: 'tab_characters' },
	{ id: 'compose', key: 'tab_compose' }
];

const TabBar = ({ active, onChange }: Props) => {
	const t = useLanguage();
	return (
		<Wrapper>
			{tabs.map((tab) => (
				<Tab key={tab.id} $active={active === tab.id} onClick={() => onChange(tab.id)}>
					{t(tab.key)}
				</Tab>
			))}
		</Wrapper>
	);
};

export default TabBar;
