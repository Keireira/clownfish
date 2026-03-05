import { useState, useRef, useCallback } from 'react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import Root from './char-button.styles';
import { useCharPreview } from '../char-preview';
import { t } from '../../i18n';

import { displayChar } from '../../types';
import type { Props } from './char-button.d';

const CharButton = ({ char, name, onCopy, onAddShortcut }: Props) => {
	const [copied, setCopied] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const { show, hide } = useCharPreview();

	const handleClick = async () => {
		try {
			await writeText(char);
			setCopied(true);
			onCopy(t('copied_char', char));
			if (timer.current) clearTimeout(timer.current);
			timer.current = setTimeout(() => setCopied(false), 600);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	const handleMouseEnter = useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			show(char, name, e.currentTarget.getBoundingClientRect(), !onAddShortcut);
		},
		[char, name, show, onAddShortcut]
	);

	const handleMouseLeave = useCallback(() => {
		hide();
	}, [hide]);

	const handleContextMenu = useCallback(
		(e: React.MouseEvent) => {
			if (!onAddShortcut) return;
			e.preventDefault();
			onAddShortcut(char, name);
		},
		[char, name, onAddShortcut]
	);

	return (
		<Root
			$copied={copied}
			onClick={handleClick}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onContextMenu={handleContextMenu}
		>
			{displayChar(char)}
		</Root>
	);
};

export default CharButton;
