export type Props = {
	value: string;
	onChange: (value: string) => void;
	onKeyDown?: (e: React.KeyboardEvent) => void;
};
