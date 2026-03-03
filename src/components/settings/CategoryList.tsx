import { useState, useRef, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useLanguage, translateCategoryName } from "../../i18n";
import type { Category } from "../../types";

const Sidebar = styled.div`
  width: 200px;
  min-width: 200px;
  border-right: 1px solid var(--border);
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
`;

const Items = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Item = styled.div<{ $active: boolean; $dragging: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: var(--radius-s);
  cursor: pointer;
  gap: 6px;
  transition: background 0.12s, opacity 0.12s;
  background: ${p => p.$active ? 'var(--accent-bg-strong)' : 'transparent'};
  opacity: ${p => p.$dragging ? 0.4 : 1};
  user-select: none;

  &:hover {
    background: ${p => p.$active ? 'var(--accent-bg-strong)' : 'var(--fill-light)'};
  }
`;

const GripHandle = styled.span`
  font-size: 11px;
  color: var(--text-hint);
  cursor: grab;
  visibility: hidden;
  user-select: none;
  line-height: 1;
  flex-shrink: 0;

  ${Item}:hover & {
    visibility: visible;
  }

  &:active {
    cursor: grabbing;
  }
`;

const Name = styled.span`
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Count = styled.span`
  font-size: 10px;
  color: var(--text-placeholder);
  min-width: 16px;
  text-align: right;
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: var(--text-hint);
  font-size: 16px;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
  visibility: hidden;

  ${Item}:hover & {
    visibility: visible;
  }

  &:hover {
    color: var(--red);
  }
`;

const Placeholder = styled.div`
  border-radius: var(--radius-s);
  border: 1.5px dashed var(--border-medium);
  background: var(--fill-subtle);
  padding: 8px 12px 8px 26px;
  box-sizing: border-box;
  font-size: 13px;
  color: var(--text-disabled);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DragGhost = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  padding: 8px 12px;
  border-radius: var(--radius-s);
  background: var(--sidebar-bg);
  border: 1px solid var(--border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 13px;
  color: var(--text-secondary);
  opacity: 0.85;
  white-space: nowrap;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AddBtn = styled.button`
  margin: 8px;
  padding: 8px;
  background: var(--fill-subtle);
  border: 1px dashed var(--border-medium);
  border-radius: 6px;
  color: var(--text-faint);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: var(--fill);
    color: var(--text-bright);
  }
`;

interface CategoryListProps {
  categories: Category[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
  onDelete: (idx: number) => void;
  onAdd: () => void;
  onReorder: (fromIdx: number, toIdx: number) => void;
}

export default function CategoryList({
  categories,
  selectedIdx,
  onSelect,
  onDelete,
  onAdd,
  onReorder,
}: CategoryListProps) {
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

  const computeSlot = useCallback((clientY: number, currentDragIdx: number): number | null => {
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
  }, [categories.length]);

  const handleItemMouseDown = useCallback((e: React.MouseEvent, idx: number) => {
    // Ignore clicks on delete button
    if ((e.target as HTMLElement).closest("button")) return;
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
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      if (!started) {
        // No drag happened — treat as click
        onSelect(idx);
        return;
      }
      dragging.current = false;

      setDropSlot(currentSlot => {
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

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [computeSlot, onReorder, onSelect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { dragging.current = false; };
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
        <GripHandle>⠿</GripHandle>
        <Name>{translateCategoryName(cat.name)}</Name>
        <Count>{cat.chars.length}</Count>
        <DeleteBtn
          onClick={(e) => {
            e.stopPropagation();
            onDelete(idx);
          }}
          title={t("delete_category")}
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
    <Sidebar>
      <Items>{nodes}</Items>
      <AddBtn onClick={onAdd}>
        {t("add_category")}
      </AddBtn>
      {dragIdx !== null && ghostPos && (
        <DragGhost style={{ left: ghostPos.x + 12, top: ghostPos.y - 16 }}>
          {translateCategoryName(categories[dragIdx].name)}
        </DragGhost>
      )}
    </Sidebar>
  );
}
