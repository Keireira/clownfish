import { useState, useEffect } from "react";
import styled from "styled-components";
import { getThemeChoice, setThemeChoice } from "../../theme";
import { useLanguage } from "../../i18n";
import type { ThemeChoice } from "../../types";

const ThemeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px;
`;

const Options = styled.div`
  display: flex;
  gap: 8px;
`;

const Option = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 1px solid ${p => p.$active ? 'var(--accent-border)' : 'var(--border-medium)'};
  border-radius: 8px;
  background: ${p => p.$active ? 'var(--accent-bg)' : 'var(--fill-light)'};
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    background: ${p => p.$active ? 'var(--accent-bg)' : 'var(--fill)'};
    border-color: ${p => p.$active ? 'var(--accent-border)' : 'var(--border-strong)'};
  }
`;

const OptionLabel = styled.span<{ $active: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${p => p.$active ? 'var(--accent)' : 'var(--text-secondary)'};
`;

const OptionDesc = styled.span`
  font-size: 10px;
  color: var(--text-faint);
`;

const OPTIONS: ThemeChoice[] = ["auto", "light", "dark"];
const LABEL_KEYS: Record<ThemeChoice, string> = { auto: "theme_auto", light: "theme_light", dark: "theme_dark" };
const DESC_KEYS: Record<ThemeChoice, string> = { auto: "theme_auto_desc", light: "theme_light_desc", dark: "theme_dark_desc" };

export default function ThemePicker() {
  const t = useLanguage();
  const [choice, setChoice] = useState<ThemeChoice>("auto");

  useEffect(() => {
    getThemeChoice().then(setChoice);
  }, []);

  const handleChange = (value: ThemeChoice) => {
    setChoice(value);
    setThemeChoice(value);
  };

  return (
    <ThemeWrapper>
      <label className="theme-section-label">{t("theme_label")}</label>
      <Options>
        {OPTIONS.map((opt) => (
          <Option
            key={opt}
            $active={choice === opt}
            onClick={() => handleChange(opt)}
          >
            <OptionLabel $active={choice === opt}>{t(LABEL_KEYS[opt])}</OptionLabel>
            <OptionDesc>{t(DESC_KEYS[opt])}</OptionDesc>
          </Option>
        ))}
      </Options>
    </ThemeWrapper>
  );
}
