export type Props = {
	char: string;
	name: string;
	onCopy: (message: string) => void;
	onAddShortcut?: (char: string, name: string) => void;
	focused?: boolean;
};
