export interface UnicodeInfo {
	codePoint: number;
	uPlus: string;
	htmlDec: string;
	htmlHex: string;
	htmlNamed: string | null;
	css: string;
	js: string;
	utf8: string;
	blockName: string;
}

// ~100 common HTML named entities
const NAMED_ENTITIES: Record<number, string> = {
	// Latin
	0x00c0: 'Agrave', 0x00c1: 'Aacute', 0x00c2: 'Acirc', 0x00c3: 'Atilde', 0x00c4: 'Auml', 0x00c5: 'Aring',
	0x00c6: 'AElig', 0x00c7: 'Ccedil', 0x00c8: 'Egrave', 0x00c9: 'Eacute', 0x00ca: 'Ecirc', 0x00cb: 'Euml',
	0x00cc: 'Igrave', 0x00cd: 'Iacute', 0x00ce: 'Icirc', 0x00cf: 'Iuml', 0x00d1: 'Ntilde',
	0x00d2: 'Ograve', 0x00d3: 'Oacute', 0x00d4: 'Ocirc', 0x00d5: 'Otilde', 0x00d6: 'Ouml', 0x00d8: 'Oslash',
	0x00d9: 'Ugrave', 0x00da: 'Uacute', 0x00db: 'Ucirc', 0x00dc: 'Uuml', 0x00dd: 'Yacute', 0x00df: 'szlig',
	0x00e0: 'agrave', 0x00e1: 'aacute', 0x00e2: 'acirc', 0x00e3: 'atilde', 0x00e4: 'auml', 0x00e5: 'aring',
	0x00e6: 'aelig', 0x00e7: 'ccedil', 0x00e8: 'egrave', 0x00e9: 'eacute', 0x00ea: 'ecirc', 0x00eb: 'euml',
	0x00ec: 'igrave', 0x00ed: 'iacute', 0x00ee: 'icirc', 0x00ef: 'iuml', 0x00f1: 'ntilde',
	0x00f2: 'ograve', 0x00f3: 'oacute', 0x00f4: 'ocirc', 0x00f5: 'otilde', 0x00f6: 'ouml', 0x00f8: 'oslash',
	0x00f9: 'ugrave', 0x00fa: 'uacute', 0x00fb: 'ucirc', 0x00fc: 'uuml', 0x00fd: 'yacute', 0x00ff: 'yuml',
	// Common symbols
	0x0026: 'amp', 0x003c: 'lt', 0x003e: 'gt', 0x0022: 'quot', 0x0027: 'apos',
	0x00a0: 'nbsp', 0x00a1: 'iexcl', 0x00a2: 'cent', 0x00a3: 'pound', 0x00a4: 'curren',
	0x00a5: 'yen', 0x00a6: 'brvbar', 0x00a7: 'sect', 0x00a9: 'copy', 0x00ab: 'laquo',
	0x00ac: 'not', 0x00ae: 'reg', 0x00b0: 'deg', 0x00b1: 'plusmn', 0x00b5: 'micro',
	0x00b6: 'para', 0x00b7: 'middot', 0x00bb: 'raquo', 0x00bf: 'iquest', 0x00d7: 'times', 0x00f7: 'divide',
	// Typography
	0x2013: 'ndash', 0x2014: 'mdash', 0x2018: 'lsquo', 0x2019: 'rsquo',
	0x201c: 'ldquo', 0x201d: 'rdquo', 0x2020: 'dagger', 0x2021: 'Dagger',
	0x2022: 'bull', 0x2026: 'hellip', 0x2030: 'permil', 0x2032: 'prime', 0x2033: 'Prime',
	0x2039: 'lsaquo', 0x203a: 'rsaquo', 0x2044: 'frasl', 0x20ac: 'euro', 0x2122: 'trade',
	// Arrows
	0x2190: 'larr', 0x2191: 'uarr', 0x2192: 'rarr', 0x2193: 'darr', 0x2194: 'harr',
	0x21b5: 'crarr', 0x21d0: 'lArr', 0x21d1: 'uArr', 0x21d2: 'rArr', 0x21d3: 'dArr', 0x21d4: 'hArr',
	// Math
	0x2200: 'forall', 0x2202: 'part', 0x2203: 'exist', 0x2205: 'empty', 0x2207: 'nabla',
	0x2208: 'isin', 0x2209: 'notin', 0x220b: 'ni', 0x220f: 'prod', 0x2211: 'sum',
	0x2212: 'minus', 0x2217: 'lowast', 0x221a: 'radic', 0x221d: 'prop', 0x221e: 'infin',
	0x2220: 'ang', 0x2227: 'and', 0x2228: 'or', 0x2229: 'cap', 0x222a: 'cup',
	0x222b: 'int', 0x2234: 'there4', 0x223c: 'sim', 0x2245: 'cong', 0x2248: 'asymp',
	0x2260: 'ne', 0x2261: 'equiv', 0x2264: 'le', 0x2265: 'ge', 0x2282: 'sub',
	0x2283: 'sup', 0x2284: 'nsub', 0x2286: 'sube', 0x2287: 'supe', 0x2295: 'oplus',
	0x2297: 'otimes', 0x22a5: 'perp', 0x22c5: 'sdot',
	// Greek uppercase
	0x0391: 'Alpha', 0x0392: 'Beta', 0x0393: 'Gamma', 0x0394: 'Delta', 0x0395: 'Epsilon',
	0x0396: 'Zeta', 0x0397: 'Eta', 0x0398: 'Theta', 0x0399: 'Iota', 0x039a: 'Kappa',
	0x039b: 'Lambda', 0x039c: 'Mu', 0x039d: 'Nu', 0x039e: 'Xi', 0x039f: 'Omicron',
	0x03a0: 'Pi', 0x03a1: 'Rho', 0x03a3: 'Sigma', 0x03a4: 'Tau', 0x03a5: 'Upsilon',
	0x03a6: 'Phi', 0x03a7: 'Chi', 0x03a8: 'Psi', 0x03a9: 'Omega',
	// Greek lowercase
	0x03b1: 'alpha', 0x03b2: 'beta', 0x03b3: 'gamma', 0x03b4: 'delta', 0x03b5: 'epsilon',
	0x03b6: 'zeta', 0x03b7: 'eta', 0x03b8: 'theta', 0x03b9: 'iota', 0x03ba: 'kappa',
	0x03bb: 'lambda', 0x03bc: 'mu', 0x03bd: 'nu', 0x03be: 'xi', 0x03bf: 'omicron',
	0x03c0: 'pi', 0x03c1: 'rho', 0x03c2: 'sigmaf', 0x03c3: 'sigma', 0x03c4: 'tau',
	0x03c5: 'upsilon', 0x03c6: 'phi', 0x03c7: 'chi', 0x03c8: 'psi', 0x03c9: 'omega',
	// Misc symbols
	0x2660: 'spades', 0x2663: 'clubs', 0x2665: 'hearts', 0x2666: 'diams',
	0x25ca: 'loz', 0x2318: 'loz',
};

// Major Unicode blocks sorted by start code point
const UNICODE_BLOCKS: [number, number, string][] = [
	[0x0000, 0x007f, 'Basic Latin'],
	[0x0080, 0x00ff, 'Latin-1 Supplement'],
	[0x0100, 0x017f, 'Latin Extended-A'],
	[0x0180, 0x024f, 'Latin Extended-B'],
	[0x0250, 0x02af, 'IPA Extensions'],
	[0x02b0, 0x02ff, 'Spacing Modifier Letters'],
	[0x0300, 0x036f, 'Combining Diacritical Marks'],
	[0x0370, 0x03ff, 'Greek and Coptic'],
	[0x0400, 0x04ff, 'Cyrillic'],
	[0x0500, 0x052f, 'Cyrillic Supplement'],
	[0x0530, 0x058f, 'Armenian'],
	[0x0590, 0x05ff, 'Hebrew'],
	[0x0600, 0x06ff, 'Arabic'],
	[0x0900, 0x097f, 'Devanagari'],
	[0x0e00, 0x0e7f, 'Thai'],
	[0x1000, 0x109f, 'Myanmar'],
	[0x10a0, 0x10ff, 'Georgian'],
	[0x1100, 0x11ff, 'Hangul Jamo'],
	[0x1e00, 0x1eff, 'Latin Extended Additional'],
	[0x1f00, 0x1fff, 'Greek Extended'],
	[0x2000, 0x206f, 'General Punctuation'],
	[0x2070, 0x209f, 'Superscripts and Subscripts'],
	[0x20a0, 0x20cf, 'Currency Symbols'],
	[0x20d0, 0x20ff, 'Combining Diacritical Marks for Symbols'],
	[0x2100, 0x214f, 'Letterlike Symbols'],
	[0x2150, 0x218f, 'Number Forms'],
	[0x2190, 0x21ff, 'Arrows'],
	[0x2200, 0x22ff, 'Mathematical Operators'],
	[0x2300, 0x23ff, 'Miscellaneous Technical'],
	[0x2400, 0x243f, 'Control Pictures'],
	[0x2440, 0x245f, 'Optical Character Recognition'],
	[0x2460, 0x24ff, 'Enclosed Alphanumerics'],
	[0x2500, 0x257f, 'Box Drawing'],
	[0x2580, 0x259f, 'Block Elements'],
	[0x25a0, 0x25ff, 'Geometric Shapes'],
	[0x2600, 0x26ff, 'Miscellaneous Symbols'],
	[0x2700, 0x27bf, 'Dingbats'],
	[0x27c0, 0x27ef, 'Miscellaneous Mathematical Symbols-A'],
	[0x27f0, 0x27ff, 'Supplemental Arrows-A'],
	[0x2800, 0x28ff, 'Braille Patterns'],
	[0x2900, 0x297f, 'Supplemental Arrows-B'],
	[0x2980, 0x29ff, 'Miscellaneous Mathematical Symbols-B'],
	[0x2e80, 0x2eff, 'CJK Radicals Supplement'],
	[0x3000, 0x303f, 'CJK Symbols and Punctuation'],
	[0x3040, 0x309f, 'Hiragana'],
	[0x30a0, 0x30ff, 'Katakana'],
	[0x3100, 0x312f, 'Bopomofo'],
	[0x3130, 0x318f, 'Hangul Compatibility Jamo'],
	[0x4e00, 0x9fff, 'CJK Unified Ideographs'],
	[0xa000, 0xa48f, 'Yi Syllables'],
	[0xac00, 0xd7af, 'Hangul Syllables'],
	[0xf900, 0xfaff, 'CJK Compatibility Ideographs'],
	[0xfb00, 0xfb06, 'Alphabetic Presentation Forms'],
	[0xfe30, 0xfe4f, 'CJK Compatibility Forms'],
	[0xff00, 0xffef, 'Halfwidth and Fullwidth Forms'],
	[0x1f300, 0x1f5ff, 'Miscellaneous Symbols and Pictographs'],
	[0x1f600, 0x1f64f, 'Emoticons'],
	[0x1f680, 0x1f6ff, 'Transport and Map Symbols'],
	[0x1f900, 0x1f9ff, 'Supplemental Symbols and Pictographs'],
];

function lookupBlock(cp: number): string {
	let lo = 0;
	let hi = UNICODE_BLOCKS.length - 1;
	while (lo <= hi) {
		const mid = (lo + hi) >>> 1;
		const [start, end] = UNICODE_BLOCKS[mid];
		if (cp < start) hi = mid - 1;
		else if (cp > end) lo = mid + 1;
		else return UNICODE_BLOCKS[mid][2];
	}
	return 'Unknown';
}

export function toUtf8Bytes(cp: number): number[] {
	if (cp <= 0x7f) return [cp];
	if (cp <= 0x7ff) return [0xc0 | (cp >> 6), 0x80 | (cp & 0x3f)];
	if (cp <= 0xffff) return [0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f)];
	return [0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f)];
}

export function getUnicodeInfo(char: string): UnicodeInfo {
	const cp = char.codePointAt(0)!;
	const hex = cp.toString(16).toUpperCase();
	const paddedHex = hex.length < 4 ? hex.padStart(4, '0') : hex;

	const named = NAMED_ENTITIES[cp];
	const utf8Bytes = toUtf8Bytes(cp);

	return {
		codePoint: cp,
		uPlus: `U+${paddedHex}`,
		htmlDec: `&#${cp};`,
		htmlHex: `&#x${paddedHex};`,
		htmlNamed: named ? `&${named};` : null,
		css: `\\${hex}`,
		js: cp > 0xffff ? `\\u{${hex}}` : `\\u${paddedHex}`,
		utf8: utf8Bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' '),
		blockName: lookupBlock(cp),
	};
}
