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
`;

const Item = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: var(--radius-s);
  cursor: pointer;
  gap: 6px;
  transition: background 0.12s;
  background: ${p => p.$active ? 'var(--accent-bg-strong)' : 'transparent'};

  &:hover {
    background: ${p => p.$active ? 'var(--accent-bg-strong)' : 'var(--fill-light)'};
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
}

export default function CategoryList({
  categories,
  selectedIdx,
  onSelect,
  onDelete,
  onAdd,
}: CategoryListProps) {
  const t = useLanguage();
  return (
    <Sidebar>
      <Items>
        {categories.map((cat, idx) => (
          <Item
            key={idx}
            $active={idx === selectedIdx}
            onClick={() => onSelect(idx)}
          >
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
        ))}
      </Items>
      <AddBtn onClick={onAdd}>
        {t("add_category")}
      </AddBtn>
    </Sidebar>
  );
}
