import { useState, useRef } from 'react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import Root from './char-button.styles';
import { t } from '../../i18n';

import { displayChar } from '../../types';
import type { Props } from './char-button.d';

const CharButton = ({ char, name, onCopy }: Props) => {
	const [copied, setCopied] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

	return (
		<Root $copied={copied} title={`${char} ${name}`} onClick={handleClick}>
			{displayChar(char)}
		</Root>
	);
};

export default CharButton;
