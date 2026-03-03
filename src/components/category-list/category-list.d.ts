import type { Category } from '../../types';

export type Props = {
	categories: Category[];
	selectedIdx: number;
	onSelect: (idx: number) => void;
	onDelete: (idx: number) => void;
	onAdd: () => void;
	onReorder: (fromIdx: number, toIdx: number) => void;
};
