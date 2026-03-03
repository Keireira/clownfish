import styled from "styled-components";
import { useLanguage } from "../i18n";

const Wrapper = styled.div`
  margin-bottom: 10px;
  position: relative;
`;

const SearchIcon = styled.svg`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-placeholder);
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px 8px 32px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-m);
  background: var(--fill);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;

  &::placeholder {
    color: var(--text-placeholder);
  }

  &:focus {
    border-color: var(--accent-border);
  }
`;

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const t = useLanguage();
  return (
    <Wrapper>
      <SearchIcon width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
      </SearchIcon>
      <Input
        type="text"
        placeholder={t("search_placeholder")}
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Wrapper>
  );
}
