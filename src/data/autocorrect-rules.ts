import type { AutoCorrectRule } from '../types';

export const DEFAULT_AUTOCORRECT_RULES: AutoCorrectRule[] = [
	{ pattern: '--', replacement: '\u2014' },
	{ pattern: '...', replacement: '\u2026' },
	{ pattern: '1/2', replacement: '\u00BD' },
	{ pattern: '1/4', replacement: '\u00BC' },
	{ pattern: '3/4', replacement: '\u00BE' },
	{ pattern: '->', replacement: '\u2192' },
	{ pattern: '<-', replacement: '\u2190' },
	{ pattern: '=>', replacement: '\u21D2' }
];
