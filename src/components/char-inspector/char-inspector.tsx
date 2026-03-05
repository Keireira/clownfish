import { useMemo } from 'react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { getUnicodeInfo } from '../../utils/unicode-info';
import { useLanguage } from '../../i18n';
import Root, {
	Card, Header, CharDisplay, HeaderInfo, CharName, BlockBadge,
	Body, Row, Label, Value, CopyBtn
} from './char-inspector.styles';
import type { CharInspectorProps } from './char-inspector.d';

const CharInspector = ({ char, name, onCopy }: CharInspectorProps) => {
	const t = useLanguage();
	const info = useMemo(() => getUnicodeInfo(char), [char]);

	const copy = (label: string, value: string) => {
		writeText(value).then(() => {
			onCopy(t('inspector_copied', label) as string);
		});
	};

	const rows: [string, string][] = [
		['Code point', info.uPlus],
		['HTML dec', info.htmlDec],
		['HTML hex', info.htmlHex],
		...(info.htmlNamed ? [['HTML named', info.htmlNamed] as [string, string]] : []),
		['CSS', info.css],
		['JS', info.js],
		['UTF-8', info.utf8],
	];

	return (
		<Root>
			<Card>
				<Header>
					<CharDisplay>{char}</CharDisplay>
					<HeaderInfo>
						<CharName>{name}</CharName>
						<BlockBadge>{info.blockName}</BlockBadge>
					</HeaderInfo>
				</Header>
				<Body>
					{rows.map(([label, value]) => (
						<Row key={label}>
							<Label>{label}</Label>
							<Value>{value}</Value>
							<CopyBtn onClick={() => copy(label, value)} title="Copy">
								⧉
							</CopyBtn>
						</Row>
					))}
				</Body>
			</Card>
		</Root>
	);
};

export default CharInspector;
