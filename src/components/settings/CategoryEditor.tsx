import { useState } from "react";
import styled from "styled-components";
import { useLanguage } from "../../i18n";
import { displayChar, type Category } from "../../types";

const Editor = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionLabel = styled.label`
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-label);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`;

const NameInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-medium);
  border-radius: 6px;
  background: var(--fill-light);
  color: var(--text-secondary);
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: var(--accent-border);
  }
`;

const CharsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${SectionLabel} {
    margin-bottom: 0;
  }
`;

const CharGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
`;

const CharItem = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: var(--fill);
  font-size: 18px;

  &:hover button {
    display: flex;
  }
`;

const CharDelete = styled.button`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--red);
  color: #fff;
  border: none;
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
`;

const AddRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const AddInput = styled.input`
  padding: 6px 10px;
  border: 1px solid var(--border-medium);
  border-radius: 6px;
  background: var(--fill-light);
  color: var(--text-secondary);
  font-size: 13px;
  outline: none;

  &:focus {
    border-color: var(--accent-border);
  }
`;

const AddCharInput = styled(AddInput)`
  width: 72px;
  text-align: center;
`;

const AddNameInput = styled(AddInput)`
  flex: 1;
`;

const SmallBtn = styled.button`
  padding: 6px 10px;
  font-size: 11px;
  background: var(--fill);
  color: var(--text-tertiary);
  border: 1px solid var(--border-medium);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: var(--fill-hover);
  }
`;

interface CategoryEditorProps {
  category: Category;
  onChange: (category: Category) => void;
  onOpenPresets: () => void;
}

export default function CategoryEditor({ category, onChange, onOpenPresets }: CategoryEditorProps) {
  const t = useLanguage();
  const [newChar, setNewChar] = useState("");
  const [newName, setNewName] = useState("");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...category, name: e.target.value });
  };

  const handleAddChar = () => {
    const char = newChar.trim();
    const name = newName.trim() || char;
    if (!char) return;
    if (category.chars.some(([ch]) => ch === char)) return;
    onChange({ ...category, chars: [...category.chars, [char, name]] });
    setNewChar("");
    setNewName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAddChar();
  };

  const handleDeleteChar = (charIdx: number) => {
    onChange({
      ...category,
      chars: category.chars.filter((_, i) => i !== charIdx),
    });
  };

  return (
    <Editor>
      <div>
        <SectionLabel>{t("category_name_label")}</SectionLabel>
        <NameInput
          type="text"
          value={category.name}
          onChange={handleNameChange}
          placeholder={t("placeholder_category_name")}
        />
      </div>

      <div>
        <CharsHeader>
          <SectionLabel>{t("characters_count", category.chars.length)}</SectionLabel>
          <SmallBtn onClick={onOpenPresets}>
            {t("from_presets")}
          </SmallBtn>
        </CharsHeader>

        <CharGrid>
          {category.chars.map(([char, name], idx) => (
            <CharItem key={idx} title={name}>
              <span style={{ pointerEvents: "none" }}>{displayChar(char)}</span>
              <CharDelete onClick={() => handleDeleteChar(idx)}>
                &times;
              </CharDelete>
            </CharItem>
          ))}
        </CharGrid>
      </div>

      <AddRow>
        <AddCharInput
          type="text"
          value={newChar}
          onChange={(e) => setNewChar(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("placeholder_symbol")}
          maxLength={2}
        />
        <AddNameInput
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("placeholder_name_optional")}
        />
        <SmallBtn onClick={handleAddChar}>
          {t("add")}
        </SmallBtn>
      </AddRow>
    </Editor>
  );
}
