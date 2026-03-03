import { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { loadCategories, saveCategories, resetCategories, DEFAULT_CATEGORIES } from "./store";
import CategoryList from "./components/settings/CategoryList";
import CategoryEditor from "./components/settings/CategoryEditor";
import PresetPicker from "./components/settings/PresetPicker";
import ThemePicker from "./components/settings/ThemePicker";
import LanguagePicker from "./components/settings/LanguagePicker";
import AutostartToggle from "./components/settings/AutostartToggle";
import { useLanguage } from "./i18n";
import type { Category, CharEntry } from "./types";

const SettingsGlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    background: var(--bg-solid);
    margin: 0;
    padding: 0;
    height: 100%;
  }

  .theme-section-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-label);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const GlassOverrides = createGlobalStyle`
  html.glass .settings-header,
  html.glass .settings-tabs,
  html.glass .settings-main {
    background: transparent;
  }

  html.glass[data-theme="light"] .settings-header,
  html.glass[data-theme="light"] .settings-tabs,
  html.glass[data-theme="light"] .settings-main {
    background: transparent;
  }
`;

const SettingsWrapper = styled.div`
  background: var(--bg-solid);
  color: var(--text-secondary);
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
  overflow: hidden;
`;

const Header = styled.div.attrs({ className: 'settings-header' })`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px 12px 20px;
  border-bottom: 1px solid var(--border);
  -webkit-user-select: none;
  user-select: none;

  h1 {
    font-size: 14px;
    font-weight: 600;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 8px;
`;


const Body = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Main = styled.div.attrs({ className: 'settings-main' })`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  position: relative;
`;

const Empty = styled.div`
  color: var(--text-disabled);
  text-align: center;
  padding-top: 80px;
  font-size: 13px;
`;

const SegmentedWrapper = styled.div.attrs({ className: 'settings-tabs' })`
  display: flex;
  justify-content: flex-start;
  padding: 10px 20px;
  border-bottom: 1px solid var(--border);
  -webkit-user-select: none;
  user-select: none;
`;

const SegmentedControl = styled.div`
  display: flex;
  background: var(--segmented-bg);
  border-radius: var(--radius-s);
  padding: 2px;
`;

const Segment = styled.button<{ $active: boolean }>`
  padding: 5px 20px;
  border: none;
  border-radius: 6px;
  background: ${p => p.$active ? 'var(--segmented-active)' : 'transparent'};
  box-shadow: ${p => p.$active ? '0 1px 3px rgba(0, 0, 0, 0.12)' : 'none'};
  color: ${p => p.$active ? 'var(--text-primary)' : 'var(--text-muted)'};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;

  &:hover {
    color: ${p => p.$active ? 'var(--text-primary)' : 'var(--text-secondary)'};
  }
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

const BtnPrimary = styled(Btn)`
  background: var(--accent);
  color: #fff;

  &:hover:not(:disabled) {
    background: var(--accent-hover);
  }
`;

const BtnSecondary = styled(Btn)`
  background: var(--fill);
  color: var(--text-tertiary);

  &:hover:not(:disabled) {
    background: var(--fill-hover);
  }
`;

const SettingsGroup = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-l);
  padding: 4px 0;
  margin-bottom: 16px;
`;

const SettingsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;

  & + & {
    border-top: 1px solid var(--border);
  }
`;

const SettingsRowLabel = styled.span`
  font-size: 13px;
  color: var(--text-primary);
`;

export default function Settings() {
  const t = useLanguage();
  const [tab, setTab] = useState<"categories" | "appearance">("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showPresets, setShowPresets] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    loadCategories().then((cats) => {
      setCategories(cats);
    });
  }, []);

  const selected = categories[selectedIdx] || null;

  const update = (newCats: Category[]) => {
    setCategories(newCats);
    setDirty(true);
  };

  const handleSave = async () => {
    await saveCategories(categories);
    setDirty(false);
    try {
      const { emit } = await import("@tauri-apps/api/event");
      await emit("categories-changed");
    } catch (_) {}
  };

  const handleReset = async () => {
    await resetCategories();
    setCategories(DEFAULT_CATEGORIES);
    setSelectedIdx(0);
    setDirty(false);
    try {
      const { emit } = await import("@tauri-apps/api/event");
      await emit("categories-changed");
    } catch (_) {}
  };

  const handleAddCategory = () => {
    const newCat: Category = { name: "New Category", chars: [] };
    const newCats = [...categories, newCat];
    update(newCats);
    setSelectedIdx(newCats.length - 1);
  };

  const handleDeleteCategory = (idx: number) => {
    const newCats = categories.filter((_, i) => i !== idx);
    update(newCats);
    if (selectedIdx >= newCats.length) {
      setSelectedIdx(Math.max(0, newCats.length - 1));
    }
  };

  const handleUpdateCategory = (idx: number, updatedCat: Category) => {
    const newCats = categories.map((c, i) => (i === idx ? updatedCat : c));
    update(newCats);
  };

  const handleAddFromPresets = (chars: CharEntry[]) => {
    if (!selected) return;
    const existing = new Set(selected.chars.map(([ch]) => ch));
    const newChars = chars.filter(([ch]) => !existing.has(ch));
    if (newChars.length === 0) return;
    handleUpdateCategory(selectedIdx, {
      ...selected,
      chars: [...selected.chars, ...newChars],
    });
    setShowPresets(false);
  };

  return (
    <>
      <SettingsGlobalStyle />
      <GlassOverrides />
      <SettingsWrapper>
        <Header data-tauri-drag-region>
          <h1>{t("settings_title")}</h1>
          <HeaderRight style={tab !== "categories" ? { visibility: "hidden" } : undefined}>
            <BtnSecondary onClick={handleReset}>
              {t("reset_to_default")}
            </BtnSecondary>
            <BtnPrimary
              onClick={handleSave}
              disabled={!dirty}
            >
              {dirty ? t("save_changes") : t("saved")}
            </BtnPrimary>
          </HeaderRight>
        </Header>

        <SegmentedWrapper>
          <SegmentedControl>
            <Segment
              $active={tab === "categories"}
              onClick={() => setTab("categories")}
            >
              {t("tab_categories")}
            </Segment>
            <Segment
              $active={tab === "appearance"}
              onClick={() => setTab("appearance")}
            >
              {t("tab_appearance")}
            </Segment>
          </SegmentedControl>
        </SegmentedWrapper>

        {tab === "categories" ? (
          <Body>
            <CategoryList
              categories={categories}
              selectedIdx={selectedIdx}
              onSelect={setSelectedIdx}
              onDelete={handleDeleteCategory}
              onAdd={handleAddCategory}
            />

            <Main>
              {selected ? (
                <CategoryEditor
                  category={selected}
                  onChange={(cat) => handleUpdateCategory(selectedIdx, cat)}
                  onOpenPresets={() => setShowPresets(true)}
                />
              ) : (
                <Empty>
                  {t("no_category_selected")}
                </Empty>
              )}
            </Main>
          </Body>
        ) : (
          <Body>
            <Main>
              <SettingsGroup>
                <ThemePicker />
              </SettingsGroup>
              <SettingsGroup>
                <SettingsRow>
                  <SettingsRowLabel>{t("language_label")}</SettingsRowLabel>
                  <LanguagePicker />
                </SettingsRow>
                <SettingsRow>
                  <SettingsRowLabel>{t("autostart_label")}</SettingsRowLabel>
                  <AutostartToggle />
                </SettingsRow>
              </SettingsGroup>
            </Main>
          </Body>
        )}

        {showPresets && selected && (
          <PresetPicker
            onAdd={handleAddFromPresets}
            onClose={() => setShowPresets(false)}
            existingChars={selected.chars.map(([ch]) => ch)}
          />
        )}
      </SettingsWrapper>
    </>
  );
}
