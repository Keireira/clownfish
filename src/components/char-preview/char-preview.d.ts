export type PreviewData = {
	char: string;
	name: string;
	rect: DOMRect;
	hasShortcut?: boolean;
} | null;

export type CharPreviewContextValue = {
	preview: PreviewData;
	show: (char: string, name: string, rect: DOMRect, hasShortcut?: boolean) => void;
	hide: () => void;
};
