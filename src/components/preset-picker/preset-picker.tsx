import { useState, useEffect, useRef } from 'react';
import Root, {
	Picker,
	Header,
	CloseBtn,
	Body,
	PresetCategory,
	PresetCatLabel,
	PresetGrid,
	PresetCharBtn,
	Footer,
	PresetCount,
	BtnSecondary,
	BtnPrimary
} from './preset-picker.styles';
import { PRESET_CATEGORIES } from '../../data/presets';
import { useLanguage, translateCategoryName } from '../../i18n';

import { displayChar, type CharEntry } from '../../types';
import type { Props } from './preset-picker.d';

const PICKER_ZONES = ['header', 'body', 'footer'] as const;
type PickerZone = typeof PICKER_ZONES[number];
const FOCUSABLE_SELECTOR =
	'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]';

const PresetPicker = ({ onAdd, onClose, existingChars }: Props) => {
	const t = useLanguage();
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const pickerRef = useRef<HTMLDivElement>(null);

	// Zone navigation state
	const [activeZone, setActiveZone] = useState<PickerZone | null>(null);
	const [drilled, setDrilled] = useState(false);
	const [zoneVisual, setZoneVisual] = useState(false);

	const toggle = (char: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(char)) {
				next.delete(char);
			} else {
				next.add(char);
			}
			return next;
		});
	};

	const handleAdd = () => {
		const chars: CharEntry[] = [];
		for (const cat of PRESET_CATEGORIES) {
			for (const entry of cat.chars) {
				if (selected.has(entry[0])) {
					chars.push(entry);
				}
			}
		}
		onAdd(chars);
	};

	const existingSet = new Set(existingChars);

	// Zone keyboard navigation
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.ctrlKey || e.metaKey) return;

			const target = e.target as HTMLElement;
			const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

			if (drilled) {
				if (e.key === 'Escape') {
					if (isInput) return;
					e.preventDefault();
					setDrilled(false);
					(document.activeElement as HTMLElement)?.blur();
					return;
				}
				if (e.key === 'Tab') {
					const zoneEl = pickerRef.current?.querySelector<HTMLElement>(`[data-zone="${activeZone}"]`);
					if (!zoneEl) return;
					const focusables = Array.from(zoneEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
					if (focusables.length === 0) return;
					e.preventDefault();
					const idx = focusables.indexOf(document.activeElement as HTMLElement);
					const next = e.shiftKey
						? (idx <= 0 ? focusables.length - 1 : idx - 1)
						: (idx >= focusables.length - 1 ? 0 : idx + 1);
					focusables[next].focus();
					return;
				}
				return;
			}

			if (isInput) return;

			if (e.key === 'Tab') {
				e.preventDefault();
				setZoneVisual(true);
				const currentIdx = activeZone ? PICKER_ZONES.indexOf(activeZone) : -1;
				const next = e.shiftKey
					? (currentIdx <= 0 ? PICKER_ZONES.length - 1 : currentIdx - 1)
					: (currentIdx >= PICKER_ZONES.length - 1 ? 0 : currentIdx + 1);
				setActiveZone(PICKER_ZONES[next]);
			} else if (e.key === 'Enter' && activeZone) {
				e.preventDefault();
				setDrilled(true);
				setZoneVisual(true);
				const zoneEl = pickerRef.current?.querySelector<HTMLElement>(`[data-zone="${activeZone}"]`);
				if (zoneEl) {
					const focusable = zoneEl.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
					focusable?.focus();
				}
			} else if (e.key === 'Escape') {
				e.preventDefault();
				onClose();
			}
		};
		document.addEventListener('keydown', handler);
		return () => document.removeEventListener('keydown', handler);
	}, [activeZone, drilled, onClose]);

	const pickerMouseDown = (e: React.MouseEvent) => {
		const zoneEl = (e.target as HTMLElement).closest<HTMLElement>('[data-zone]');
		if (zoneEl) {
			const zone = zoneEl.dataset.zone as PickerZone;
			if ((PICKER_ZONES as readonly string[]).includes(zone)) {
				setActiveZone(zone);
				setDrilled(false);
				setZoneVisual(false);
			}
		}
	};

	const zoneState = (zone: PickerZone) => {
		if (activeZone !== zone || !zoneVisual) return undefined;
		return drilled ? 'drilled' as const : 'focused' as const;
	};

	return (
		<Root>
			<Picker ref={pickerRef} onMouseDown={pickerMouseDown}>
				<Header data-zone="header" data-zone-state={zoneState('header')}>
					<h3>{t('add_from_presets')}</h3>
					<CloseBtn onClick={onClose}>&times;</CloseBtn>
				</Header>

				<Body data-zone="body" data-zone-state={zoneState('body')}>
					{PRESET_CATEGORIES.map((cat) => (
						<PresetCategory key={cat.name}>
							<PresetCatLabel>{translateCategoryName(cat.name)}</PresetCatLabel>
							<PresetGrid>
								{cat.chars.map(([char, name]) => {
									const alreadyAdded = existingSet.has(char);
									const isSelected = selected.has(char);
									return (
										<PresetCharBtn
											key={char}
											$selected={isSelected}
											$exists={alreadyAdded}
											title={alreadyAdded ? `${char} ${name} (${t('already_added')})` : `${char} ${name}`}
											onClick={() => !alreadyAdded && toggle(char)}
											disabled={alreadyAdded}
										>
											{displayChar(char)}
										</PresetCharBtn>
									);
								})}
							</PresetGrid>
						</PresetCategory>
					))}
				</Body>

				<Footer data-zone="footer" data-zone-state={zoneState('footer')}>
					<PresetCount>{t('n_selected', selected.size)}</PresetCount>
					<BtnSecondary onClick={onClose}>{t('cancel')}</BtnSecondary>
					<BtnPrimary onClick={handleAdd} disabled={selected.size === 0}>
						{t('add_selected')}
					</BtnPrimary>
				</Footer>
			</Picker>
		</Root>
	);
};

export default PresetPicker;
