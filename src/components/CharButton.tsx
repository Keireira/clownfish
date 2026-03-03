import { useState, useRef } from "react";
import styled from "styled-components";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { t } from "../i18n";
import { displayChar } from "../types";

const Button = styled.button<{ $copied?: boolean }>`
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-s);
  background: ${p => p.$copied ? 'var(--green-bg)' : 'var(--fill-medium)'};
  color: ${p => p.$copied ? 'var(--green)' : 'var(--text-primary)'};
  font-size: 18px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s, border-color 0.15s;
  position: relative;

  &:hover {
    background: var(--fill-active);
    border-color: var(--border-hover);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

interface CharButtonProps {
  char: string;
  name: string;
  onCopy: (message: string) => void;
}

export default function CharButton({ char, name, onCopy }: CharButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = async () => {
    try {
      await writeText(char);
      setCopied(true);
      onCopy(t("copied_char", char));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 600);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Button
      $copied={copied}
      title={`${char} ${name}`}
      onClick={handleClick}
    >
      {displayChar(char)}
    </Button>
  );
}
