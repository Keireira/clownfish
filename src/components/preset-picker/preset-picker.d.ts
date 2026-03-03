import type { CharEntry } from '../../types';

export type Props = {
	onAdd: (chars: CharEntry[]) => void;
	onClose: () => void;
	existingChars: string[];
};
