export type PreviewData = {
	char: string;
	name: string;
	rect: DOMRect;
} | null;

export type CharPreviewContextValue = {
	preview: PreviewData;
	show: (char: string, name: string, rect: DOMRect) => void;
	hide: () => void;
};
