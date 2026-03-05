import { useState, useMemo, useCallback, useRef } from 'react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { useLanguage } from '../../i18n';
import { COMBINING_MARKS, DOTTED_CIRCLE } from '../../data/combining-marks';
import type { Props } from './compose-panel.d';
import {
	PanelWrapper,
	SectionLabel,
	BaseInput,
	GroupLabel,
	ModifierGrid,
	ModifierBtn,
	ChipsRow,
	ModifierChip,
	PreviewArea,
	PreviewChar,
	PreviewEmpty,
	CopyBtn,
	NfcRow,
	NfcCheckbox
} from './compose-panel.styles';

const allMarks = COMBINING_MARKS.flatMap((g) => g.marks);

const ComposePanel = ({ onCopy }: Props) => {
	const t = useLanguage();
	const [base, setBase] = useState('');
	const [selectedMarks, setSelectedMarks] = useState<string[]>([]);
	const [useNfc, setUseNfc] = useState(false);
	const [focusedMarkIndex, setFocusedMarkIndex] = useState(-1);
	const gridRef = useRef<HTMLDivElement>(null);

	const composed = useMemo(() => {
		if (!base) return '';
		const raw = base + selectedMarks.join('');
		return useNfc ? raw.normalize('NFC') : raw;
	}, [base, selectedMarks, useNfc]);

	const handleBaseInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		// Take only the last grapheme/character typed (handles paste & surrogates)
		const chars = [...val];
		setBase(chars.length > 0 ? chars[chars.length - 1] : '');
	}, []);

	const toggleMark = useCallback((mark: string) => {
		setSelectedMarks((prev) => {
			const idx = prev.indexOf(mark);
			if (idx >= 0) return prev.filter((_, i) => i !== idx);
			return [...prev, mark];
		});
	}, []);

	const removeMark = useCallback((index: number) => {
		setSelectedMarks((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const handleCopy = useCallback(() => {
		if (!composed) return;
		writeText(composed).then(() => {
			import('../../stats-store').then(({ recordCharCopy }) => recordCharCopy(composed));
			onCopy(t('compose_copy', composed) as string);
			import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().hide());
		});
	}, [composed, onCopy, t]);

	const handleGridKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			const total = allMarks.length;
			if (total === 0) return;

			// Measure columns from the grid
			let cols = 8;
			if (gridRef.current) {
				const style = getComputedStyle(gridRef.current);
				// flex-wrap: count items per row using width
				const btnWidth = 40; // 36px + 4px gap
				cols = Math.max(1, Math.floor(gridRef.current.clientWidth / btnWidth));
			}

			switch (e.key) {
				case 'ArrowRight':
					e.preventDefault();
					setFocusedMarkIndex((prev) => Math.min(prev + 1, total - 1));
					break;
				case 'ArrowLeft':
					e.preventDefault();
					setFocusedMarkIndex((prev) => Math.max(prev - 1, 0));
					break;
				case 'ArrowDown':
					e.preventDefault();
					setFocusedMarkIndex((prev) => Math.min(prev + cols, total - 1));
					break;
				case 'ArrowUp':
					e.preventDefault();
					setFocusedMarkIndex((prev) => {
						const next = prev - cols;
						if (next < 0) {
							// Move focus to base input
							const input = document.querySelector<HTMLInputElement>('[data-compose-input]');
							input?.focus();
							return -1;
						}
						return next;
					});
					break;
				case 'Enter':
				case ' ':
					e.preventDefault();
					if (focusedMarkIndex >= 0 && focusedMarkIndex < total) {
						toggleMark(allMarks[focusedMarkIndex][0]);
					} else if (composed) {
						handleCopy();
					}
					break;
			}
		},
		[focusedMarkIndex, toggleMark, composed, handleCopy]
	);

	const handleBaseKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				setFocusedMarkIndex(0);
				gridRef.current?.focus();
			}
		},
		[]
	);

	return (
		<PanelWrapper>
			<div>
				<SectionLabel>{t('compose_base')}</SectionLabel>
				<BaseInput
					data-compose-input
					value={base}
					onChange={handleBaseInput}
					onKeyDown={handleBaseKeyDown}
					placeholder={t('compose_base_placeholder') as string}
					autoComplete="off"
					spellCheck={false}
				/>
			</div>

			<div>
				<SectionLabel>{t('compose_modifiers')}</SectionLabel>
				<div
					ref={gridRef}
					tabIndex={0}
					onKeyDown={handleGridKeyDown}
					style={{ outline: 'none' }}
				>
					{COMBINING_MARKS.map((group) => (
						<div key={group.name}>
							<GroupLabel>{group.name}</GroupLabel>
							<ModifierGrid>
								{group.marks.map(([mark, name]) => {
									const flatIdx = allMarks.findIndex(([m]) => m === mark);
									return (
										<ModifierBtn
											key={mark}
											title={name}
											$active={selectedMarks.includes(mark)}
											$focused={focusedMarkIndex === flatIdx}
											onClick={() => toggleMark(mark)}
										>
											{DOTTED_CIRCLE + mark}
										</ModifierBtn>
									);
								})}
							</ModifierGrid>
						</div>
					))}
				</div>
			</div>

			{selectedMarks.length > 0 && (
				<div>
					<SectionLabel>{t('compose_selected_marks')}</SectionLabel>
					<ChipsRow>
						{selectedMarks.map((mark, i) => {
							const entry = allMarks.find(([m]) => m === mark);
							return (
								<ModifierChip key={`${mark}-${i}`} title={entry?.[1]} onClick={() => removeMark(i)}>
									{DOTTED_CIRCLE + mark}
								</ModifierChip>
							);
						})}
					</ChipsRow>
				</div>
			)}

			<div>
				<SectionLabel>{t('compose_preview')}</SectionLabel>
				<PreviewArea>
					{composed ? (
						<PreviewChar>{composed}</PreviewChar>
					) : (
						<PreviewEmpty>{t('compose_preview_empty')}</PreviewEmpty>
					)}
				</PreviewArea>
			</div>

			<NfcRow>
				<NfcCheckbox type="checkbox" checked={useNfc} onChange={(e) => setUseNfc(e.target.checked)} />
				{t('compose_nfc')}
			</NfcRow>

			<CopyBtn disabled={!composed} onClick={handleCopy}>
				{composed ? t('compose_copy', composed) : t('compose_copy', '…')}
			</CopyBtn>
		</PanelWrapper>
	);
};

export default ComposePanel;
