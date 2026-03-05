import type { CharEntry } from '../types';

export interface CombiningMarkGroup {
	name: string;
	marks: CharEntry[];
}

export const DOTTED_CIRCLE = '\u25CC';

export const COMBINING_MARKS: CombiningMarkGroup[] = [
	{
		name: 'Accents',
		marks: [
			['\u0300', 'Combining Grave Accent'],
			['\u0301', 'Combining Acute Accent'],
			['\u0302', 'Combining Circumflex Accent'],
			['\u0303', 'Combining Tilde'],
			['\u0304', 'Combining Macron'],
			['\u0306', 'Combining Breve'],
			['\u0307', 'Combining Dot Above'],
			['\u0308', 'Combining Diaeresis'],
			['\u030A', 'Combining Ring Above'],
			['\u030B', 'Combining Double Acute Accent'],
			['\u030C', 'Combining Caron'],
			['\u030F', 'Combining Double Grave Accent']
		]
	},
	{
		name: 'Below',
		marks: [
			['\u0323', 'Combining Dot Below'],
			['\u0324', 'Combining Diaeresis Below'],
			['\u0325', 'Combining Ring Below'],
			['\u0326', 'Combining Comma Below'],
			['\u0327', 'Combining Cedilla'],
			['\u0328', 'Combining Ogonek'],
			['\u032D', 'Combining Circumflex Accent Below'],
			['\u032E', 'Combining Breve Below'],
			['\u0330', 'Combining Tilde Below'],
			['\u0331', 'Combining Macron Below']
		]
	},
	{
		name: 'Overlay & Strokes',
		marks: [
			['\u0335', 'Combining Short Stroke Overlay'],
			['\u0336', 'Combining Long Stroke Overlay'],
			['\u0337', 'Combining Short Solidus Overlay'],
			['\u0338', 'Combining Long Solidus Overlay']
		]
	},
	{
		name: 'Hooks & Horns',
		marks: [
			['\u0309', 'Combining Hook Above'],
			['\u031B', 'Combining Horn'],
			['\u0312', 'Combining Turned Comma Above'],
			['\u0313', 'Combining Comma Above'],
			['\u0314', 'Combining Reversed Comma Above']
		]
	},
	{
		name: 'Other',
		marks: [
			['\u0310', 'Combining Candrabindu'],
			['\u0311', 'Combining Inverted Breve'],
			['\u0315', 'Combining Comma Above Right'],
			['\u031A', 'Combining Left Angle Above'],
			['\u033D', 'Combining X Above'],
			['\u0334', 'Combining Tilde Overlay'],
			['\u034A', 'Combining Not Tilde Above'],
			['\u034B', 'Combining Homothetic Above'],
			['\u034C', 'Combining Almost Equal To Above'],
			['\u0305', 'Combining Overline'],
			['\u0332', 'Combining Low Line']
		]
	}
];
