export type TabId = 'chars' | 'compose';

export type Props = {
	active: TabId;
	onChange: (tab: TabId) => void;
};
