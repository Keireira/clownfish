import type { Category } from '../types';

export const CATEGORIES: Category[] = [
	{
		name: 'Typography',
		chars: [
			['\u2014', 'em dash'],
			['\u2013', 'en dash'],
			['\u2026', 'ellipsis'],
			['\u00AB', 'left guillemet quote'],
			['\u00BB', 'right guillemet quote'],
			['\u2022', 'bullet'],
			['\u00B0', 'degree'],
			['\u00A9', 'copyright'],
			['\u00AE', 'registered'],
			['\u2122', 'trademark'],
			['\u00A7', 'section'],
			['\u00B6', 'paragraph pilcrow'],
			['\u2020', 'dagger'],
			['\u2021', 'double dagger']
		]
	},
	{
		name: 'Arrows',
		chars: [
			['\u2190', 'left arrow'],
			['\u2192', 'right arrow'],
			['\u2191', 'up arrow'],
			['\u2193', 'down arrow'],
			['\u2194', 'left right arrow'],
			['\u21D0', 'double left arrow'],
			['\u21D2', 'double right arrow implies'],
			['\u21D1', 'double up arrow'],
			['\u21D3', 'double down arrow'],
			['\u279C', 'heavy right arrow']
		]
	},
	{
		name: 'Math',
		chars: [
			['\u00B1', 'plus minus'],
			['\u00D7', 'multiply times'],
			['\u00F7', 'divide'],
			['\u221A', 'square root'],
			['\u221E', 'infinity'],
			['\u2248', 'approximately'],
			['\u2260', 'not equal'],
			['\u2264', 'less than or equal'],
			['\u2265', 'greater than or equal'],
			['\u2211', 'sum sigma'],
			['\u220F', 'product'],
			['\u222B', 'integral'],
			['\u03C0', 'pi']
		]
	},
	{
		name: 'Currency',
		chars: [
			['$', 'dollar'],
			['\u20AC', 'euro'],
			['\u00A3', 'pound sterling'],
			['\u00A5', 'yen yuan'],
			['\u20BD', 'ruble'],
			['\u20BF', 'bitcoin'],
			['\u00A2', 'cent'],
			['\u20B9', 'indian rupee'],
			['\u20A9', 'korean won'],
			['\u20B4', 'ukrainian hryvnia'],
			['\u20BA', 'turkish lira'],
			['\u20B1', 'philippine peso'],
			['\u20AB', 'vietnamese dong'],
			['\u20A3', 'french franc'],
			['\u0192', 'florin guilder'],
			['\u20A1', 'colon']
		]
	},
	{
		name: 'Checks & Marks',
		chars: [
			['\u2713', 'check mark'],
			['\u2717', 'cross x mark'],
			['\u2610', 'ballot box empty'],
			['\u2611', 'ballot box check'],
			['\u2612', 'ballot box x']
		]
	},
	{
		name: 'Stars & Shapes',
		chars: [
			['\u2605', 'black star filled'],
			['\u2606', 'white star empty'],
			['\u2660', 'spade'],
			['\u2663', 'club'],
			['\u2665', 'heart'],
			['\u2666', 'diamond'],
			['\u25CF', 'black circle filled'],
			['\u25CB', 'white circle empty'],
			['\u25A0', 'black square filled'],
			['\u25A1', 'white square empty'],
			['\u25B2', 'triangle up'],
			['\u25BC', 'triangle down']
		]
	},
	{
		name: 'Greek',
		chars: [
			['\u03B1', 'alpha'],
			['\u03B2', 'beta'],
			['\u03B3', 'gamma'],
			['\u03B4', 'delta'],
			['\u03B5', 'epsilon'],
			['\u03B8', 'theta'],
			['\u03BB', 'lambda'],
			['\u03BC', 'mu micro'],
			['\u03C3', 'sigma'],
			['\u03C6', 'phi'],
			['\u03C9', 'omega'],
			['\u03A9', 'omega capital ohm']
		]
	},
	{
		name: 'Misc',
		chars: [
			['\u266A', 'music note'],
			['\u266B', 'music notes beamed'],
			['\u2318', 'command cmd'],
			['\u2325', 'option alt'],
			['\u21E7', 'shift'],
			['\u2303', 'control ctrl'],
			['\u238B', 'escape esc'],
			['\u23CE', 'return enter'],
			['\u232B', 'backspace delete'],
			['\u2326', 'forward delete']
		]
	}
];
