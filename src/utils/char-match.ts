/**
 * Resolve a code-notation query to a Unicode character.
 * Supports: U+2603, &#9731;, &#x2603;, \u2603
 */
function resolveCode(q: string): string | null {
	let m: RegExpMatchArray | null;

	// U+XXXX
	m = q.match(/^u\+([0-9a-f]{1,6})$/i);
	if (m) return safeFromCode(parseInt(m[1], 16));

	// &#xHHHH; (hex HTML entity)
	m = q.match(/^&#x([0-9a-f]{1,6});?$/i);
	if (m) return safeFromCode(parseInt(m[1], 16));

	// &#NNNN; (decimal HTML entity)
	m = q.match(/^&#(\d{1,7});?$/);
	if (m) return safeFromCode(parseInt(m[1], 10));

	// \uHHHH
	m = q.match(/^\\u([0-9a-f]{4,6})$/i);
	if (m) return safeFromCode(parseInt(m[1], 16));

	return null;
}

function safeFromCode(cp: number): string | null {
	try {
		if (cp > 0 && cp <= 0x10ffff) return String.fromCodePoint(cp);
	} catch {
		/* invalid code point */
	}
	return null;
}

/** Check if a character matches a search query (name, char, or code notation). */
export function charMatchesQuery(char: string, name: string, query: string): boolean {
	const q = query.toLowerCase().trim();
	if (!q) return true;

	// Standard text match
	if (char.includes(q) || name.toLowerCase().includes(q)) return true;

	// Code-based match
	const resolved = resolveCode(q);
	if (resolved && char === resolved) return true;

	return false;
}
