import type { Category as CategoryType } from '../../types';

export type Props = {
	category: CategoryType;
	onCopy: (message: string) => void;
};
