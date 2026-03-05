import type { Shortcut } from '../types';

/** Default text expansion shortcuts that ship with the app. */
export const DEFAULT_SHORTCUTS: Shortcut[] = [
	// Typography
	{ trigger: ':...:', expansion: '…' },
	{ trigger: ':--:', expansion: '—' },
	{ trigger: ':c:', expansion: '©' },
	{ trigger: ':r:', expansion: '®' },
	{ trigger: ':tm:', expansion: '™' },
	{ trigger: ':deg:', expansion: '°' },

	// Math
	{ trigger: ':pm:', expansion: '±' },
	{ trigger: ':times:', expansion: '×' },
	{ trigger: ':div:', expansion: '÷' },
	{ trigger: ':sqrt:', expansion: '√' },
	{ trigger: ':inf:', expansion: '∞' },
	{ trigger: ':approx:', expansion: '≈' },
	{ trigger: ':neq:', expansion: '≠' },
	{ trigger: ':leq:', expansion: '≤' },
	{ trigger: ':geq:', expansion: '≥' },
	{ trigger: ':pi:', expansion: 'π' },

	// Currency
	{ trigger: ':euro:', expansion: '€' },
	{ trigger: ':pound:', expansion: '£' },
	{ trigger: ':yen:', expansion: '¥' },
	{ trigger: ':ruble:', expansion: '₽' },

	// Greek
	{ trigger: ':alpha:', expansion: 'α' },
	{ trigger: ':beta:', expansion: 'β' },
	{ trigger: ':gamma:', expansion: 'γ' },
	{ trigger: ':delta:', expansion: 'δ' },
	{ trigger: ':lambda:', expansion: 'λ' },
	{ trigger: ':omega:', expansion: 'ω' },
	{ trigger: ':om:', expansion: 'Ω' },

	{ trigger: ':чуров:', expansion: '146%' }
];
