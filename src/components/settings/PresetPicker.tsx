import { useState } from "react";
import styled from "styled-components";
import { PRESET_CATEGORIES } from "../../data/presets";
import { useLanguage, translateCategoryName } from "../../i18n";
import { displayChar, type CharEntry } from "../../types";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: var(--overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;

  html.glass & {
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
  }
`;

const Picker = styled.div`
  background: var(--bg-elevated);
  border: 1px solid var(--border-medium);
  border-radius: 10px;
  width: 500px;
  max-height: 440px;
  display: flex;
  flex-direction: column;

  html.glass & {
    background: rgba(40, 40, 46, 0.97);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    backdrop-filter: saturate(180%) blur(20px);
  }

  html.glass[data-theme="light"] & {
    background: rgba(255, 255, 255, 0.97);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);

  h3 {
    font-size: 14px;
    font-weight: 600;
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: var(--text-faint);
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;

  &:hover {
    color: var(--text-primary);
  }
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
`;

const PresetCategory = styled.div`
  margin-bottom: 10px;
`;

const PresetCatLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 6px;
`;

const PresetGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const PresetCharBtn = styled.button<{ $selected?: boolean; $exists?: boolean }>`
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${p => p.$selected ? 'var(--accent-border-strong)' : 'var(--border)'};
  border-radius: 5px;
  background: ${p => p.$selected ? 'var(--accent-bg-strong)' : 'var(--fill-light)'};
  color: ${p => p.$selected ? '#fff' : 'var(--text-secondary)'};
  font-size: 16px;
  cursor: ${p => p.$exists ? 'default' : 'pointer'};
  opacity: ${p => p.$exists ? 0.3 : 1};
  transition: background 0.12s, border-color 0.12s;

  &:hover:not(:disabled) {
    background: ${p => p.$selected ? 'var(--accent-bg-strong)' : 'var(--fill-hover)'};
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border);
`;

const PresetCount = styled.span`
  flex: 1;
  font-size: 11px;
  color: var(--text-faint);
`;

const Btn = styled.button`
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const BtnSecondary = styled(Btn)`
  background: var(--fill);
  color: var(--text-tertiary);

  &:hover:not(:disabled) {
    background: var(--fill-hover);
  }
`;

const BtnPrimary = styled(Btn)`
  background: var(--accent);
  color: #fff;

  &:hover:not(:disabled) {
    background: var(--accent-hover);
  }
`;

interface PresetPickerProps {
  onAdd: (chars: CharEntry[]) => void;
  onClose: () => void;
  existingChars: string[];
}

export default function PresetPicker({ onAdd, onClose, existingChars }: PresetPickerProps) {
  const t = useLanguage();
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  return (
    <Overlay>
      <Picker>
        <Header>
          <h3>{t("add_from_presets")}</h3>
          <CloseBtn onClick={onClose}>
            &times;
          </CloseBtn>
        </Header>

        <Body>
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
                      title={alreadyAdded ? `${char} ${name} (${t("already_added")})` : `${char} ${name}`}
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

        <Footer>
          <PresetCount>
            {t("n_selected", selected.size)}
          </PresetCount>
          <BtnSecondary onClick={onClose}>
            {t("cancel")}
          </BtnSecondary>
          <BtnPrimary
            onClick={handleAdd}
            disabled={selected.size === 0}
          >
            {t("add_selected")}
          </BtnPrimary>
        </Footer>
      </Picker>
    </Overlay>
  );
}
