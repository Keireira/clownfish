import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { PreviewData, CharPreviewContextValue } from './char-preview.d';

const CharPreviewContext = createContext<CharPreviewContextValue>({
	preview: null,
	show: () => {},
	hide: () => {},
	inspectorTarget: null,
	closeInspector: () => {}
});

export const useCharPreview = () => useContext(CharPreviewContext);

export const CharPreviewProvider = ({ children }: { children: ReactNode }) => {
	const [preview, setPreview] = useState<PreviewData>(null);
	const [inspectorTarget, setInspectorTarget] = useState<{ char: string; name: string } | null>(null);
	const previewRef = useRef<PreviewData>(null);

	// Keep ref in sync so keydown handler can read current preview
	previewRef.current = preview;

	const show = useCallback((char: string, name: string, rect: DOMRect, hasShortcut?: boolean) => {
		setPreview({ char, name, rect, hasShortcut });
	}, []);

	const hide = useCallback(() => {
		setPreview(null);
	}, []);

	const closeInspector = useCallback(() => {
		setInspectorTarget(null);
	}, []);

	const openFromPreview = useCallback(() => {
		const p = previewRef.current;
		if (!p) return;
		setInspectorTarget({ char: p.char, name: p.name });
		setPreview(null);
	}, []);

	// Alt held → open inspector; Alt released / blur → close inspector
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Alt') {
				e.preventDefault();
				openFromPreview();
			}
		};
		const onKeyUp = (e: KeyboardEvent) => {
			if (e.key === 'Alt') {
				e.preventDefault();
				setInspectorTarget(null);
			}
		};
		const onBlur = () => {
			setInspectorTarget(null);
		};
		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);
		window.addEventListener('blur', onBlur);
		return () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
			window.removeEventListener('blur', onBlur);
		};
	}, [openFromPreview]);

	return (
		<CharPreviewContext.Provider value={{ preview, show, hide, inspectorTarget, closeInspector }}>
			{children}
		</CharPreviewContext.Provider>
	);
};
