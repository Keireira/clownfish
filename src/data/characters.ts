import type { Category } from '../types';

export const CATEGORIES: Category[] = [
	{
		name: 'Typography',
		chars: [
			['—', 'em dash'],
			['–', 'en dash'],
			['…', 'ellipsis'],
			['«', 'left guillemet quote'],
			['»', 'right guillemet quote'],
			['•', 'bullet'],
			['°', 'degree'],
			['©', 'copyright'],
			['®', 'registered'],
			['™', 'trademark'],
			['§', 'section'],
			['¶', 'paragraph pilcrow'],
			['†', 'dagger'],
			['‡', 'double dagger']
		]
	},
	{
		name: 'Arrows',
		chars: [
			['←', 'left arrow'],
			['→', 'right arrow'],
			['↑', 'up arrow'],
			['↓', 'down arrow'],
			['↔', 'left right arrow'],
			['⇐', 'double left arrow'],
			['⇒', 'double right arrow implies'],
			['⇑', 'double up arrow'],
			['⇓', 'double down arrow'],
			['➜', 'heavy right arrow']
		]
	},
	{
		name: 'Math',
		chars: [
			['±', 'plus minus'],
			['×', 'multiply times'],
			['÷', 'divide'],
			['√', 'square root'],
			['∞', 'infinity'],
			['≈', 'approximately'],
			['≠', 'not equal'],
			['≤', 'less than or equal'],
			['≥', 'greater than or equal'],
			['∑', 'sum sigma'],
			['∏', 'product'],
			['∫', 'integral'],
			['π', 'pi']
		]
	},
	{
		name: 'Currency',
		chars: [
			['$', 'dollar'],
			['€', 'euro'],
			['£', 'pound sterling'],
			['¥', 'yen yuan'],
			['₽', 'ruble'],
			['₿', 'bitcoin'],
			['¢', 'cent'],
			['₹', 'indian rupee'],
			['₩', 'korean won'],
			['₴', 'ukrainian hryvnia'],
			['₺', 'turkish lira'],
			['₱', 'philippine peso'],
			['₫', 'vietnamese dong'],
			['₣', 'french franc'],
			['ƒ', 'florin guilder'],
			['₡', 'colon']
		]
	},
	{
		name: 'Checks & Marks',
		chars: [
			['✓', 'check mark'],
			['✗', 'cross x mark'],
			['☐', 'ballot box empty'],
			['☑', 'ballot box check'],
			['☒', 'ballot box x']
		]
	},
	{
		name: 'Stars & Shapes',
		chars: [
			['★', 'black star filled'],
			['☆', 'white star empty'],
			['♠', 'spade'],
			['♣', 'club'],
			['♥', 'heart'],
			['♦', 'diamond'],
			['●', 'black circle filled'],
			['○', 'white circle empty'],
			['■', 'black square filled'],
			['□', 'white square empty'],
			['▲', 'triangle up'],
			['▼', 'triangle down']
		]
	},
	{
		name: 'Greek',
		chars: [
			['α', 'alpha'],
			['β', 'beta'],
			['γ', 'gamma'],
			['δ', 'delta'],
			['ε', 'epsilon'],
			['θ', 'theta'],
			['λ', 'lambda'],
			['μ', 'mu micro'],
			['σ', 'sigma'],
			['φ', 'phi'],
			['ω', 'omega'],
			['Ω', 'omega capital ohm']
		]
	},
	{
		name: 'Misc',
		chars: [
			['♪', 'music note'],
			['♫', 'music notes beamed'],
			['⌘', 'command cmd'],
			['⌥', 'option alt'],
			['⇧', 'shift'],
			['⌃', 'control ctrl'],
			['⎋', 'escape esc'],
			['⏎', 'return enter'],
			['⌫', 'backspace delete'],
			['⌦', 'forward delete']
		]
	}
];
