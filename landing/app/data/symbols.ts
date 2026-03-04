import type { SymbolCategory } from '../lib/types';

export const SYMBOL_CATEGORIES: SymbolCategory[] = [
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
			['¶', 'paragraph pilcrow']
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
			['₹', 'indian rupee'],
			['₩', 'korean won'],
			['₴', 'ukrainian hryvnia'],
			['₱', 'philippine peso']
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
	}
];

export const DEFAULT_CATEGORIES_SHOWN = 3;
