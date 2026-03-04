import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { PreviewData, CharPreviewContextValue } from './char-preview.d';

const CharPreviewContext = createContext<CharPreviewContextValue>({
	preview: null,
	show: () => {},
	hide: () => {}
});

export const useCharPreview = () => useContext(CharPreviewContext);

export const CharPreviewProvider = ({ children }: { children: ReactNode }) => {
	const [preview, setPreview] = useState<PreviewData>(null);

	const show = useCallback((char: string, name: string, rect: DOMRect) => {
		setPreview({ char, name, rect });
	}, []);

	const hide = useCallback(() => {
		setPreview(null);
	}, []);

	return <CharPreviewContext.Provider value={{ preview, show, hide }}>{children}</CharPreviewContext.Provider>;
};
