export type Props = {
	categories: string[];
	active: string | null;
	onSelect: (name: string) => void;
};
