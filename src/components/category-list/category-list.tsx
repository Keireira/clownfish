import { useState, useRef, useEffect, useCallback } from 'react';
import Root, {
	Items,
	Item,
	GripHandle,
	Name,
	Count,
	DeleteBtn,
	Placeholder,
	DragGhost,
	AddBtn
} from './category-list.styles';

import { useLanguage, translateCategoryName } from '../../i18n';
import type { Props } from './category-list.d';

const CategoryList = ({ categories, selectedIdx, onSelect, onDelete, onAdd, onReorder }: Props) => {
	const t = useLanguage();
	const [dragIdx, setDragIdx] = useState<number | null>(null);
	const [dropSlot, setDropSlot] = useState<number | null>(null);
	const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
	const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
	const dragging = useRef(false);

	const setItemRef = useCallback((idx: number, el: HTMLDivElement | null) => {
		if (el) itemRefs.current.set(idx, el);
		else itemRefs.current.delete(idx);
	}, []);

	const computeSlot = useCallback(
		(clientY: number, currentDragIdx: number): number | null => {
			let slot = categories.length;
			for (let i = 0; i < categories.length; i++) {
				const el = itemRefs.current.get(i);
				if (!el) continue;
				const rect = el.getBoundingClientRect();
				if (clientY < rect.top + rect.height / 2) {
					slot = i;
					break;
				}
			}
			if (slot === currentDragIdx || slot === currentDragIdx + 1) return null;
			return slot;
		},
		[categories.length]
	);

	const handleItemMouseDown = useCallback(
		(e: React.MouseEvent, idx: number) => {
			// Ignore clicks on delete button
			if ((e.target as HTMLElement).closest('button')) return;
			e.preventDefault();
			const startY = e.clientY;
			let started = false;

			const onMouseMove = (ev: MouseEvent) => {
				if (!started) {
					if (Math.abs(ev.clientY - startY) < 4) return;
					started = true;
					dragging.current = true;
					setDragIdx(idx);
				}
				setDropSlot(computeSlot(ev.clientY, idx));
				setGhostPos({ x: ev.clientX, y: ev.clientY });
			};

			const onMouseUp = () => {
				document.removeEventListener('mousemove', onMouseMove);
				document.removeEventListener('mouseup', onMouseUp);

				if (!started) {
					// No drag happened — treat as click
					onSelect(idx);
					return;
				}
				dragging.current = false;

				setDropSlot((currentSlot) => {
					if (currentSlot !== null) {
						let toIdx = currentSlot;
						if (idx < toIdx) toIdx--;
						if (toIdx !== idx) {
							setTimeout(() => onReorder(idx, toIdx), 0);
						}
					}
					return null;
				});
				setDragIdx(null);
				setGhostPos(null);
			};

			document.addEventListener('mousemove', onMouseMove);
			document.addEventListener('mouseup', onMouseUp);
		},
		[computeSlot, onReorder, onSelect]
	);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			dragging.current = false;
		};
	}, []);

	const nodes: React.ReactNode[] = [];
	categories.forEach((cat, idx) => {
		if (dropSlot === idx) {
			nodes.push(
				<Placeholder key="placeholder">
					{dragIdx !== null ? translateCategoryName(categories[dragIdx].name) : null}
				</Placeholder>
			);
		}
		nodes.push(
			<Item
				key={`item-${idx}`}
				ref={(el) => setItemRef(idx, el)}
				$active={idx === selectedIdx}
				$dragging={idx === dragIdx}
				onMouseDown={(e) => handleItemMouseDown(e, idx)}
			>
				<GripHandle>&#x2807;</GripHandle>
				<Name>{translateCategoryName(cat.name)}</Name>
				<Count>{cat.chars.length}</Count>
				<DeleteBtn
					onClick={(e) => {
						e.stopPropagation();
						onDelete(idx);
					}}
					title={t('delete_category')}
				>
					&times;
				</DeleteBtn>
			</Item>
		);
	});
	if (dropSlot === categories.length) {
		nodes.push(
			<Placeholder key="placeholder">
				{dragIdx !== null ? translateCategoryName(categories[dragIdx].name) : null}
			</Placeholder>
		);
	}

	return (
		<Root>
			<Items>{nodes}</Items>
			<AddBtn onClick={onAdd}>{t('add_category')}</AddBtn>
			{dragIdx !== null && ghostPos && (
				<DragGhost style={{ left: ghostPos.x + 12, top: ghostPos.y - 16 }}>
					{translateCategoryName(categories[dragIdx].name)}
				</DragGhost>
			)}
		</Root>
	);
};

export default CategoryList;
