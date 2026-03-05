export type Props = {
	char: string;
	name: string;
	existingTriggers: string[];
	onAdd: (keyword: string) => void;
	onClose: () => void;
};
